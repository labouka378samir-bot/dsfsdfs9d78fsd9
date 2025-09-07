import { supabase, createServiceClient } from '../lib/supabase';
import { Order, CartItem, PaymentResult } from '../types';
import toast from 'react-hot-toast';

export interface PaymentData {
  method: 'paypal' | 'crypto' | 'edahabia';
  amount: number;
  currency: 'USD' | 'DZD';
  customerEmail: string;
  customerPhone?: string;
  items: CartItem[];
  userId?: string;
}

export interface CryptoPaymentData {
  currency: string;
  amount: number;
  order_id: string;
  order_description: string;
  ipn_callback_url: string;
  success_url: string;
  cancel_url: string;
}

export interface ChargilyPaymentData {
  amount: number;
  currency: 'dzd';
  description: string;
  success_url: string;
  failure_url: string;
  webhook_endpoint: string;
  metadata: {
    order_id: string;
    customer_email: string;
  };
}

class PaymentService {
  private static instance: PaymentService;
  
  private constructor() {}
  
  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  // Create order in database
  async createOrder(paymentData: PaymentData): Promise<Order | null> {
    try {
      const orderNumber = this.generateOrderNumber();
      const subtotal = paymentData.items.reduce((sum, item) => {
        const product = item.product!;
        const price = paymentData.currency === 'USD' ? product.price_usd : 
          product.price_dzd || (product.price_usd * 250); // fallback exchange rate
        return sum + (price * item.quantity);
      }, 0);

      const taxAmount = subtotal * 0; // No tax for now
      const totalAmount = subtotal + taxAmount;

      // Use the service role client to bypass RLS policies on insertion
      const adminClient = createServiceClient();
      // Create order
      const { data: order, error: orderError } = await adminClient
        .from('orders')
        .insert({
          user_id: paymentData.userId || null,
          order_number: orderNumber,
          status: 'pending',
          payment_method: paymentData.method,
          currency: paymentData.currency,
          subtotal,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          customer_email: paymentData.customerEmail,
          customer_phone: paymentData.customerPhone,
          payment_data: {}
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = paymentData.items.map(item => {
        const product = item.product!;
        const price = paymentData.currency === 'USD' ? product.price_usd : 
          product.price_dzd || (product.price_usd * 250);
        
        return {
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: price,
          total_price: price * item.quantity,
          delivery_status: 'pending'
        };
      });

      const { error: itemsError } = await adminClient
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order;
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
      return null;
    }
  }

  // PayPal Payment
  async processPayPalPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      // PayPal always uses USD - convert if needed
      let paypalAmount = paymentData.amount;
      let paypalCurrency = 'USD';
      
      if (paymentData.currency === 'DZD') {
        // Convert DZD to USD for PayPal
        paypalAmount = paymentData.amount / 250; // 1$ = 250 DZD
        paypalCurrency = 'USD';
      }
      
      const order = await this.createOrder(paymentData);
      if (!order) throw new Error('Failed to create order');

      // PayPal API integration
      // Support both VITE_ prefixed and non-prefixed environment variables for PayPal credentials
      const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || import.meta.env.PAYPAL_CLIENT_ID;
      const paypalClientSecret = import.meta.env.VITE_PAYPAL_CLIENT_SECRET || import.meta.env.PAYPAL_SECRET;
      const paypalApiUrl = import.meta.env.VITE_PAYPAL_API_URL || import.meta.env.PAYPAL_API_URL || 'https://api-m.paypal.com';

      // Validate PayPal credentials
      if (!paypalClientId || !paypalClientSecret) {
        throw new Error('PayPal credentials not configured. Please provide PAYPAL_CLIENT_ID and PAYPAL_SECRET in your .env file.');
      }

      console.log('Creating PayPal payment for order:', order.order_number);

      // Get PayPal access token
      const tokenResponse = await fetch(`${paypalApiUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en_US',
          'Authorization': `Basic ${btoa(`${paypalClientId}:${paypalClientSecret}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('PayPal token error:', errorText);
        throw new Error('Failed to get PayPal access token');
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Create PayPal order
      const createOrderResponse = await fetch(`${paypalApiUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'PayPal-Request-Id': order.order_number
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            reference_id: order.order_number,
            amount: {
              currency_code: paypalCurrency,
              value: paypalAmount.toFixed(2)
            },
            description: `Order ${order.order_number} - ATHMANEBZN Store`
          }],
          application_context: {
            return_url: `${window.location.origin}/order-success?order=${order.id}`,
            cancel_url: `${window.location.origin}/cart`,
            brand_name: 'ATHMANEBZN STORE',
            user_action: 'PAY_NOW',
            shipping_preference: 'NO_SHIPPING'
          }
        })
      });

