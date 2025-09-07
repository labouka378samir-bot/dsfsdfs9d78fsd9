import { supabase, createServiceClient } from '../lib/supabase';
import { Product, Category, Order, Settings } from '../types';
import toast from 'react-hot-toast';

// Enhanced Product type with variants support
export interface ProductVariant {
  id?: string;
  name: Record<string, string>; // Multi-language names
  duration_value: number;
  duration_unit: string; // 'days', 'months', 'years'
  price_usd: number;
  price_dzd: number;
  fulfillment_type: 'auto' | 'manual' | 'assisted';
  is_out_of_stock: boolean;
  is_default: boolean;
}

export interface EnhancedProduct extends Omit<Product, 'translations'> {
  // Multi-language fields
  name_ar: string;
  name_en: string;
  name_fr: string;
  description_ar: string;
  description_en: string;
  description_fr: string;
  duration_ar?: string;
  duration_en?: string;
  duration_fr?: string;
  
  // Fulfillment
  fulfillment_note_ar?: string;
  fulfillment_note_en?: string;
  fulfillment_note_fr?: string;
  required_fields: string[]; // ['email', 'region', 'account_info']
  
  // Pricing model
  pricing_model: 'simple' | 'variants';
  variants?: ProductVariant[];
  
  // SEO & Metadata
  meta_title?: Record<string, string>;
  meta_description?: Record<string, string>;
  keywords?: string[];
  display_priority: number;
  
  // Visual
  badges?: string[]; // ['Best Value', 'New', 'Hot', 'Limited']
  logo_url?: string;
}

export interface CodeData {
  id: string;
  product_id: string;
  code: string;
  is_used: boolean;
  used_at?: string;
  order_item_id?: string;
  product?: {
    name_en: string;
    name_ar: string;
  };
}

class AdminDataService {
  private static instance: AdminDataService;
  
  private constructor() {}
  
  static getInstance(): AdminDataService {
    if (!AdminDataService.instance) {
      AdminDataService.instance = new AdminDataService();
    }
    return AdminDataService.instance;
  }

  // ==================== PRODUCTS ====================
  
