import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import toast from 'react-hot-toast';

export function CartPage() {
  const { state, updateCartItem, removeFromCart, clearCart } = useApp();
  const { user } = useAuth();
  const { t, getTranslation } = useTranslation();
  const navigate = useNavigate();

  const subtotal = state.cart.reduce((sum, item) => {
    const product = item.product!;
    const price = state.currency === 'USD' ? product.price_usd : 
      product.price_dzd || (product.price_usd * state.settings.exchange_rate_usd_to_dzd);
    return sum + (price * item.quantity);
  }, 0);

  const tax = subtotal * state.settings.tax_rate;
  const total = subtotal + tax;
  const currencySymbol = state.currency === 'USD' ? '$' : 'دج';

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login to proceed with checkout');
      navigate('/login');
      return;
    }

    if (state.cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Navigate to checkout page
    navigate('/checkout');
  };
  
  // Debug cart state
  console.log('Cart state:', state.cart);
  console.log('User:', user);
  
  if (state.cart.length === 0) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 text-center">
          <ShoppingCart className="h-16 w-16 text-secondary-400 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-4">{t('cart.empty')}</h1>
          <p className="text-sm sm:text-base text-secondary-600 mb-6 sm:mb-8 px-4">Add some amazing digital products to get started!</p>
          <Link
            to="/"
            className="bg-primary-500 text-secondary-900 px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors text-sm sm:text-base"
          >
            Continue Shopping
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 ${state.language === 'ar' ? 'rtl' : 'ltr'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">{t('cart.title')}</h1>
          <button
            onClick={clearCart}
            className="text-secondary-600 hover:text-secondary-800 transition-colors flex items-center space-x-1 rtl:space-x-reverse self-start sm:self-auto"
          >
            <Trash2 className="h-4 w-4" />
            <span className="text-sm sm:text-base">{t('cart.clear')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4 order-2 lg:order-1">
            {state.cart.map((item) => {
              const product = item.product!;
              const name = getTranslation(product.translations, 'name');
              const price = state.currency === 'USD' ? product.price_usd : 
                product.price_dzd || (product.price_usd * state.settings.exchange_rate_usd_to_dzd);
              
              return (
                <div key={item.id} className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow">
                  {/* Product Image */}
                  <div className="flex flex-col xs:flex-row xs:items-center space-y-4 xs:space-y-0 xs:space-x-4 rtl:space-x-reverse">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 mx-auto xs:mx-0">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-xl sm:text-2xl">📦</div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0 text-center xs:text-left">
                      <h3 className="text-base sm:text-lg font-semibold text-secondary-900 truncate">{name}</h3>
                      <div className="flex items-center justify-center xs:justify-start space-x-2 rtl:space-x-reverse mt-1">
                        <span className="text-xs sm:text-sm text-secondary-500 line-through">
                          {currencySymbol}{(price * 1.3).toFixed(2)}
                        </span>
                        <span className="text-sm sm:text-base text-secondary-600 font-medium">
                          {currencySymbol}{state.currency === 'DZD' ? Math.round(price) : price.toFixed(2)} each
                        </span>
                      </div>
                    </div>

                    {/* Quantity Controls and Total */}
                    <div className="flex flex-col xs:flex-row items-center space-y-3 xs:space-y-0 xs:space-x-4 rtl:space-x-reverse">
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={() => updateCartItem(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border border-secondary-300 flex items-center justify-center hover:bg-secondary-100 transition-colors"
                        >
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <span className="w-8 text-center font-semibold text-sm sm:text-base">{item.quantity}</span>
                        <button
                          onClick={() => updateCartItem(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full border border-secondary-300 flex items-center justify-center hover:bg-secondary-100 transition-colors"
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-center xs:text-right">
                        <p className="text-base sm:text-lg font-bold text-secondary-900">
                          {currencySymbol}{state.currency === 'DZD' ? Math.round(price * item.quantity) : (price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-secondary-600 hover:text-secondary-800 transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 h-fit lg:sticky lg:top-8 order-1 lg:order-2">
            <h2 className="text-lg sm:text-xl font-semibold text-secondary-900 mb-4 sm:mb-6">Order Summary</h2>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between">
                <span className="text-sm sm:text-base text-secondary-600">{t('common.subtotal')}</span>
                <span className="text-sm sm:text-base text-secondary-900">{currencySymbol}{state.currency === 'DZD' ? Math.round(subtotal) : subtotal.toFixed(2)}</span>
              </div>
              
              {tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-secondary-600">{t('common.tax')}</span>
                  <span className="text-secondary-900">{currencySymbol}{state.currency === 'DZD' ? Math.round(tax) : tax.toFixed(2)}</span>
                </div>
              )}
              
              <div className="border-t pt-3 sm:pt-4">
                <div className="flex justify-between text-base sm:text-lg font-bold">
                  <span>{t('common.total')}</span>
                  <span className="text-primary-500">{currencySymbol}{state.currency === 'DZD' ? Math.round(total) : total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              className="w-full bg-primary-500 text-secondary-900 py-3 sm:py-4 rounded-lg font-semibold hover:bg-primary-600 transition-colors mt-4 sm:mt-6 text-sm sm:text-base"
            >
              {t('cart.checkout')}
            </button>
            
            <Link
              to="/"
              className="block text-center text-primary-500 hover:text-primary-600 transition-colors mt-3 sm:mt-4 text-sm sm:text-base"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}