      if (!createOrderResponse.ok) {
        const errorText = await createOrderResponse.text();
        console.error('PayPal create order error:', errorText);
        throw new Error('Failed to create PayPal order');
      }

      const paypalOrder = await createOrderResponse.json();
      const approvalUrl = paypalOrder.links.find((link: any) => link.rel === 'approve')?.href;

      if (!approvalUrl) {
        throw new Error('PayPal approval URL not found');
      }
      
      // Update order with payment info using admin client (to bypass RLS)
      const adminClient = createServiceClient();
      await adminClient
        .from('orders')
        .update({
          status: 'pending',
          payment_id: paypalOrder.id,
          payment_data: { 
            paypal_order_id: paypalOrder.id,
            payment_method: 'paypal',
            approval_url: approvalUrl,
            processed_at: new Date().toISOString()
          }
        })
        .eq('id', order.id);

      // Redirect to PayPal for approval
      window.location.href = approvalUrl;

      toast.success('Redirecting to PayPal...');
      
      return {
        success: true,
        order_id: order.id,
        payment_id: paypalOrder.id,
        redirect_url: approvalUrl
      };
    } catch (error: any) {
      console.error('PayPal payment error:', error);
      toast.error(`PayPal payment failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Crypto Payment (NOWPayments)
  async processCryptoPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      // Crypto always uses USD - convert if needed
      let cryptoAmount = paymentData.amount;
      let cryptoCurrency = 'USD';
      
      if (paymentData.currency === 'DZD') {
        // Convert DZD to USD for Crypto
        cryptoAmount = paymentData.amount / 250; // 1$ = 250 DZD
        cryptoCurrency = 'USD';
      }
      
      const order = await this.createOrder(paymentData);
      if (!order) throw new Error('Failed to create order');

      // Resolve environment variables for NOWPayments API key
      const nowPaymentsApiKey = import.meta.env.VITE_NOWPAYMENTS_API_KEY || import.meta.env.NOWPAYMENTS_API_KEY;
      const nowPaymentsApiUrl = import.meta.env.VITE_NOWPAYMENTS_API_URL || import.meta.env.NOWPAYMENTS_API_URL || 'https://api.nowpayments.io/v1';
      
      console.log('Creating crypto payment for order:', order.order_number);

      if (!nowPaymentsApiKey) {
        throw new Error('NOWPayments API key not configured. Please provide NOWPAYMENTS_API_KEY in your .env file.');
      }

      // Ensure the amount meets NOWPayments minimum (~$3) to avoid estimate errors
      if (cryptoAmount < 3) {
        cryptoAmount = 3;
      }

      // Determine pay currency for NOWPayments
      // Use a network-specific USDT ticker supported by NOWPayments.  Generic "usdt" is not valid for estimates, so default
      // to Tron network USDT ("usdttrc20").  You can change this to other supported tickers such as "usdterc20" or "usdcerc20"
      // depending on your configured payout wallets.
      const payCurrency = 'usdttrc20';

      // Create NOWPayments payment
      const paymentRequest = {
        price_amount: cryptoAmount,
        price_currency: cryptoCurrency.toLowerCase(),
        pay_currency: payCurrency,
        order_id: order.order_number,
        order_description: `Order ${order.order_number} - ATHMANEBZN Store`,
        ipn_callback_url: `${window.location.origin}/api/crypto-webhook`,
        success_url: `${window.location.origin}/order-success?order=${order.id}`,
        cancel_url: `${window.location.origin}/cart`
      };

      // Use the invoice endpoint to receive an invoice_url for redirecting the user
      const response = await fetch(`${nowPaymentsApiUrl}/invoice`, {
        method: 'POST',
        headers: {
          'x-api-key': nowPaymentsApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentRequest)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('NOWPayments error:', errorData);
        throw new Error(`NOWPayments API error: ${errorData.message || 'Unknown error'}`);
      }

      const paymentData_response = await response.json();
      
      // Update order using admin client to bypass RLS
      const adminClient = createServiceClient();
      await adminClient
        .from('orders')
        .update({
          payment_id: paymentData_response.payment_id,
          payment_data: { 
            payment_id: paymentData_response.payment_id,
            payment_url: paymentData_response.invoice_url,
            pay_address: paymentData_response.pay_address,
            pay_amount: paymentData_response.pay_amount,
            pay_currency: paymentData_response.pay_currency,
            payment_method: 'crypto',
            created_at: new Date().toISOString()
          }
        })
        .eq('id', order.id);

      // Redirect to payment page
      if (paymentData_response.invoice_url) {
        try {
          // Attempt to open in the same tab first
          window.location.href = paymentData_response.invoice_url;
        } catch (_) {
          // Fallback: open in a new tab to avoid cross-origin restrictions
          window.open(paymentData_response.invoice_url, '_blank');
        }
      }

      toast.success('Redirecting to crypto payment...');
      
      return {
        success: true,
        order_id: order.id,
        payment_id: paymentData_response.payment_id,
        redirect_url: paymentData_response.invoice_url
      };
    } catch (error: any) {
      console.error('Crypto payment error:', error);
      toast.error(`Crypto payment failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Edahabia/CIB Payment (Algerian payment gateway)
  async processEdahabiaPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      // Edahabia always uses DZD - convert if needed
      let edahabiaAmount = paymentData.amount;
      
      if (paymentData.currency === 'USD') {
        // Convert USD to DZD for Edahabia
        edahabiaAmount = paymentData.amount * 250; // 1$ = 250 DZD
      }
      
      const order = await this.createOrder(paymentData);
      if (!order) throw new Error('Failed to create order');

      // Resolve environment variables for Chargily
      const chargilyApiKey = import.meta.env.VITE_CHARGILY_API_KEY || import.meta.env.CHARGILY_API_KEY;
      const chargilyApiUrl = import.meta.env.VITE_CHARGILY_API_URL || import.meta.env.CHARGILY_API_URL || 'https://pay.chargily.com/api/v2';
      
      console.log('Creating Edahabia payment for order:', order.order_number);

      if (!chargilyApiKey) {
        throw new Error('Chargily API key not configured. Please provide CHARGILY_API_KEY in your .env file.');
      }

      // Create Chargily payment
      const paymentRequest: ChargilyPaymentData = {
        // Chargily API expects the amount in DZD, not in centimes. Send the plain dinar value.
        amount: Math.round(edahabiaAmount),
        currency: 'dzd',
        description: `Order ${order.order_number} - ATHMANEBZN Store`,
        success_url: `${window.location.origin}/order-success?order=${order.id}`,
        failure_url: `${window.location.origin}/cart`,
        webhook_endpoint: `${window.location.origin}/api/chargily-webhook`,
        metadata: {
          order_id: order.id,
          customer_email: paymentData.customerEmail
        }
      };

      const response = await fetch(`${chargilyApiUrl}/checkouts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${chargilyApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentRequest)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Chargily error:', errorData);
        throw new Error(`Chargily API error: ${errorData.message || 'Unknown error'}`);
      }

      const chargilyResponse = await response.json();
      
      // Update order with payment info using admin client to bypass RLS
      const adminClient = createServiceClient();
      await adminClient
        .from('orders')
        .update({
          status: 'pending',
          payment_id: chargilyResponse.id,
          payment_data: { 
            checkout_id: chargilyResponse.id,
            checkout_url: chargilyResponse.checkout_url,
            payment_method: 'edahabia',
            amount_dzd: edahabiaAmount,
            created_at: new Date().toISOString()
          }
        })
        .eq('id', order.id);

      // Redirect to Chargily checkout
      if (chargilyResponse.checkout_url) {
        window.location.href = chargilyResponse.checkout_url;
      }

      toast.success('Redirecting to Edahabia payment...');
        
      return {
        success: true,
        order_id: order.id,
        payment_id: chargilyResponse.id || 'chargily_payment',
        redirect_url: chargilyResponse.checkout_url
      };
    } catch (error: any) {
      console.error('Edahabia payment error:', error);
      toast.error(`Edahabia/CIB payment failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Process order fulfillment
  private async processFulfillment(orderId: string): Promise<void> {
    try {
      // Use service client for fulfillment updates
      const adminClient = createServiceClient();
      // Get order items
      const { data: orderItems, error } = await adminClient
        .from('order_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('order_id', orderId);

      if (error) throw error;

      // Get order details for notification
      const { data: order } = await adminClient
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      for (const item of orderItems || []) {
        const product = item.product;
        
        if (!product) {
          console.warn(`Product not found for order item ${item.id}`);
          continue;
        }
        
        if (product.fulfillment_type === 'auto') {
          // Get available code for this product
          const { data: code, error: codeError } = await adminClient
            .from('codes')
            .select('*')
            .eq('product_id', product.id)
            .eq('is_used', false)
            .limit(1)
            .single();

          if (!codeError && code) {
            // Mark code as used and assign to order item
            await adminClient
              .from('codes')
              .update({
                is_used: true,
                used_at: new Date().toISOString(),
                order_item_id: item.id
              })
              .eq('id', code.id);

            // Update order item with delivery code
            await adminClient
              .from('order_items')
              .update({
                delivery_code: code.code,
                delivery_status: 'delivered',
                delivered_at: new Date().toISOString()
              })
              .eq('id', item.id);

            // Reduce stock
          }
        } else {
          // Manual fulfillment - no stock reduction needed
        }
      }

      // Send Telegram notification for new order
      if (order) {
        await this.sendTelegramNotification(order, orderItems || []);
      }
      // Send email notification (simulated)
      console.log(`Order ${orderId} fulfilled successfully`);
      
    } catch (error: any) {
      console.error('Error processing fulfillment:', error);
    }
  }

  // Send Telegram notification for new orders
  private async sendTelegramNotification(order: any, orderItems: any[]): Promise<void> {
    try {
      const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
      const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;
      
      if (!BOT_TOKEN || !CHAT_ID) {
        console.warn('Telegram bot token or chat ID not configured');
        return;
      }
      
      const currencySymbol = order.currency === 'USD' ? '$' : 'دج';
      
      let message = `🛒 *New Order Received!*\n\n`;
      message += `📋 *Order:* #${order.order_number}\n`;
      message += `👤 *Customer:* ${order.customer_email}\n`;
      message += `📱 *Phone:* ${order.customer_phone || 'N/A'}\n`;
      message += `💳 *Payment:* ${order.payment_method}\n`;
      message += `💰 *Total:* ${currencySymbol}${order.total_amount}\n`;
      message += `🌍 *Currency:* ${order.currency}\n`;
      message += `📅 *Date:* ${new Date(order.created_at).toLocaleString()}\n\n`;
      
      message += `📦 *Items:*\n`;
      for (const item of orderItems) {
        const product = item.product;
        const productName = product.translations?.find((t: any) => t.language === 'en')?.name || 'Unknown Product';
        message += `• ${productName} (Qty: ${item.quantity})\n`;
        message += `  ${currencySymbol}${item.unit_price} × ${item.quantity} = ${currencySymbol}${item.total_price}\n`;
        
        if (product.fulfillment_type === 'auto') {
          message += `  ✅ Auto-delivered\n`;
        } else {
          message += `  ⚠️ Manual fulfillment required\n`;
        }
      }
      
      message += `\n💡 *Payment Status:* ${order.status}\n`;
      message += `\n🔗 Check admin dashboard for details.`;
      
      // Send to Telegram (you'll need to implement this with your bot token)
      const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
      
      await fetch(telegramUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: 'Markdown'
        })
      });
      
      console.log('Telegram notification sent successfully');
    } catch (error) {
      console.error('Failed to send Telegram notification:', error);
      // Don't throw error to avoid breaking the order process
    }
  }
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `ORD-${timestamp.slice(-6)}-${random}`;
  }
}

export const paymentService = PaymentService.getInstance();