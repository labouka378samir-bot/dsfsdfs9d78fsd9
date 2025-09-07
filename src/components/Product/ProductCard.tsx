import React, { useState } from 'react';
import { ShoppingCart, Eye, Clock, Info } from 'lucide-react';
import { Product } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { ProductModal } from './ProductModal';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = React.memo(function ProductCard({ product }: ProductCardProps) {
  // Manage modal and loading state locally.
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { state, addToCart } = useApp();
  const { t, getTranslation } = useTranslation();
  
  // Memoize translations to prevent recalculation
  const name = React.useMemo(() => getTranslation(product.translations, 'name'), [product.translations, getTranslation]);
  const description = React.useMemo(() => getTranslation(product.translations, 'description'), [product.translations, getTranslation]);
  
  // Memoize price calculation
  const price = React.useMemo(() => {
    return state.currency === 'USD' ? product.price_usd : 
      product.price_dzd || (product.price_usd * state.settings.exchange_rate_usd_to_dzd);
  }, [state.currency, product.price_usd, product.price_dzd, state.settings.exchange_rate_usd_to_dzd]);
  
  const currencySymbol = state.currency === 'USD' ? '$' : 'دج';
  
  const handleSeeDetails = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(true);
  };

  return (
    <>
      {/*
        We wrap the card in a flex-col container without a fixed height. A minimum height
        keeps cards consistent while still allowing them to expand as needed. The image,
        content and footer sections are clearly separated so that the footer never overlaps
        the description, even when the description wraps onto multiple lines.  
      */}
      <div
        className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between min-h-[480px]"
      >
        {/* Product Image */}
        <div className="relative h-52 flex-shrink-0 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="eager"
              decoding="async"
            />
          ) : (
            <div className="text-4xl sm:text-5xl opacity-60">📦</div>
          )}
          
          {/* Discount Badge */}
          <div className="absolute top-3 left-3 rtl:right-3 rtl:left-auto bg-primary-500 text-secondary-900 px-2.5 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
            -23%
          </div>
          
          {/* Out of Stock Badge */}
          {product.is_out_of_stock && (
            <div className="absolute top-3 right-3 rtl:left-3 rtl:right-auto bg-orange-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
              {t('product.out_of_stock')}
            </div>
          )}
          
          {/* Overlay buttons */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="bg-white/90 backdrop-blur-sm text-secondary-900 p-2.5 rounded-full hover:bg-white transition-all duration-200 shadow-lg transform hover:scale-110"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Product information */}
        <div className="flex-1 flex flex-col p-4">
          {/* Title & description */}
          <div className="flex-1">
            <h3 className="text-base font-bold text-secondary-900 mb-2 line-clamp-2 leading-tight hover:text-primary-600 transition-colors">
              {name}
            </h3>
            <p className="text-secondary-600 text-sm mb-4 line-clamp-2 leading-relaxed break-words overflow-wrap-anywhere">
              {description}
            </p>
          </div>
          {/* Footer: price, duration & button */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-col">
                <span className="text-xs text-secondary-400 line-through">
                  {currencySymbol}
                  {state.currency === 'DZD' ? Math.round(price * 1.3) : (price * 1.3).toFixed(2)}
                </span>
                <span className="text-xl font-bold text-primary-600">
                  {currencySymbol}
                  {state.currency === 'DZD' ? Math.round(price) : price.toFixed(2)}
                </span>
              </div>
              {product.duration_days > 0 && (
                <div className="flex items-center text-xs text-secondary-500 bg-gray-50 px-2 py-1 rounded-md">
                  <Clock className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0 text-primary-500" />
                  <span className="font-medium">
                    {product.duration_days >= 365 
                      ? `${Math.floor(product.duration_days / 365)} ${Math.floor(product.duration_days / 365) === 1 ? t('product.year') : t('product.years')}`
                      : `${Math.floor(product.duration_days / 30)} ${Math.floor(product.duration_days / 30) === 1 ? t('product.month') : t('product.months')}`
                    }
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={handleSeeDetails}
              disabled={product.is_out_of_stock}
              className={`w-full px-4 py-3 rounded-lg text-base font-bold transition-all duration-200 shadow-md flex items-center justify-center ${
                product.is_out_of_stock
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transform hover:scale-[1.02]'
              }`}
            >
              <Info className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
              {product.is_out_of_stock 
                ? (state.language === 'ar' ? 'نفد المخزون' : 'Out of Stock')
                : (state.language === 'ar' ? 'عرض التفاصيل' : 'See Details')
              }
            </button>
          </div>
        </div>
      </div>
      {showModal && (
        <ProductModal
          product={product}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
});