import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { paymentService } from '../services/PaymentService';
import { 
  CreditCard, 
  Smartphone, 
  DollarSign, 
  X, 
  ShoppingCart, 
  AlertCircle, 
  Lock,
  Shield,
  CheckCircle,
  Mail,
  Phone,
  ArrowLeft,
  Zap,
  Package
} from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import toast from 'react-hot-toast';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { state, clearCart } = useApp();
  const { user } = useAuth();
  const { t, getTranslation } = useTranslation();
  
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'crypto' | 'edahabia'>('paypal');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);

  // Get cart from state with fallback
  const cart = state.cart || [];

  // Check for incomplete orders on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const incomplete = urlParams.get('incomplete');
    if (incomplete === 'true') {
      setShowIncompleteModal(true);
    }
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/');
    }
  }, [cart, navigate]);

  // Calculate totals based on payment method
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const product = item.product!;
      if (paymentMethod === 'edahabia') {
        // Edahabia: show DZD price
        const price = product.price_dzd || (product.price_usd * state.settings.exchange_rate_usd_to_dzd);
        return total + (price * item.quantity);
      } else {
        // PayPal & Crypto: show USD price
        return total + (product.price_usd * item.quantity);
      }
    }, 0);
  };

  // Calculate total in USD for crypto minimum check
  const calculateTotalUSD = () => {
    return cart.reduce((total, item) => {
      const product = item.product!;
      return total + (product.price_usd * item.quantity);
    }, 0);
  };

  const handlePayment = async () => {
    if (!customerEmail) {
      toast.error(state.language === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required');
      return;
    }

    setIsProcessing(true);
    
    try {
      const paymentData = {
        method: paymentMethod,
        amount: calculateTotal(),
        currency: paymentMethod === 'edahabia' ? 'DZD' : 'USD',
        customerEmail,
        customerPhone,
        items: cart,
        userId: user?.id
      };

      let result;
      switch (paymentMethod) {
        case 'paypal':
          result = await paymentService.processPayPalPayment(paymentData);
          break;
        case 'crypto':
          result = await paymentService.processCryptoPayment(paymentData);
          break;
        case 'edahabia':
          result = await paymentService.processEdahabiaPayment(paymentData);
          break;
        default:
          throw new Error('Invalid payment method');
      }

      if (result.success) {
        await clearCart();
        // Redirect will be handled by the payment service
      } else {
        toast.error(result.error || 'Payment failed');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const currencySymbol = paymentMethod === 'edahabia' ? 'دج' : '$';
  const total = calculateTotal();
  const totalUSD = calculateTotalUSD();
  const isCryptoDisabled = totalUSD < 3.5;

  if (cart.length === 0) {
    return null;
  }

  const paymentMethods = [
    {
      id: 'paypal',
      name: 'PayPal',
      description: state.language === 'ar' ? 'دفع آمن عبر PayPal' : 'Secure payment via PayPal',
      currency: 'USD',
      icon: CreditCard,
      color: 'from-blue-500 to-blue-600',
      features: [
        state.language === 'ar' ? 'حماية المشتري' : 'Buyer Protection',
        state.language === 'ar' ? 'دفع فوري' : 'Instant Payment'
      ]
    },
    {
      id: 'crypto',
      name: state.language === 'ar' ? 'عملة مشفرة' : 'Cryptocurrency',
      description: state.language === 'ar' ? 'دفع بالعملات المشفرة (USDT)' : 'Pay with cryptocurrency (USDT)',
      currency: 'USD',
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      features: [
        state.language === 'ar' ? 'مجهول الهوية' : 'Anonymous',
        state.language === 'ar' ? 'رسوم منخفضة' : 'Low Fees'
      ]
    },
    {
      id: 'edahabia',
      name: state.language === 'ar' ? 'الذهبية / CIB' : 'Edahabia / CIB',
      description: state.language === 'ar' ? 'بطاقات البنوك الجزائرية' : 'Algerian bank cards',
      currency: 'DZD',
      icon: Smartphone,
      color: 'from-orange-500 to-orange-600',
      features: [
        state.language === 'ar' ? 'بطاقات محلية' : 'Local Cards',
        state.language === 'ar' ? 'دفع بالدينار' : 'Pay in Dinars'
      ]
    }
  ];

  return (
    <Layout>
      {/*
        NOTE: The outer wrapper previously used `h-screen` which locked the
        component height to exactly 100vh. On small screens this meant the
        payment method list and order summary were clipped and unusable,
        forcing the user to scroll within tiny containers or leaving the page
        blank. To fix this we replace `h-screen` with `min-h-screen` and
        allow the inner container to scroll vertically. See the patch below
        for details.*/}
      <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 ${state.language === 'ar' ? 'rtl' : 'ltr'}`}>
        {/*
          Use `min-h-screen` instead of `h-screen` here so the content can
          expand beyond the viewport height when needed. The flex container
          will grow with its children instead of enforcing a strict height.
        */}
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <div className="bg-white shadow-sm border-b px-4 sm:px-6 lg:px-8 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <button
                onClick={() => navigate('/cart')}
                className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {state.language === 'ar' ? 'العودة للسلة' : 'Back to Cart'}
              </button>
              
              <div className="text-center">
                <h1 className="text-xl sm:text-2xl font-bold text-secondary-900">
                  {state.language === 'ar' ? 'إتمام الطلب' : 'Checkout'}
                </h1>
              </div>
              
              <div className="w-20"></div> {/* Spacer for centering */}
            </div>
          </div>

          {/* Main Content */}
          {/*
            The main content previously had `overflow-hidden`, which prevented
            scrolling on small devices. Replacing it with `overflow-y-auto`
            allows the user to scroll through the form and payment options
            when they exceed the viewport height. This is crucial for
            responsive behaviour on mobile phones.
          */}
          <div className="flex-1 overflow-y-auto">
            <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
                
                {/* Left Side - Payment Methods & Customer Info */}
                <div className="lg:col-span-3 space-y-6 overflow-y-auto">
                  
                  {/* Customer Information */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-secondary-900 flex items-center mb-4">
                      <Mail className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0 text-primary-500" />
                      {state.language === 'ar' ? 'معلومات العميل' : 'Customer Information'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          {state.language === 'ar' ? 'البريد الإلكتروني *' : 'Email Address *'}
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                          <input
                            type="email"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            className="w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            placeholder={state.language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          {state.language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                          <input
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            placeholder={state.language === 'ar' ? 'أدخل رقم هاتفك' : 'Enter your phone number'}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                    <h3 className="text-lg font-bold text-secondary-900 flex items-center mb-6">
                      <CreditCard className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0 text-primary-500" />
                      {state.language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => {
                            if (method.id === 'crypto' && isCryptoDisabled) return;
                            setPaymentMethod(method.id as any);
                          }}
                          disabled={method.id === 'crypto' && isCryptoDisabled}
                          className={`relative p-3 border-2 rounded-xl transition-all duration-300 text-left rtl:text-right group ${
                            method.id === 'crypto' && isCryptoDisabled
                              ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                              : paymentMethod === method.id
                                ? 'border-primary-500 bg-primary-50 shadow-md'
                                : 'border-secondary-200 hover:border-secondary-300 bg-white hover:shadow-md'
                          }`}
                        >
                          {/* Selection Indicator */}
                          {paymentMethod === method.id && !(method.id === 'crypto' && isCryptoDisabled) && (
                            <div className="absolute top-2 right-2 rtl:left-2 rtl:right-auto">
                              <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-3 h-3 text-white" />
                              </div>
                            </div>
                          )}

                          {/* Disabled Indicator for Crypto */}
                          {method.id === 'crypto' && isCryptoDisabled && (
                            <div className="absolute top-2 right-2 rtl:left-2 rtl:right-auto">
                              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                <X className="w-3 h-3 text-white" />
                              </div>
                            </div>
                          )}

                          <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            {/* Payment Logo */}
                            <div className={`w-10 h-10 bg-white rounded-lg border flex items-center justify-center flex-shrink-0 transition-all ${
                              method.id === 'crypto' && isCryptoDisabled
                                ? 'border-gray-200'
                                : 'border-secondary-200'
                            }`}>
                              {method.id === 'paypal' ? (
                                // Display the PayPal logo loaded from the public directory
                                <img
                                  src="/paypal.jpg"
                                  alt="PayPal"
                                  loading="lazy"
                                  className={`w-6 h-6 object-contain ${
                                    method.id === 'crypto' && isCryptoDisabled ? 'grayscale' : ''
                                  }`}
                                />
                              ) : method.id === 'crypto' ? (
                                // Display the cryptocurrency logo
                                <img
                                  src="/crypto.jpg"
                                  alt="Cryptocurrency"
                                  loading="lazy"
                                  className={`w-6 h-6 object-contain ${
                                    method.id === 'crypto' && isCryptoDisabled ? 'grayscale' : ''
                                  }`}
                                />
                              ) : method.id === 'edahabia' ? (
                                // Use a custom logo for the Edahabia / CIB option instead of the generic icon
                                <img
                                  src="/edahabia.jpg"
                                  alt="Edahabia / CIB"
                                  loading="lazy"
                                  className="w-6 h-6 object-contain"
                                />
                              ) : (
                                // Fallback to the provided icon when no custom image is available
                                <method.icon
                                  className={`w-6 h-6 ${
                                    method.id === 'crypto' && isCryptoDisabled
                                      ? 'text-gray-400'
                                      : 'text-orange-500'
                                  }`}
                                />
                              )}
                            </div>

                            {/* Payment Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-0.5">
                                <h4 className={`font-semibold ${method.id === 'crypto' && isCryptoDisabled ? 'text-gray-500' : 'text-secondary-900'}`}>
                                  {method.name}
                                </h4>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                  method.currency === 'USD' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {method.currency}
                                </span>
                              </div>
                              
                              {/* Special message for disabled crypto */}
                              {method.id === 'crypto' && isCryptoDisabled ? (
                                <p className="text-red-600 text-sm font-medium">
                                  {state.language === 'ar' 
                                    ? 'لا تصلح للمنتجات أقل من 3.5$ (الحد الأدنى للعملات الرقمية)'
                                    : 'Not suitable for products under $3.50 (crypto minimum limit)'
                                  }
                                </p>
                              ) : (
                                <p className="text-secondary-600 text-sm">
                                  {method.description}
                                </p>
                              )}

                              {/* Features */}
                              <div className="flex flex-wrap gap-1 mt-1">
                                {method.features.map((feature, index) => (
                                  <span
                                    key={index}
                                    className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                                      method.id === 'crypto' && isCryptoDisabled
                                        ? 'bg-gray-100 text-gray-500'
                                        : 'bg-secondary-100 text-secondary-700'
                                    }`}
                                  >
                                    <CheckCircle className={`w-2 h-2 mr-1 rtl:ml-1 rtl:mr-0 ${
                                      method.id === 'crypto' && isCryptoDisabled ? 'text-gray-400' : 'text-green-500'
                                    }`} />
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Price Display */}
                            <div className="text-right rtl:text-left">
                              <div className={`text-base font-bold ${method.id === 'crypto' && isCryptoDisabled ? 'text-gray-500' : 'text-primary-600'}`}>
                                {paymentMethod === method.id ? (
                                  `${currencySymbol}${total.toFixed(2)}`
                                ) : method.id === 'edahabia' ? (
                                  `دج${cart.reduce((sum, item) => {
                                    const product = item.product!;
                                    const price = product.price_dzd || (product.price_usd * state.settings.exchange_rate_usd_to_dzd);
                                    return sum + (price * item.quantity);
                                  }, 0).toFixed(2)}`
                                ) : (
                                  `$${totalUSD.toFixed(2)}`
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side - Order Summary */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 h-full flex flex-col">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 rounded-t-xl">
                      <h2 className="text-lg font-bold text-secondary-900 flex items-center">
                        <ShoppingCart className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
                        {state.language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
                      </h2>
                    </div>
                    
                    {/* Cart Items */}
                    <div className="flex-1 p-6 overflow-y-auto">
                      <div className="space-y-3 mb-6">
                        {cart.slice(0, 4).map((item) => {
                          const product = item.product!;
                          const productName = getTranslation(product.translations, 'name') || 'Product';
                          const price = paymentMethod === 'edahabia' 
                            ? (product.price_dzd || (product.price_usd * state.settings.exchange_rate_usd_to_dzd))
                            : product.price_usd;
                          
                          return (
                            <div key={item.id} className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-gray-50 rounded-lg">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                {product.image_url ? (
                                  <img
                                    src={product.image_url}
                                    alt={productName}
                                    loading="lazy"
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                ) : (
                                  <Package className="w-5 h-5 text-primary-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-secondary-900 truncate text-sm">{productName}</h3>
                                <p className="text-xs text-secondary-500">
                                  {state.language === 'ar' ? 'الكمية:' : 'Qty:'} {item.quantity}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-secondary-900 text-sm">
                                  {currencySymbol}{(price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        
                        {cart.length > 4 && (
                          <div className="text-center text-sm text-secondary-500 py-2">
                            +{cart.length - 4} {state.language === 'ar' ? 'منتجات أخرى' : 'more items'}
                          </div>
                        )}
                      </div>

                      {/* Pricing Breakdown */}
                      <div className="border-t pt-4 space-y-3">
                        <div className="flex justify-between text-secondary-600">
                          <span>{state.language === 'ar' ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                          <span>{currencySymbol}{total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-secondary-600">
                          <span>{state.language === 'ar' ? 'الرسوم:' : 'Fees:'}</span>
                          <span className="text-green-600 font-medium">{state.language === 'ar' ? 'مجاناً' : 'Free'}</span>
                        </div>
                        <div className="flex justify-between items-center text-xl font-bold text-secondary-900 pt-3 border-t">
                          <span>{state.language === 'ar' ? 'المجموع:' : 'Total:'}</span>
                          <span className="text-primary-600">{currencySymbol}{total.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Security Features */}
                      <div className="mt-6 pt-4 border-t">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="flex flex-col items-center">
                            <Shield className="w-5 h-5 text-green-500 mb-1" />
                            <span className="text-xs text-secondary-600">{state.language === 'ar' ? 'آمن' : 'Secure'}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <Lock className="w-5 h-5 text-green-500 mb-1" />
                            <span className="text-xs text-secondary-600">{state.language === 'ar' ? 'مشفر' : 'Encrypted'}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <Zap className="w-5 h-5 text-green-500 mb-1" />
                            <span className="text-xs text-secondary-600">{state.language === 'ar' ? 'فوري' : 'Instant'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Button */}
                    <div className="p-6 border-t bg-gray-50 rounded-b-xl">
                      <button
                        onClick={handlePayment}
                        disabled={isProcessing || !customerEmail || (paymentMethod === 'crypto' && isCryptoDisabled)}
                        className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-secondary-900 py-4 px-6 rounded-xl font-bold text-lg hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center"
                      >
                        {isProcessing ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-secondary-900 mr-3 rtl:ml-3 rtl:mr-0"></div>
                            {state.language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
                          </div>
                        ) : (
                          <>
                            <Lock className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
                            {state.language === 'ar' ? 'ادفع الآن' : 'Pay Now'} {currencySymbol}{total.toFixed(2)}
                          </>
                        )}
                      </button>

                      {/* Trust Indicators */}
                      <div className="text-center text-xs text-secondary-500 mt-4">
                        <p className="mb-2">
                          {state.language === 'ar' 
                            ? 'بالنقر على "ادفع الآن"، أنت توافق على شروط الخدمة'
                            : 'By clicking "Pay Now", you agree to our terms of service'
                          }
                        </p>
                        <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse">
                          <span className="flex items-center">
                            <Shield className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0 text-green-500" />
                            {state.language === 'ar' ? 'محمي بـ SSL' : 'SSL Protected'}
                          </span>
                          <span className="flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0 text-green-500" />
                            {state.language === 'ar' ? 'تاجر موثق' : 'Verified Merchant'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Incomplete Order Modal */}
        {showIncompleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <AlertCircle className="w-6 h-6 text-yellow-500 mr-2 rtl:ml-2 rtl:mr-0" />
                  <h3 className="text-lg font-semibold text-secondary-900">
                    {state.language === 'ar' ? 'طلب غير مكتمل' : 'Incomplete Order'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowIncompleteModal(false)}
                  className="text-secondary-400 hover:text-secondary-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-secondary-600 mb-6">
                {state.language === 'ar' 
                  ? 'لم يتم إكمال عملية الدفع السابقة. هل تريد المتابعة؟'
                  : 'Your previous payment was not completed. Would you like to continue?'
                }
              </p>
              <div className="flex space-x-3 rtl:space-x-reverse">
                <button
                  onClick={() => setShowIncompleteModal(false)}
                  className="flex-1 bg-primary-500 text-secondary-900 py-3 px-4 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                >
                  {state.language === 'ar' ? 'متابعة الدفع' : 'Continue Payment'}
                </button>
                <button
                  onClick={() => {
                    setShowIncompleteModal(false);
                    navigate('/');
                  }}
                  className="flex-1 bg-secondary-200 text-secondary-700 py-3 px-4 rounded-lg font-semibold hover:bg-secondary-300 transition-colors"
                >
                  {state.language === 'ar' ? 'العودة للمتجر' : 'Back to Store'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}