import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { AppContextType, AppState, Language, Currency, Theme, CartItem, Settings, Category } from '../types';
import toast from 'react-hot-toast';

const initialState: AppState = {
  language: 'en',
  currency: 'USD', // Will be auto-detected based on IP
  theme: 'light',
  cart: [],
  settings: {
    site_name: { en: 'ATHMANEBZN STORE', ar: 'متجر عثمان بن' },
    exchange_rate_usd_to_dzd: 250,
    tax_rate: 0,
    payment_methods: { paypal: true, crypto: true, edahabia: true },
    maintenance_mode: false,
    contact_info: { whatsapp: '', telegram: '', email: 'support@store.com' },
  },
  categories: [],
  isLoading: false,
};

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'SET_CURRENCY'; payload: Currency }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'SET_SETTINGS'; payload: Settings }
  | { type: 'SET_CATEGORIES'; payload: Category[] };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'SET_CURRENCY':
      return { ...state, currency: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_CART':
      return { ...state, cart: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [userIP, setUserIP] = React.useState<string>('');
  const [userCountry, setUserCountry] = React.useState<string>('');
  const [isQuickStart, setIsQuickStart] = React.useState(false);

  // Auto-detect currency based on IP location (Algeria = DZD, others = USD)
  const detectCurrencyFromIP = async () => {
    // Check for saved preferences first (instant)
    const savedLanguage = localStorage.getItem('preferred_language') as Language;
    const savedCurrency = localStorage.getItem('preferred_currency') as Currency;
    
    if (savedLanguage && savedCurrency) {
      // User has preferences - use them immediately
      dispatch({ type: 'SET_LANGUAGE', payload: savedLanguage });
      dispatch({ type: 'SET_CURRENCY', payload: savedCurrency });
      setIsInitialized(true);
      return;
    }
    
    // No saved preferences - quick start with defaults
    dispatch({ type: 'SET_LANGUAGE', payload: 'en' });
    dispatch({ type: 'SET_CURRENCY', payload: 'USD' });
    setIsInitialized(true);

    try {
      // Use faster IP detection with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
      
      const response = await fetch('https://ipapi.co/json/', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      // Store user IP and country info
      setUserIP(data.ip || 'unknown');
      setUserCountry(data.country_code || 'UNKNOWN');
      
      // Determine currency based on country
      const currency: Currency = data.country_code === 'DZ' ? 'DZD' : 'USD';
      
      // Update currency if different from default
      if (currency !== 'USD') {
        dispatch({ type: 'SET_CURRENCY', payload: currency });
        localStorage.setItem('preferred_currency', currency);
      }
      
    } catch (error: any) {
      // Silently fail - user already has defaults set
      setUserIP('unknown');
      setUserCountry('UNKNOWN');
    }
  };

  // Generate session ID for anonymous users
  const getSessionId = () => {
    if (typeof window === 'undefined') return null;
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  };

  // Load cart data
  const refreshCart = async () => {
    // Skip cart loading for admin user
    if (user && user.id === 'admin-user-id') {
      dispatch({ type: 'SET_CART', payload: [] });
      return;
    }

    try {
      const sessionId = getSessionId();
      let query = supabase
        .from('carts')
        .select(`
          *,
          product:products(
            *,
            translations:product_translations(*)
          )
        `);

      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        query = query.eq('session_id', sessionId);
      }

      const { data, error } = await query;

      if (error) throw error;
      dispatch({ type: 'SET_CART', payload: data || [] });
    } catch (error: any) {
      console.error('Error loading cart:', error);
      dispatch({ type: 'SET_CART', payload: [] });
    }
  };

  // Load settings
  const refreshSettings = async () => {
    try {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) {
        console.warn('Settings table not found, using default settings:', error);
        dispatch({ type: 'SET_SETTINGS', payload: initialState.settings });
        return;
      }

      const settingsMap = data.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});

      const settings: Settings = {
        site_name: settingsMap.site_name || initialState.settings.site_name,
        exchange_rate_usd_to_dzd: parseFloat(settingsMap.exchange_rate_usd_to_dzd) || 250,
        tax_rate: parseFloat(settingsMap.tax_rate) || 0,
        payment_methods: settingsMap.payment_methods || { paypal: true, crypto: true, edahabia: true },
        maintenance_mode: settingsMap.maintenance_mode === 'true' || settingsMap.maintenance_mode === true,
        contact_info: settingsMap.contact_info || initialState.settings.contact_info,
      };

      dispatch({ type: 'SET_SETTINGS', payload: settings });
    } catch (error: any) {
      console.error('Error loading settings:', error);
    }
  };

  // Load categories
  const refreshCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          translations:category_translations(*)
        `)
        .order('created_at');

      if (error) {
        console.warn('Categories table not found, using empty categories:', error);
        dispatch({ type: 'SET_CATEGORIES', payload: [] });
        return;
      }
      dispatch({ type: 'SET_CATEGORIES', payload: data || [] });
    } catch (error: any) {
      console.error('Error loading categories:', error);
      dispatch({ type: 'SET_CATEGORIES', payload: [] });
    }
  };

  // Cart operations
  const addToCart = async (productId: string, quantity = 1, variantId?: string) => {
    // Skip cart operations for admin user
    if (user && user.id === 'admin-user-id') {
      toast.error('Cart operations not available for admin users');
      return;
    }

    try {
      const sessionId = getSessionId();
      
      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from('carts')
        .select('*')
        .eq('product_id', productId)
        .eq(user ? 'user_id' : 'session_id', user ? user.id : sessionId)
        .maybeSingle();

      if (existingItem) {
        // Update existing item
        const { error } = await supabase
          .from('carts')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);
        
        if (error) throw error;
      } else {
        // Insert new item
        const cartData = {
          ...(user ? { user_id: user.id } : { session_id: sessionId }),
          product_id: productId,
          quantity,
          ...(variantId && { variant_id: variantId })
        };

        const { error } = await supabase
          .from('carts')
          .insert(cartData);
        
        if (error) throw error;
      }

      await refreshCart();
      toast.success('Added to cart!');
    } catch (error: any) {
      toast.error('Failed to add to cart');
      console.error('Error adding to cart:', error);
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    // Skip cart operations for admin user
    if (user && user.id === 'admin-user-id') {
      toast.error('Cart operations not available for admin users');
      return;
    }

    try {
      if (quantity <= 0) {
        await removeFromCart(itemId);
        return;
      }

      const { error } = await supabase
        .from('carts')
        .update({ quantity })
        .eq('id', itemId);

      if (error) throw error;
      await refreshCart();
    } catch (error: any) {
      toast.error('Failed to update cart');
      console.error('Error updating cart:', error);
    }
  };

  const removeFromCart = async (itemId: string) => {
    // Skip cart operations for admin user
    if (user && user.id === 'admin-user-id') {
      toast.error('Cart operations not available for admin users');
      return;
    }

    try {
      const { error } = await supabase
        .from('carts')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      await refreshCart();
      toast.success('Removed from cart');
    } catch (error: any) {
      toast.error('Failed to remove from cart');
      console.error('Error removing from cart:', error);
    }
  };

  const clearCart = async () => {
    // Skip cart operations for admin user
    if (user && user.id === 'admin-user-id') {
      toast.error('Cart operations not available for admin users');
      return;
    }

    try {
      const sessionId = getSessionId();
      
      const { error } = await supabase
        .from('carts')
        .delete()
        .or(user ? `user_id.eq.${user.id}` : `session_id.eq.${sessionId}`);

      if (error) throw error;
      dispatch({ type: 'SET_CART', payload: [] });
      toast.success('Cart cleared');
    } catch (error: any) {
      toast.error('Failed to clear cart');
      console.error('Error clearing cart:', error);
    }
  };

  // Initialize app data
  useEffect(() => {
    detectCurrencyFromIP();
    // Load settings and categories in background
    setTimeout(() => {
      refreshSettings();
      refreshCategories();
    }, 100);
  }, []);

  // Load cart when user changes
  useEffect(() => {
    refreshCart();
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    const settingsSubscription = supabase
      .channel('settings-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'settings' },
          () => {
            refreshSettings();
          }
      )
      .subscribe();

    const cartSubscription = supabase
      .channel('cart-changes')
      .on('postgres_changes',
          { event: '*', schema: 'public', table: 'carts' },
          () => {
            refreshCart();
          }
      )
      .subscribe();

    const categoriesSubscription = supabase
      .channel('categories-changes')
      .on('postgres_changes',
          { event: '*', schema: 'public', table: 'categories' },
          () => {
            refreshCategories();
          }
      )
      .subscribe();

    const productsSubscription = supabase
      .channel('products-changes')
      .on('postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          () => {
            // This will trigger ProductGrid to refresh
          }
      )
      .subscribe();
    return () => {
      settingsSubscription.unsubscribe();
      cartSubscription.unsubscribe();
      categoriesSubscription.unsubscribe();
      productsSubscription.unsubscribe();
    };
  }, [user]);

  const value: AppContextType = {
    state,
    setLanguage: (language: Language) => {
      dispatch({ type: 'SET_LANGUAGE', payload: language });
      localStorage.setItem('preferred_language', language);
    },
    setCurrency: (currency: Currency) => {
      dispatch({ type: 'SET_CURRENCY', payload: currency });
      localStorage.setItem('preferred_currency', currency);
    },
    setTheme: (theme: Theme) => dispatch({ type: 'SET_THEME', payload: theme }),
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
    refreshSettings,
    refreshCategories,
  };

  return (
    <AppContext.Provider value={value}>
      {isInitialized ? children : (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            {isQuickStart ? (
              <div className="flex items-center space-x-2">
                <img src="/logo.PNG" alt="ATHMANEBZN" className="h-8 w-8 animate-pulse" />
                <span className="text-xl font-bold text-primary-500">ATHMANEBZN</span>
              </div>
            ) : (
              <>
                <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-secondary-600 text-sm">Loading...</p>
              </>
            )}
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
}