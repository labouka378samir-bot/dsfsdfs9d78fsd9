import React, { useState } from 'react';
import { X, ShoppingCart, Clock, Info, Check } from 'lucide-react';
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
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  
  const { state, addToCart } = useApp();
  const { t, getTranslation } = useTranslation();
  
  const name = getTranslation(product.translations, 'name');
  const description = getTranslation(product.translations, 'description');
  const instructions = getTranslation(product.translations, 'activation_instructions');
  
  // Check if product has variants
  const hasVariants = product.pricing_model === 'variants' && product.variants && product.variants.length > 0;
  
  // Get price based on selected variant or default product price
  const getPrice = () => {
    if (hasVariants && selectedVariant) {
      return state.currency === 'USD' ? selectedVariant.price_usd : 
        selectedVariant.price_dzd || (selectedVariant.price_usd * state.settings.exchange_rate_usd_to_dzd);
    }
    return state.currency === 'USD' ? product.price_usd : 
      product.price_dzd || (product.price_usd * state.settings.exchange_rate_usd_to_dzd);
  };
  
  const price = getPrice();
  
  const currencySymbol = state.currency === 'USD' ? '$' : 'دج';
  const totalPrice = price * quantity;
  
  // Set default variant on mount
  React.useEffect(() => {
    if (hasVariants && !selectedVariant) {
      const defaultVariant = product.variants?.find(v => v.is_default) || product.variants?.[0];
      setSelectedVariant(defaultVariant);
    }
  }, [hasVariants, selectedVariant, product.variants]);
  
  // Get stock quantity based on variant or product
  const getStockQuantity = () => {
    if (hasVariants && selectedVariant) {
      return selectedVariant.is_out_of_stock ? 0 : 999;
    }
    return product.is_out_of_stock ? 0 : 999;
  };
  
  const stockQuantity = getStockQuantity();
  
  const handleAddToCart = async () => {
    if (stockQuantity <= 0) return;
    if (hasVariants && !selectedVariant) {
      toast.error(state.language === 'ar' ? 'يرجى اختيار نوع الاشتراك' : 'Please select a subscription type');
      return;
    }
    
    setIsLoading(true);
    try {
      // For variants, we need to pass variant info
      if (hasVariants && selectedVariant) {
        await addToCart(product.id, quantity, selectedVariant.id);
      } else {
        await addToCart(product.id, quantity);
      }
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    if (!isLoading) {
      window.location.href = '/cart';
    }
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
            {product.is_out_of_stock && (
              <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded font-semibold">
                {t('product.out_of_stock')}
              </div>
            )}
          </div>
          
          {product.is_out_of_stock && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-semibold text-center">
                {t('product.out_of_stock')}
              </p>
            </div>
          )}
          
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{description}</p>
            </div>
            
            {/* Duration */}
            {(selectedVariant?.duration_value || product.duration_days > 0) && (
              <div className="flex items-center text-gray-600">
                <Clock className="h-5 w-5 mr-2" />
                <span>
                  <strong>{t('product.duration')}:</strong> {hasVariants && selectedVariant ? (
                    selectedVariant.duration_unit === 'years' 
                      ? `${selectedVariant.duration_value} ${selectedVariant.duration_value === 1 ? t('product.year') : t('product.years')}`
                      : selectedVariant.duration_unit === 'months'
                      ? `${selectedVariant.duration_value} ${selectedVariant.duration_value === 1 ? t('product.month') : t('product.months')}`
                      : `${selectedVariant.duration_value} ${selectedVariant.duration_value === 1 ? t('product.day') : t('product.days')}`
                  ) : (
                    product.duration_days >= 365 
                      ? `${Math.floor(product.duration_days / 365)} ${Math.floor(product.duration_days / 365) === 1 ? t('product.year') : t('product.years')}`
                      : `${Math.floor(product.duration_days / 30)} ${Math.floor(product.duration_days / 30) === 1 ? t('product.month') : t('product.months')}`
                  )}
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
            
            {/* Pricing Options */}
            {hasVariants && product.variants && product.variants.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {state.language === 'ar' ? 'اختر نوع الاشتراك' : 'Choose Subscription Type'}
                </h3>
                <div className="space-y-3">
                  {product.variants.map((variant, index) => {
                    const variantName = variant.name[state.language] || variant.name.en || `Option ${index + 1}`;
                    const variantPrice = state.currency === 'USD' ? variant.price_usd : 
                      variant.price_dzd || (variant.price_usd * state.settings.exchange_rate_usd_to_dzd);
                    const isOutOfStock = variant.is_out_of_stock || variant.stock_count <= 0;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedVariant(variant)}
                        disabled={isOutOfStock}
                        className={`w-full p-4 border-2 rounded-lg text-left rtl:text-right transition-all duration-200 ${
                          selectedVariant === variant
                            ? 'border-primary-500 bg-primary-50'
                            : isOutOfStock
                            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                            : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <h4 className="font-semibold text-gray-900">{variantName}</h4>
                              {isOutOfStock && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                                  {state.language === 'ar' ? 'نفد المخزون' : 'Out of Stock'}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {variant.duration_unit === 'years' 
                                ? `${variant.duration_value} ${variant.duration_value === 1 ? t('product.year') : t('product.years')}`
                                : variant.duration_unit === 'months'
                                ? `${variant.duration_value} ${variant.duration_value === 1 ? t('product.month') : t('product.months')}`
                                : `${variant.duration_value} ${variant.duration_value === 1 ? t('product.day') : t('product.days')}`
                              }
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary-600">
                              {currencySymbol}{state.currency === 'DZD' ? Math.round(variantPrice) : variantPrice.toFixed(2)}
                            </div>
                            {!isOutOfStock && (
                              <div className="text-xs text-gray-500">
                                {state.language === 'ar' ? 'متوفر' : 'Available'}
                              </div>
                            )}
                          </div>
                          {selectedVariant === variant && (
                            <div className="ml-3 rtl:mr-3 rtl:ml-0">
                              <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
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
                    {currencySymbol}{state.currency === 'DZD' ? Math.round(price * 1.3) : (price * 1.3).toFixed(2)}
                  </div>
                  {/* Discounted Price */}
                  <div className="text-3xl font-bold text-primary-500">
                    {currencySymbol}{state.currency === 'DZD' ? Math.round(price) : price.toFixed(2)}
                  </div>
                </div>
              </div>
              
              {stockQuantity > 0 && (
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
                      onClick={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
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
                  {currencySymbol}{state.currency === 'DZD' ? Math.round(totalPrice) : totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-4 rtl:space-x-reverse">
              <button
                onClick={handleAddToCart}
                disabled={stockQuantity <= 0 || isLoading || (hasVariants && !selectedVariant)}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                  stockQuantity <= 0 || (hasVariants && !selectedVariant)
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isLoading ? (
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : stockQuantity <= 0 ? (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {t('product.out_of_stock')}
                  </>
                ) : hasVariants && !selectedVariant ? (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {state.language === 'ar' ? 'اختر نوع الاشتراك' : 'Select Option'}
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
                disabled={stockQuantity <= 0 || isLoading || (hasVariants && !selectedVariant)}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                  stockQuantity <= 0 || (hasVariants && !selectedVariant)
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {stockQuantity <= 0 ? t('product.out_of_stock') : 
                 hasVariants && !selectedVariant ? (state.language === 'ar' ? 'اختر نوع الاشتراك' : 'Select Option') :
                 t('common.buy_now')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}