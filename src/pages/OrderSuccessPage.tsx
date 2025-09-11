import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Download, Mail, Copy, Package, Clock, MessageCircle, Instagram, Send } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { supabase, createServiceClient } from '../lib/supabase';
import { Order, OrderItem } from '../types';
import { useApp } from '../contexts/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { paymentService } from '../services/PaymentService';

export function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentProcessed, setPaymentProcessed] = useState(false);
  
  const { state } = useApp();
  const { getTranslation } = useTranslation();
  const orderId = searchParams.get('order');
  const paymentMethod = searchParams.get('payment');
  const paypalToken = searchParams.get('token');

  // Process payment verification when returning from payment gateway
  useEffect(() => {
    const processPaymentVerification = async () => {
      if (!orderId || paymentProcessed) return;
      
      console.log('🔄 Processing payment verification for order:', orderId);
      console.log('💳 Payment method:', paymentMethod);
      console.log('🎫 PayPal token:', paypalToken);
      
      let paymentSuccess = false;
      
      try {
        // Handle PayPal return
        if (paymentMethod === 'paypal' && paypalToken) {
          console.log('🔄 Processing PayPal capture...');
          paymentSuccess = await paymentService.capturePayPalPayment(orderId, paypalToken);
        }
        // Handle Crypto return
        else if (paymentMethod === 'crypto' && order?.payment_id) {
          console.log('🔄 Checking crypto payment status...');
          paymentSuccess = await paymentService.checkCryptoPaymentStatus(orderId, order.payment_id);
        }
        // Handle Edahabia return
        else if (paymentMethod === 'edahabia' && order?.payment_id) {
          console.log('🔄 Checking Edahabia payment status...');
          paymentSuccess = await paymentService.checkEdahabiaPaymentStatus(orderId, order.payment_id);
        }
        
        if (paymentSuccess) {
          console.log('✅ Payment verified successfully');
          setPaymentProcessed(true);
          // Reload order details to show updated status
          await loadOrderDetails();
          toast.success('Payment confirmed! Your order has been processed.');
        }
      } catch (error) {
        console.error('❌ Error processing payment verification:', error);
      }
    };
    
    // Only process if we have order data and haven't processed yet
    if (order && !paymentProcessed) {
      processPaymentVerification();
    }
  }, [order, orderId, paymentMethod, paypalToken, paymentProcessed]);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      // Load order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;
      setOrder(orderData);

      // Load order items with product details
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          product:products(
            *,
            translations:product_translations(*)
          )
        `)
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;
      setOrderItems(itemsData || []);
    } catch (error: any) {
      console.error('Error loading order:', error);
      toast.error('Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const downloadReceipt = async () => {
    if (!order) return;
    
    try {
      // Create receipt content
      const receiptContent = document.createElement('div');
      receiptContent.style.cssText = `
        width: 400px;
        padding: 20px;
        font-family: Arial, sans-serif;
        background: white;
        color: black;
        direction: ${state.language === 'ar' ? 'rtl' : 'ltr'};
      `;
      
      receiptContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #f59e0b; margin: 0;">ATHMANEBZN STORE</h2>
          <p style="margin: 5px 0; font-size: 14px;">Digital Products Receipt</p>
        </div>
        
        <div style="border-bottom: 2px solid #f59e0b; margin: 20px 0;"></div>
        
        <div style="margin-bottom: 15px;">
          <strong>Order #:</strong> ${order.order_number}<br>
          <strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}<br>
          <strong>Status:</strong> ${order.status}<br>
          <strong>Payment Method:</strong> ${order.payment_method}<br>
          <strong>Customer:</strong> ${order.customer_email}
        </div>
        
        <div style="border-bottom: 1px solid #ddd; margin: 15px 0;"></div>
        
        <div style="margin-bottom: 15px;">
          <h3 style="margin: 0 0 10px 0;">Items:</h3>
          ${orderItems.map(item => {
            const product = item.product!;
            const name = getTranslation(product.translations, 'name');
            return `
              <div style="margin-bottom: 8px; padding: 8px; background: #f9f9f9;">
                <strong>${name}</strong><br>
                Qty: ${item.quantity} × ${currencySymbol}${item.unit_price.toFixed(2)} = ${currencySymbol}${item.total_price.toFixed(2)}
                ${item.delivery_code ? `<br><strong>Code:</strong> ${item.delivery_code}` : ''}
              </div>
            `;
          }).join('')}
        </div>
        
        <div style="border-bottom: 1px solid #ddd; margin: 15px 0;"></div>
        
        <div style="text-align: right;">
          <div><strong>Subtotal:</strong> ${currencySymbol}${order.subtotal.toFixed(2)}</div>
          ${order.tax_amount > 0 ? `<div><strong>Tax:</strong> ${currencySymbol}${order.tax_amount.toFixed(2)}</div>` : ''}
          <div style="font-size: 18px; color: #f59e0b;"><strong>Total: ${currencySymbol}${order.total_amount.toFixed(2)}</strong></div>
        </div>
        
        <div style="border-top: 2px solid #f59e0b; margin: 20px 0; padding-top: 15px; text-align: center; font-size: 12px;">
          <p>Thank you for your purchase!</p>
          <p>Support: WhatsApp +213 96 35 47 92</p>
          <p>Instagram: @athmaanebzn | Telegram: @atmnexe1</p>
        </div>
      `;
      
      // Add to DOM temporarily
      document.body.appendChild(receiptContent);
      
      // Convert to canvas and PDF
      const canvas = await html2canvas(receiptContent, {
        backgroundColor: '#ffffff',
        scale: 2
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`Receipt-${order.order_number}.pdf`);
      
      // Remove from DOM
      document.body.removeChild(receiptContent);
      
      toast.success('Receipt downloaded successfully!');
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error('Failed to generate receipt');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-8">The order you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </Layout>
    );
  }

  const currencySymbol = order.currency === 'USD' ? '$' : 'دج';

  // Determine success or pending message based on order status
  const isPaid = order.status === 'paid' || order.status === 'delivered';
  const heading = isPaid ? 'Payment Successful!' : 'Order Received';
  const description = isPaid
    ? 'Thank you for your purchase. Your order has been confirmed.'
    : 'Your order has been created. Please complete the payment or wait for confirmation.';

  return (
    <Layout>
      <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${state.language === 'ar' ? 'rtl' : 'ltr'}`}>
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{heading}</h1>
          <p className="text-lg text-gray-600">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
              <button
                onClick={downloadReceipt}
                className="flex items-center space-x-2 rtl:space-x-reverse text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download Receipt</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className="font-mono text-gray-900">#{order.order_number}</span>
                  <button
                    onClick={() => copyToClipboard(order.order_number)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span className="text-gray-900">
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="text-gray-900 capitalize">{order.payment_method}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  order.status === 'paid' ? 'bg-green-100 text-green-800' :
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {order.status}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Customer Email:</span>
                <span className="text-gray-900">{order.customer_email}</span>
              </div>

              {order.customer_phone && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="text-gray-900">{order.customer_phone}</span>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="border-t mt-6 pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">{currencySymbol}{order.currency === 'DZD' ? Math.round(order.subtotal) : order.subtotal.toFixed(2)}</span>
                </div>
                
                {order.tax_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="text-gray-900">{currencySymbol}{order.currency === 'DZD' ? Math.round(order.tax_amount) : order.tax_amount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-green-600">{currencySymbol}{order.currency === 'DZD' ? Math.round(order.total_amount) : order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items & Delivery */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Items</h2>
              
              <div className="space-y-4">
                {orderItems.map((item) => {
                  const product = item.product!;
                  const name = getTranslation(product.translations, 'name');
                  
                  return (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-4 rtl:space-x-reverse">
                        <div className="h-16 w-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{name}</h3>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × {currencySymbol}{order.currency === 'DZD' ? Math.round(item.unit_price) : item.unit_price.toFixed(2)}
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            Total: {currencySymbol}{order.currency === 'DZD' ? Math.round(item.total_price) : item.total_price.toFixed(2)}
                          </p>
                          
                          {/* Delivery Status */}
                          <div className="mt-3">
                            {item.delivery_status === 'delivered' ? (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <div className="flex items-center mb-2">
                                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 rtl:ml-2 rtl:mr-0" />
                                  <span className="text-sm font-medium text-green-800">Delivered</span>
                                </div>
                                {item.delivery_code && (
                                  <div className="space-y-2">
                                    <p className="text-xs text-green-700">Your activation code:</p>
                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                      <code className="bg-white px-3 py-1 rounded border text-sm font-mono">
                                        {item.delivery_code}
                                      </code>
                                      <button
                                        onClick={() => copyToClipboard(item.delivery_code!)}
                                        className="text-green-600 hover:text-green-700 transition-colors"
                                      >
                                        <Copy className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-center mb-2">
                                  <MessageCircle className="h-4 w-4 text-blue-600 mr-2 rtl:ml-2 rtl:mr-0" />
                                  <span className="text-sm font-medium text-blue-800">Contact Support</span>
                                </div>
                                <p className="text-xs text-blue-700 mb-3">
                                  Please contact our support team to receive your account details:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <a
                                    href="https://wa.me/21396354792"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-1 rtl:space-x-reverse bg-green-100 text-green-800 px-2 py-1 rounded text-xs hover:bg-green-200 transition-colors"
                                  >
                                    <MessageCircle className="h-3 w-3" />
                                    <span>WhatsApp</span>
                                  </a>
                                  <a
                                    href="https://instagram.com/athmaanebzn"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-1 rtl:space-x-reverse bg-pink-100 text-pink-800 px-2 py-1 rounded text-xs hover:bg-pink-200 transition-colors"
                                  >
                                    <Instagram className="h-3 w-3" />
                                    <span>Instagram</span>
                                  </a>
                                  <a
                                    href="https://t.me/atmnexe1"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-1 rtl:space-x-reverse bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs hover:bg-blue-200 transition-colors"
                                  >
                                    <Send className="h-3 w-3" />
                                    <span>Telegram</span>
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Email Notification */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <Mail className="h-5 w-5 text-blue-600 mr-2 rtl:ml-2 rtl:mr-0" />
                <h3 className="font-semibold text-blue-900">Email Confirmation</h3>
              </div>
              <p className="text-sm text-blue-800">
                A confirmation email with your order details and delivery information has been sent to{' '}
                <strong>{order.customer_email}</strong>
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/"
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
              >
                Continue Shopping
              </Link>
              <Link
                to="/orders"
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
              >
                View All Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}