  async getProducts(): Promise<EnhancedProduct[]> {
    try {
      const client = createServiceClient();
      const { data: products, error } = await client
        .from('products')
        .select(`
          *,
          translations:product_translations(*),
          category:categories(
            id,
            slug,
            translations:category_translations(*)
          )
        ,
          variants:product_variants(*)
          `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const enhancedProducts = (products || []).map(this.transformToEnhancedProduct.bind(this));
      return enhancedProducts;
    } catch (error: any) {
      console.error('Error loading products:', error);
      toast.error(`Failed to load products: ${error.message}`);
      return [];
    }
  }

  async createProduct(productData: Partial<EnhancedProduct>): Promise<EnhancedProduct | null> {
    try {
      const slug = this.generateSlug(productData.name_en || '');
      
      const client = createServiceClient();
      const { data: product, error: productError } = await client
        .from('products')
        .insert({
          sku: productData.sku || this.generateSKU(),
          slug,
          category_id: productData.category_id,
          price_usd: productData.price_usd || 0,
          price_dzd: productData.price_dzd || 0,
          duration_days: productData.duration_days || 0,
          fulfillment_type: productData.fulfillment_type || 'manual',
          is_out_of_stock: productData.is_out_of_stock || false,
          is_active: productData.is_active ?? true,
          image_url: productData.image_url || '',
          logo_url: productData.logo_url || '',
          pricing_model: productData.pricing_model || 'simple',
          required_fields: productData.required_fields || [],
          badges: productData.badges || [],
          display_priority: productData.display_priority || 0,
          meta_title: productData.meta_title || {},
          meta_description: productData.meta_description || {},
          keywords: productData.keywords || []
        })
        .select()
        .single();

      if (productError) throw productError;

      const translations = [
        {
          product_id: product.id,
          language: 'ar',
          name: productData.name_ar || '',
          description: productData.description_ar || '',
          activation_instructions: productData.fulfillment_note_ar || ''
        },
        {
          product_id: product.id,
          language: 'en',
          name: productData.name_en || '',
          description: productData.description_en || '',
          activation_instructions: productData.fulfillment_note_en || ''
        },
        {
          product_id: product.id,
          language: 'fr',
          name: productData.name_fr || '',
          description: productData.description_fr || '',
          activation_instructions: productData.fulfillment_note_fr || ''
        }
      ];

      const { error: translationError } = await client
        .from('product_translations')
        .upsert(translations, { 
          onConflict: 'product_id,language' 
        });

      if (translationError) throw translationError;

      // Auto-calculate USD price if not provided
      if (productData.price_dzd && !productData.price_usd) {
        const calculatedUsdPrice = productData.price_dzd / 250; // Default exchange rate
        await client
          .from('products')
          .update({ price_usd: Math.round(calculatedUsdPrice * 100) / 100 })
          .eq('id', product.id);
      }

      if (productData.pricing_model === 'variants' && productData.variants?.length) {
        const variantInserts = productData.variants.map(variant => ({
          product_id: product.id,
          name: variant.name,
          duration_value: variant.duration_value,
          duration_unit: variant.duration_unit,
          price_usd: variant.price_usd,
          price_dzd: variant.price_dzd,
          fulfillment_type: variant.fulfillment_type,
          is_out_of_stock: variant.is_out_of_stock,
          is_default: variant.is_default
        }));

        const { error: variantError } = await client
          .from('product_variants')
          .insert(variantInserts);

        if (variantError) throw variantError;
      }

      toast.success('Product created successfully');
      return await this.getProductById(product.id);
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast.error(`Failed to create product: ${error.message}`);
      return null;
    }
  }

  async updateProduct(id: string, updates: Partial<EnhancedProduct>): Promise<boolean> {
    try {
      const productUpdates: any = {};
      
      if (updates.name_en) productUpdates.slug = this.generateSlug(updates.name_en);
      if (updates.category_id !== undefined) productUpdates.category_id = updates.category_id;
      if (updates.price_usd !== undefined) productUpdates.price_usd = updates.price_usd;
      if (updates.price_dzd !== undefined) productUpdates.price_dzd = updates.price_dzd;
      if (updates.duration_days !== undefined) productUpdates.duration_days = updates.duration_days;
      if (updates.fulfillment_type) productUpdates.fulfillment_type = updates.fulfillment_type;
      if (updates.is_out_of_stock !== undefined) productUpdates.is_out_of_stock = updates.is_out_of_stock;
      if (updates.is_active !== undefined) productUpdates.is_active = updates.is_active;
      if (updates.image_url !== undefined) productUpdates.image_url = updates.image_url;
      if (updates.logo_url !== undefined) productUpdates.logo_url = updates.logo_url;
      if (updates.pricing_model) productUpdates.pricing_model = updates.pricing_model;
      if (updates.required_fields) productUpdates.required_fields = updates.required_fields;
      if (updates.badges) productUpdates.badges = updates.badges;
      if (updates.display_priority !== undefined) productUpdates.display_priority = updates.display_priority;
      if (updates.meta_title) productUpdates.meta_title = updates.meta_title;
      if (updates.meta_description) productUpdates.meta_description = updates.meta_description;
      if (updates.keywords) productUpdates.keywords = updates.keywords;
      
      productUpdates.updated_at = new Date().toISOString();

      const client = createServiceClient();

      if (Object.keys(productUpdates).length > 0) {
        const { error: productError } = await client
          .from('products')
          .update(productUpdates)
          .eq('id', id);

        if (productError) throw productError;
      }

      const languages = ['ar', 'en', 'fr'] as const;
      for (const lang of languages) {
        const nameKey = `name_${lang}` as keyof EnhancedProduct;
        const descKey = `description_${lang}` as keyof EnhancedProduct;
        const noteKey = `fulfillment_note_${lang}` as keyof EnhancedProduct;
        
        if (updates[nameKey] !== undefined || updates[descKey] !== undefined || updates[noteKey] !== undefined) {
          const translationUpdate: any = {};
          if (updates[nameKey] !== undefined) translationUpdate.name = updates[nameKey];
          if (updates[descKey] !== undefined) translationUpdate.description = updates[descKey];
          if (updates[noteKey] !== undefined) translationUpdate.activation_instructions = updates[noteKey];

          const { error: translationError } = await client
            .from('product_translations')
            .upsert({
              product_id: id,
              language: lang,
              ...translationUpdate
            }, { 
              onConflict: 'product_id,language' 
            });

          if (translationError) throw translationError;
        }
      }

      if (updates.pricing_model === 'variants' && updates.variants) {
        // Delete existing variants first
        await client.from('product_variants').delete().eq('product_id', id);

        if (updates.variants.length > 0) {
          const variantInserts = updates.variants.map(variant => ({
            product_id: id,
            name: variant.name,
            duration_value: variant.duration_value,
            duration_unit: variant.duration_unit,
            price_usd: variant.price_usd,
            price_dzd: variant.price_dzd,
            fulfillment_type: variant.fulfillment_type,
            is_out_of_stock: variant.is_out_of_stock,
            is_default: variant.is_default
          }));

          const { error: variantError } = await client
            .from('product_variants')
            .insert(variantInserts);

          if (variantError) throw variantError;
        }
      } else if (updates.pricing_model === 'simple') {
        // Remove all variants when switching to simple pricing
        await client.from('product_variants').delete().eq('product_id', id);
      }

      toast.success('Product updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(`Failed to update product: ${error.message}`);
      return false;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const client = createServiceClient();
      await client.from('product_variants').delete().eq('product_id', id);
      await client.from('product_translations').delete().eq('product_id', id);
      await client.from('codes').delete().eq('product_id', id);
      await client.from('carts').delete().eq('product_id', id);
      
      const { error } = await client.from('products').delete().eq('id', id);
      if (error) throw error;
      
      toast.success('Product deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(`Failed to delete product: ${error.message}`);
      return false;
    }
  }

  async getProductById(id: string): Promise<EnhancedProduct | null> {
    try {
      const client = createServiceClient();
      const { data, error } = await client
        .from('products')
        .select(`
          *,
          translations:product_translations(*),
          category:categories(
            id,
            slug,
            translations:category_translations(*)
          )
        ,
          variants:product_variants(*)
          `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return this.transformToEnhancedProduct(data);
    } catch (error: any) {
      console.error('Error loading product:', error);
      return null;
    }
  }

  // ==================== ORDERS ====================
  
  async getOrders(): Promise<Order[]> {
    try {
      const client = createServiceClient();
      const { data, error } = await client
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(
              *,
              translations:product_translations(*)
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error loading orders:', error);
      toast.error(`Failed to load orders: ${error.message}`);
      return [];
    }
  }

  async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    try {
      const client = createServiceClient();
      const { error } = await client
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      toast.success('Order status updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error(`Failed to update order status: ${error.message}`);
      return false;
    }
  }

  async deleteOrder(orderId: string): Promise<boolean> {
    try {
      const client = createServiceClient();
      await client.from('order_items').delete().eq('order_id', orderId);
      const { error } = await client.from('orders').delete().eq('id', orderId);
      if (error) throw error;
      
      toast.success('Order deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting order:', error);
      toast.error(`Failed to delete order: ${error.message}`);
      return false;
    }
  }

  // ==================== CATEGORIES ====================
  
  async getCategories(): Promise<Category[]> {
    try {
      const client = createServiceClient();
      const { data, error } = await client
        .from('categories')
        .select(`
          *,
          translations:category_translations(*)
        `)
        .order('created_at');

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error loading categories:', error);
      toast.error(`Failed to load categories: ${error.message}`);
      return [];
    }
  }

  async createCategory(categoryData: { 
    slug: string; 
    translations: Array<{ language: string; name: string; description: string }> 
  }): Promise<boolean> {
    try {
      const client = createServiceClient();
      const { data: category, error: categoryError } = await client
        .from('categories')
        .insert({ slug: categoryData.slug })
        .select()
        .single();

      if (categoryError) throw categoryError;
      const { error: translationError } = await client
        .from('category_translations')
        .insert(
          categoryData.translations.map(t => ({
            category_id: category.id,
            language: t.language,
            name: t.name,
            description: t.description
          }))
        );

      if (translationError) throw translationError;
      toast.success('Category created successfully');
      return true;
    } catch (error: any) {
      console.error('Error creating category:', error);
      toast.error(`Failed to create category: ${error.message}`);
      return false;
    }
  }

  async updateCategory(categoryId: string, updates: { 
    slug?: string; 
    translations?: Array<{ language: string; name: string; description: string }> 
  }): Promise<boolean> {
    try {
      const client = createServiceClient();

      if (updates.slug) {
        const { error: categoryError } = await client
          .from('categories')
          .update({ slug: updates.slug })
          .eq('id', categoryId);

        if (categoryError) throw categoryError;
      }

      if (updates.translations) {
        await client.from('category_translations').delete().eq('category_id', categoryId);

        const { error: translationError } = await client
          .from('category_translations')
          .insert(
            updates.translations.map(t => ({
              category_id: categoryId,
              language: t.language,
              name: t.name,
              description: t.description
            }))
          );

        if (translationError) throw translationError;
      }
      
      toast.success('Category updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast.error(`Failed to update category: ${error.message}`);
      return false;
    }
  }

  async deleteCategory(categoryId: string): Promise<boolean> {
    try {
      const client = createServiceClient();
      await client.from('category_translations').delete().eq('category_id', categoryId);
      const { error } = await client.from('categories').delete().eq('id', categoryId);
      if (error) throw error;
      
      toast.success('Category deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(`Failed to delete category: ${error.message}`);
      return false;
    }
  }

  // ==================== CODES ====================
  
  async getCodes(): Promise<CodeData[]> {
    try {
      const client = createServiceClient();
      const { data, error } = await client
        .from('codes')
        .select(`
          *,
          product:products(
            translations:product_translations(name, language)
          )
        `)
        .order('id', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(code => ({
        ...code,
        product: {
          name_en: code.product?.translations?.find((t: any) => t.language === 'en')?.name || 'Unknown',
          name_ar: code.product?.translations?.find((t: any) => t.language === 'ar')?.name || 'غير معروف'
        }
      }));
    } catch (error: any) {
      console.error('Error loading codes:', error);
      toast.error(`Failed to load codes: ${error.message}`);
      return [];
    }
  }

  async addCodes(productId: string, codes: string[]): Promise<boolean> {
    try {
      const codeInserts = codes.map(code => ({
        product_id: productId,
        code: code.trim(),
        is_used: false
      }));

      const client = createServiceClient();
      const { error } = await client.from('codes').insert(codeInserts);
      if (error) throw error;
      
      toast.success(`${codes.length} codes added successfully`);
      return true;
    } catch (error: any) {
      console.error('Error adding codes:', error);
      toast.error(`Failed to add codes: ${error.message}`);
      return false;
    }
  }

  async deleteCode(codeId: string): Promise<boolean> {
    try {
      const client = createServiceClient();
      const { error } = await client.from('codes').delete().eq('id', codeId);
      if (error) throw error;
      
      toast.success('Code deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting code:', error);
      toast.error(`Failed to delete code: ${error.message}`);
      return false;
    }
  }

  // ==================== SETTINGS ====================
  
  async getSettings(): Promise<Settings> {
    try {
      const client = createServiceClient();
      const { data, error } = await client.from('settings').select('*');
      if (error) throw error;

      const settingsMap = (data || []).reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});

      return {
        site_name: settingsMap.site_name || { en: 'ATHMANEBZN STORE', ar: 'متجر عثمان بن' },
        exchange_rate_usd_to_dzd: parseFloat(settingsMap.exchange_rate_usd_to_dzd) || 250,
        tax_rate: parseFloat(settingsMap.tax_rate) || 0,
        payment_methods: settingsMap.payment_methods || { paypal: true, crypto: true, edahabia: true },
        maintenance_mode: settingsMap.maintenance_mode === 'true' || settingsMap.maintenance_mode === true,
        contact_info: settingsMap.contact_info || { whatsapp: '', telegram: '', email: 'support@store.com' },
      };
    } catch (error: any) {
      console.error('Error loading settings:', error);
      return {
        site_name: { en: 'ATHMANEBZN STORE', ar: 'متجر عثمان بن' },
        exchange_rate_usd_to_dzd: 250,
        tax_rate: 0,
        payment_methods: { paypal: true, crypto: true, edahabia: true },
        maintenance_mode: false,
        contact_info: { whatsapp: '', telegram: '', email: 'support@store.com' },
      };
    }
  }

  async updateSetting(key: string, value: any): Promise<boolean> {
    try {
      const client = createServiceClient();
      const { error } = await client
        .from('settings')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

      if (error) throw error;
      toast.success('Setting updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating setting:', error);
      toast.error(`Failed to update setting: ${error.message}`);
      return false;
    }
  }

  // ==================== DASHBOARD STATS ====================
  
  async getDashboardStats() {
    try {
      const [products, orders, codes] = await Promise.all([
        this.getProducts(),
        this.getOrders(),
        this.getCodes()
      ]);

      const totalRevenue = orders
        .filter(order => order.status === 'paid')
        .reduce((sum, order) => sum + order.total_amount, 0);

      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      const activeProducts = products.filter(product => product.is_active).length;
      const totalCodes = codes.length;
      const usedCodes = codes.filter(code => code.is_used).length;

      return {
        totalProducts: products.length,
        activeProducts,
        totalOrders: orders.length,
        pendingOrders,
        totalRevenue,
        totalCodes,
        usedCodes,
        availableCodes: totalCodes - usedCodes,
        recentOrders: orders.slice(0, 5)
      };
    } catch (error: any) {
      console.error('Error loading dashboard stats:', error);
      return {
        totalProducts: 0,
        activeProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        totalCodes: 0,
        usedCodes: 0,
        availableCodes: 0,
        recentOrders: []
      };
    }
  }

  // ==================== UTILITY METHODS ====================
  
  private transformToEnhancedProduct(data: any): EnhancedProduct {
    const translations = data.translations || [];
    
    const getTranslation = (lang: string, field: string) => {
      const translation = translations.find((t: any) => t.language === lang);
      return translation?.[field] || '';
    };

    return {
      ...data,
      sku: data.sku || `PROD-${Date.now()}`,
      slug: data.slug || this.generateSlug(data.sku || 'product'),
      price_usd: data.price_usd || 0,
      price_dzd: data.price_dzd || 0,
      duration_days: data.duration_days || 0,
      fulfillment_type: data.fulfillment_type || 'manual',
      is_out_of_stock: Boolean(data.is_out_of_stock),
      is_active: data.is_active !== undefined ? data.is_active : true,
      image_url: data.image_url || '',
      logo_url: data.logo_url || '',
      pricing_model: data.pricing_model || 'simple',
      
      name_ar: getTranslation('ar', 'name'),
      name_en: getTranslation('en', 'name'),
      name_fr: getTranslation('fr', 'name'),
      description_ar: getTranslation('ar', 'description'),
      description_en: getTranslation('en', 'description'),
      description_fr: getTranslation('fr', 'description'),
      fulfillment_note_ar: getTranslation('ar', 'activation_instructions'),
      fulfillment_note_en: getTranslation('en', 'activation_instructions'),
      fulfillment_note_fr: getTranslation('fr', 'activation_instructions'),
      
      variants: data.variants || [],
      required_fields: data.required_fields || [],
      badges: data.badges || [],
      display_priority: data.display_priority || 0,
      meta_title: data.meta_title || {},
      meta_description: data.meta_description || {},
      keywords: data.keywords || [],
      
      category: data.category || null,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private generateSKU(): string {
    return `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }
}

export const adminDataService = AdminDataService.getInstance();