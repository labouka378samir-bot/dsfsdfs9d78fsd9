import React, { useState } from 'react';
import { X, ShoppingCart, Clock, Info } from 'lucide-react';
import { Product } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  const { state, addToCart } = useApp();
  const { t, getTranslation } = useTranslation();
  
  const name = getTranslation(product.translations, 'name');
  const description = getTranslation(product.translations, 'description');
  const instructions = getTranslation(product.translations, 'activation_instructions');
  
  const price = state.currency === 'USD' ? product.price_usd : 
    product.price_dzd || (product.price_usd * state.settings.exchange_rate_usd_to_dzd);
  
  const currencySymbol = state.currency === 'USD' ? '$' : 'دج';
  const totalPrice = price * quantity;
  
  const handleAddToCart = async () => {
    if (product.stock_quantity <= 0) return;
    
    setIsLoading(true);
    try {
      await addToCart(product.id, quantity);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    // Navigate to checkout would be implemented here
    window.location.href = '/cart';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto ${state.language === 'ar' ? 'rtl' : 'ltr'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Product Image */}
          <div className="relative h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg mb-6 flex items-center justify-center">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="text-8xl">📦</div>
            )}
            
            {product.stock_quantity <= 0 && (
              <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded font-semibold">
                {t('product.out_of_stock')}
              </div>
            )}
          </div>
          
          {/* Product Details */}
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{description}</p>
            </div>
            
            {/* Duration */}
            {product.duration_days > 0 && (
              <div className="flex items-center text-gray-600">
                <Clock className="h-5 w-5 mr-2" />
                <span>
                  <strong>{t('product.duration')}:</strong> {
                    product.duration_days >= 365 
                      ? `${Math.floor(product.duration_days / 365)} ${Math.floor(product.duration_days / 365) === 1 ? t('product.year') : t('product.years')}`
                      : `${Math.floor(product.duration_days / 30)} ${Math.floor(product.duration_days / 30) === 1 ? t('product.month') : t('product.months')}`
                  }
                </span>
              </div>
            )}
            
            {/* Activation Instructions */}
            {instructions && (
              <div>
                <div className="flex items-center mb-2">
                  <Info className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('product.activation_instructions')}
                  </h3>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 leading-relaxed">{instructions}</p>
                </div>
              </div>
            )}
            
            {/* Price and Quantity */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-900">{t('common.price')}:</span>
                <div className="text-right">
                  {/* Original Price (crossed out) */}
                  <div className="text-lg text-gray-500 line-through">
                    {currencySymbol}{(price * 1.3).toFixed(2)}
                  </div>
                  {/* Discounted Price */}
                  <div className="text-3xl font-bold text-primary-500">
                    {currencySymbol}{price.toFixed(2)}
                  </div>
                </div>
              </div>
              
              {product.stock_quantity > 0 && (
                <div className="flex items-center justify-between mb-4">
                  <label className="text-lg font-semibold text-gray-900">{t('common.quantity')}:</label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-xl font-bold text-gray-900">{t('common.total')}:</span>
                <span className="text-3xl font-bold text-green-600">
                  {currencySymbol}{totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-4 rtl:space-x-reverse">
              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity <= 0 || isLoading}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                  product.stock_quantity <= 0
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isLoading ? (
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : product.stock_quantity <= 0 ? (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {t('product.out_of_stock')}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {t('common.add_to_cart')}
                  </>
                )}
              </button>
              
              <button
                onClick={handleBuyNow}
                disabled={product.stock_quantity <= 0 || isLoading}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                  product.stock_quantity <= 0
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {product.stock_quantity <= 0 ? t('product.out_of_stock') : t('common.buy_now')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}