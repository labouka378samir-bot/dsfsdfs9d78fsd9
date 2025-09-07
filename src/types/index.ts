export interface User {
  id: string;
  email: string;
  username?: string;
  phone?: string;
  created_at: string;
}

export interface Category {
  id: string;
  slug: string;
  translations: CategoryTranslation[];
  created_at: string;
}

export interface CategoryTranslation {
  id: string;
  category_id: string;
  language: Language;
  name: string;
  description: string;
}

export interface Product {
  id: string;
  category_id?: string;
  sku: string;
  slug?: string;
  price_usd: number;
  price_dzd: number;
  duration_days: number;
  fulfillment_type: 'auto' | 'manual';
  stock_quantity: number;
  is_active: boolean;
  image_url: string;
  logo_url?: string;
  pricing_model?: 'simple' | 'variants';
  variants?: ProductVariant[];
  required_fields?: string[];
  badges?: string[];
  display_priority?: number;
  meta_title?: Record<string, string>;
  meta_description?: Record<string, string>;
  keywords?: string[];
  translations: ProductTranslation[];
  category?: Category;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id?: string;
  product_id?: string;
  name: Record<string, string>;
  duration_value: number;
  duration_unit: string;
  price_usd: number;
  price_dzd: number;
  fulfillment_type: 'auto' | 'manual' | 'assisted';
  stock_count: number;
  is_out_of_stock: boolean;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductTranslation {
  id: string;
  product_id: string;
  language: Language;
  name: string;
  description: string;
  activation_instructions: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: 'pending' | 'paid' | 'failed' | 'delivered' | 'refunded';
  payment_method?: 'paypal' | 'crypto' | 'chargily';
  payment_id?: string;
  currency: Currency;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  customer_email?: string;
  customer_phone?: string;
  payment_data: Record<string, any>;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  delivery_code?: string;
  delivery_status: 'pending' | 'delivered';
  delivered_at?: string;
  product?: Product;
}

export interface CartItem {
  id: string;
  user_id?: string;
  session_id?: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  product?: Product;
  variant?: ProductVariant;
  created_at: string;
  updated_at: string;
}

export interface Code {
  id: string;
  product_id: string;
  code: string;
  is_used: boolean;
  used_at?: string;
  order_item_id?: string;
}

export interface Settings {
  site_name: Record<Language, string>;
  exchange_rate_usd_to_dzd: number;
  tax_rate: number;
  payment_methods: {
    paypal: boolean;
    crypto: boolean;
    edahabia: boolean;
  };
  maintenance_mode: boolean;
  contact_info: {
    whatsapp: string;
    telegram: string;
    email: string;
  };
}

export type Language = 'en' | 'ar';
export type Currency = 'USD' | 'DZD';
export type Theme = 'light' | 'dark';

export interface AppState {
  language: Language;
  currency: Currency;
  theme: Theme;
  cart: CartItem[];
  settings: Settings;
  categories: Category[];
  isLoading: boolean;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string, phone?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export interface AppContextType {
  state: AppState;
  setLanguage: (language: Language) => void;
  setCurrency: (currency: Currency) => void;
  setTheme: (theme: Theme) => void;
  addToCart: (productId: string, quantity?: number, variantId?: string) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  refreshCategories: () => Promise<void>;
}

export interface PaymentData {
  method: 'paypal' | 'crypto' | 'edahabia';
  amount: number;
  currency: 'USD' | 'DZD';
  customerEmail: string;
  customerPhone?: string;
  items: CartItem[];
  userId?: string;
}

export interface PaymentResult {
  success: boolean;
  order_id?: string;
  payment_id?: string;
  error?: string;
}