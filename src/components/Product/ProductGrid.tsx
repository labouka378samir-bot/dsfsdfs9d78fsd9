import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Product, Category } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { ProductCard } from './ProductCard';

// Memoized ProductCard to prevent unnecessary re-renders
const MemoizedProductCard = React.memo(ProductCard);

export function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const { state } = useApp();
  const { t, getTranslation } = useTranslation();

  // Debounced search to reduce API calls
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    // Load products immediately without waiting
    const loadProductsAsync = async () => {
      await loadProducts();
    };
    loadProductsAsync();
    
    // Set up real-time subscription for live product updates
    const subscription = supabase
      .channel('products-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'products' },
          () => {
            console.log('Products updated, refreshing product grid...');
            loadProducts();
          }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedCategory]);

  const loadProducts = async () => {
    try {
      // Don't show loading for subsequent loads
      if (products.length === 0) {
        setIsLoading(true);
      }
      
      let query = supabase
        .from('products')
        .select(`
          *,
          translations:product_translations(*),
          category:categories(
            id,
            slug,
            translations:category_translations(*)
          )
        `)
        .eq('is_active', true); // Show all active products, even if out of stock

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      // Fixed sorting: Stock availability first, then display priority, then creation date
      query = query
        .order('stock_quantity', { ascending: false })
        .order('display_priority', { ascending: false })
        .order('created_at', { ascending: false });
      
      const { data, error } = await query;

      if (error) {
        console.warn('Products table not found or relationship error:', error);
        setProducts([]);
        return;
      }
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Memoized filtered products to prevent unnecessary recalculations
  const filteredProducts = React.useMemo(() => {
    if (!debouncedSearchQuery) return products;
    
    const name = getTranslation(product.translations, 'name').toLowerCase();
    const description = getTranslation(product.translations, 'description').toLowerCase();
    const query = debouncedSearchQuery.toLowerCase();
    
    return products.filter(product => {
      const name = getTranslation(product.translations, 'name').toLowerCase();
      const description = getTranslation(product.translations, 'description').toLowerCase();
      
      return name.includes(query) || description.includes(query);
    });
  }, [products, debouncedSearchQuery, getTranslation]);

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 ${state.language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
          Premium Digital Subscriptions
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-4 sm:mb-6 max-w-3xl mx-auto sm:mx-0">
          Discover premium streaming services, gaming accounts, and software licenses at unbeatable prices. Instant delivery guaranteed.
        </p>
        
        {/* Search and Filters */}
        <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center">
          {/* Search */}
          <div className="relative w-full lg:flex-1 lg:max-w-lg">
            <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-secondary-400 h-5 w-5" />
            <input
              type="text"
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-2 sm:py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 sm:px-4 py-2 sm:py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base min-w-0 lg:w-48"
          >
            <option value="">All Categories</option>
            {state.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {getTranslation(category.translations, 'name')}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Loading */}
      {isLoading ? (
        <div className="text-center py-8 sm:py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-secondary-600">{t('common.loading')}</p>
        </div>
      ) : (
        <>
          {/* Products Grid/List */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <MemoizedProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-base sm:text-lg font-semibold text-secondary-900 mb-2">No products found</h3>
              <p className="text-sm sm:text-base text-secondary-600 mb-4 px-4">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                }}
                className="bg-primary-500 text-secondary-900 px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-primary-600 transition-colors text-sm sm:text-base"
              >
                Clear Filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}