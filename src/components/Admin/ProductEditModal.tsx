import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Star, Tag } from 'lucide-react';
import { EnhancedProduct, ProductVariant, adminDataService } from '../../services/AdminDataService';
import { useApp } from '../../contexts/AppContext';
import toast from 'react-hot-toast';

interface ProductEditModalProps {
  product?: EnhancedProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function ProductEditModal({ product, isOpen, onClose, onSave }: ProductEditModalProps) {
  const { state } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Form state
  const [formData, setFormData] = useState<Partial<EnhancedProduct>>({
    name_ar: '',
    name_en: '',
    description_ar: '',
    description_en: '',
    category_id: '',
    price_usd: 0,
    price_dzd: 0,
    duration_days: 0,
    fulfillment_type: 'manual',
    is_out_of_stock: false,
    is_active: true,
    image_url: '',
    logo_url: '',
    pricing_model: 'simple',
    variants: [],
    required_fields: [],
    badges: [],
    display_priority: 0,
    fulfillment_note_ar: '',
    fulfillment_note_en: '',
    fulfillment_note_fr: '',
    meta_title: { ar: '', en: '', fr: '' },
    meta_description: { ar: '', en: '', fr: '' },
    keywords: []
  });

  const [showPricingModelConfirm, setShowPricingModelConfirm] = useState(false);
  const [newPricingModel, setNewPricingModel] = useState<'simple' | 'variants'>('simple');

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      if (product) {
        setFormData({
          ...product,
          meta_title: product.meta_title || { ar: '', en: '', fr: '' },
          meta_description: product.meta_description || { ar: '', en: '', fr: '' },
          keywords: product.keywords || []
        });
      } else {
        // Reset form for new product
        setFormData({
          name_ar: '',
          name_en: '',
          name_fr: '',
          description_ar: '',
          description_en: '',
          description_fr: '',
          category_id: '',
          price_usd: 0,
          price_dzd: 0,
          duration_days: 0,
          fulfillment_type: 'manual',
          is_out_of_stock: false,
          is_active: true,
          image_url: '',
          logo_url: '',
          pricing_model: 'simple',
          variants: [],
          required_fields: [],
          badges: [],
          display_priority: 0,
          fulfillment_note_ar: '',
          fulfillment_note_en: '',
          fulfillment_note_fr: '',
          meta_title: { ar: '', en: '', fr: '' },
          meta_description: { ar: '', en: '', fr: '' },
          keywords: []
        });
      }
    }
  }, [isOpen, product]);

  const loadCategories = async () => {
    const cats = await adminDataService.getCategories();
    setCategories(cats);
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name_en || !formData.name_ar) {
      toast.error('Product name is required in Arabic and English');
      return;
    }

    if (!formData.description_en || !formData.description_ar) {
      toast.error('Product description is required in Arabic and English');
      return;
    }

    if (formData.pricing_model === 'variants' && (!formData.variants || formData.variants.length === 0)) {
      toast.error('At least one variant is required when using variants pricing model');
      return;
    }

    if (formData.pricing_model === 'simple' && (formData.price_usd === undefined || formData.price_usd < 0)) {
      toast.error('Valid price is required for simple pricing model');
      return;
    }

    setIsLoading(true);
    
    try {
      let success = false;
      
      if (product?.id) {
        // Update existing product
        success = await adminDataService.updateProduct(product.id, formData);
      } else {
        // Create new product
        const newProduct = await adminDataService.createProduct(formData);
        success = !!newProduct;
      }

      if (success) {
        onSave();
        onClose();
      }
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePricingModelChange = (newModel: 'simple' | 'variants') => {
    if (formData.pricing_model !== newModel) {
      setNewPricingModel(newModel);
      setShowPricingModelConfirm(true);
    }
  };

  const confirmPricingModelChange = () => {
    setFormData(prev => ({
      ...prev,
      pricing_model: newPricingModel,
      variants: newPricingModel === 'variants' ? (prev.variants || []) : []
    }));
    setShowPricingModelConfirm(false);
  };

  const addVariant = () => {
    const newVariant: ProductVariant = {
      name: { ar: '', en: '', fr: '' },
      duration_value: 1,
      duration_unit: 'months',
      price_usd: 0,
      price_dzd: 0,
      fulfillment_type: 'manual',
      stock_count: 0,
      is_out_of_stock: false,
      is_default: (formData.variants?.length || 0) === 0
    };

    setFormData(prev => ({
      ...prev,
      variants: [...(prev.variants || []), newVariant]
    }));
  };

  const updateVariant = (index: number, updates: Partial<ProductVariant>) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants?.map((variant, i) => 
        i === index ? { ...variant, ...updates } : variant
      ) || []
    }));
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants?.filter((_, i) => i !== index) || []
    }));
  };

  const addBadge = (badge: string) => {
    if (!formData.badges?.includes(badge)) {
      setFormData(prev => ({
        ...prev,
        badges: [...(prev.badges || []), badge]
      }));
    }
  };

  const removeBadge = (badge: string) => {
    setFormData(prev => ({
      ...prev,
      badges: prev.badges?.filter(b => b !== badge) || []
    }));
  };

  const addRequiredField = (field: string) => {
    if (!formData.required_fields?.includes(field)) {
      setFormData(prev => ({
        ...prev,
        required_fields: [...(prev.required_fields || []), field]
      }));
    }
  };

  const removeRequiredField = (field: string) => {
    setFormData(prev => ({
      ...prev,
      required_fields: prev.required_fields?.filter(f => f !== field) || []
    }));
  };

  if (!isOpen) return null;

  const getTranslation = (translations: any[], field: string, language: string) => {
    const translation = translations?.find(t => t.language === language);
    return translation?.[field] || '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto ${state.language === 'ar' ? 'rtl' : 'ltr'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
            
            {/* Product Names */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (Arabic) *
                </label>
                <input
                  type="text"
                  value={formData.name_ar || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="اسم المنتج"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (English) *
                </label>
                <input
                  type="text"
                  value={formData.name_en || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Product Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (French)
                </label>
                <input
                  type="text"
                  value={formData.name_fr || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name_fr: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nom du produit"
                />
              </div>
            </div>

            {/* Category and Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category_id || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {getTranslation(category.translations, 'name', state.language)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'active' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Priority
                </label>
                <input
                  type="number"
                  value={formData.display_priority || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_priority: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Image URL
                </label>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <input
                    type="url"
                    value={formData.image_url || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                  <button
                    type="button"
                    className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo URL
                </label>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <input
                    type="url"
                    value={formData.logo_url || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/logo.jpg"
                  />
                  <button
                    type="button"
                    className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Badges
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.badges?.map((badge, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {badge}
                    <button
                      onClick={() => removeBadge(badge)}
                      className="ml-1 rtl:mr-1 rtl:ml-0 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {['Best Value', 'New', 'Hot', 'Limited'].map((badge) => (
                  <button
                    key={badge}
                    onClick={() => addBadge(badge)}
                    disabled={formData.badges?.includes(badge)}
                    className="px-3 py-1 text-xs border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Tag className="h-3 w-3 inline mr-1 rtl:ml-1 rtl:mr-0" />
                    {badge}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Descriptions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Arabic) *
                </label>
                <textarea
                  value={formData.description_ar || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="وصف المنتج"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (English) *
                </label>
                <textarea
                  value={formData.description_en || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Product description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (French)
                </label>
                <textarea
                  value={formData.description_fr || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description_fr: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Description du produit"
                />
              </div>
            </div>
          </div>

          {/* Pricing Model */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Pricing & Duration</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pricing Model
              </label>
              <div className="flex space-x-4 rtl:space-x-reverse">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="pricing_model"
                    value="simple"
                    checked={formData.pricing_model === 'simple'}
                    onChange={(e) => handlePricingModelChange(e.target.value as 'simple' | 'variants')}
                    className="mr-2 rtl:ml-2 rtl:mr-0"
                  />
                  Simple (Single Price)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="pricing_model"
                    value="variants"
                    checked={formData.pricing_model === 'variants'}
                    onChange={(e) => handlePricingModelChange(e.target.value as 'simple' | 'variants')}
                    className="mr-2 rtl:ml-2 rtl:mr-0"
                  />
                  Variants (Multiple Tiers)
                </label>
              </div>
            </div>

            {/* Simple Pricing */}
            {formData.pricing_model === 'simple' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (DZD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price_dzd || ''}
                    onChange={(e) => {
                      const priceDzd = parseFloat(e.target.value) || 0;
                      const priceUsd = priceDzd / state.settings.exchange_rate_usd_to_dzd;
                      setFormData(prev => ({ 
                        ...prev, 
                        price_dzd: priceDzd,
                        price_usd: Math.round(priceUsd * 100) / 100 // Round to 2 decimal places
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    USD: ${(formData.price_dzd ? (formData.price_dzd / state.settings.exchange_rate_usd_to_dzd).toFixed(2) : '0.00')}
                    <span className="ml-2 rtl:mr-2 rtl:ml-0">
                      (Rate: 1$ = {state.settings.exchange_rate_usd_to_dzd} دج)
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    value={formData.duration_days || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_days: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Status
                  </label>
                  <select
                    value={formData.is_out_of_stock ? 'out_of_stock' : 'in_stock'}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_out_of_stock: e.target.value === 'out_of_stock' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>
            )}

            {/* Variants Pricing */}
            {formData.pricing_model === 'variants' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Product Variants</span>
                  <button
                    onClick={addVariant}
                    className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Variant</span>
                  </button>
                </div>

                {formData.variants?.map((variant, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">Variant {index + 1}</span>
                      <button
                        onClick={() => removeVariant(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Variant Names */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        value={variant.name.ar || ''}
                        onChange={(e) => updateVariant(index, { 
                          name: { ...variant.name, ar: e.target.value } 
                        })}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="اسم الباقة (عربي)"
                      />
                      <input
                        type="text"
                        value={variant.name.en || ''}
                        onChange={(e) => updateVariant(index, { 
                          name: { ...variant.name, en: e.target.value } 
                        })}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Variant Name (English)"
                      />
                      <input
                        type="text"
                        value={variant.name.fr || ''}
                        onChange={(e) => updateVariant(index, { 
                          name: { ...variant.name, fr: e.target.value } 
                        })}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nom de variante (Français)"
                      />
                    </div>

                    {/* Variant Details */}
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <input
                        type="number"
                        value={variant.duration_value}
                        onChange={(e) => updateVariant(index, { duration_value: parseInt(e.target.value) || 1 })}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Duration"
                      />
                      <select
                        value={variant.duration_unit}
                        onChange={(e) => updateVariant(index, { duration_unit: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="days">Days</option>
                        <option value="months">Months</option>
                        <option value="years">Years</option>
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        value={variant.price_dzd}
                        onChange={(e) => {
                          const priceDzd = parseFloat(e.target.value) || 0;
                          const priceUsd = priceDzd / state.settings.exchange_rate_usd_to_dzd;
                          updateVariant(index, { 
                            price_dzd: priceDzd,
                            price_usd: Math.round(priceUsd * 100) / 100
                          });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="DZD Price"
                      />
                      <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-600">
                        ${variant.price_dzd ? (variant.price_dzd / state.settings.exchange_rate_usd_to_dzd).toFixed(2) : '0.00'}
                      </div>
                      <input
                        type="number"
                        value={variant.is_out_of_stock ? 0 : 999}
                        disabled
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Stock Status"
                      />
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={!variant.is_out_of_stock}
                          onChange={(e) => updateVariant(index, { is_out_of_stock: !e.target.checked })}
                          className="mr-2 rtl:ml-2 rtl:mr-0"
                        />
                        In Stock
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={variant.is_default}
                          onChange={(e) => updateVariant(index, { is_default: e.target.checked })}
                          className="mr-2 rtl:ml-2 rtl:mr-0"
                        />
                        Default
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fulfillment */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Fulfillment</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fulfillment Type
              </label>
              <select
                value={formData.fulfillment_type || 'manual'}
                onChange={(e) => setFormData(prev => ({ ...prev, fulfillment_type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="auto">Automatic</option>
                <option value="manual">Manual</option>
                <option value="assisted">Assisted</option>
              </select>
            </div>

            {/* Fulfillment Notes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fulfillment Note (Arabic)
                </label>
                <textarea
                  value={formData.fulfillment_note_ar || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, fulfillment_note_ar: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="تعليمات التفعيل"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fulfillment Note (English)
                </label>
                <textarea
                  value={formData.fulfillment_note_en || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, fulfillment_note_en: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Activation instructions"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fulfillment Note (French)
                </label>
                <textarea
                  value={formData.fulfillment_note_fr || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, fulfillment_note_fr: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Instructions d'activation"
                />
              </div>
            </div>

            {/* Required Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Customer Fields
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.required_fields?.map((field, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {field}
                    <button
                      onClick={() => removeRequiredField(field)}
                      className="ml-1 rtl:mr-1 rtl:ml-0 text-green-600 hover:text-green-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {['email', 'region', 'account_info', 'phone', 'username'].map((field) => (
                  <button
                    key={field}
                    onClick={() => addRequiredField(field)}
                    disabled={formData.required_fields?.includes(field)}
                    className="px-3 py-1 text-xs border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {field}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SEO & Metadata */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">SEO & Metadata</h3>
            
            {/* Meta Titles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title (Arabic)
                </label>
                <input
                  type="text"
                  value={formData.meta_title?.ar || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    meta_title: { ...prev.meta_title, ar: e.target.value } 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="عنوان SEO"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title (English)
                </label>
                <input
                  type="text"
                  value={formData.meta_title?.en || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    meta_title: { ...prev.meta_title, en: e.target.value } 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="SEO Title"
                />
              </div>
            </div>

            {/* Meta Descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description (Arabic)
                </label>
                <textarea
                  value={formData.meta_description?.ar || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    meta_description: { ...prev.meta_description, ar: e.target.value } 
                  }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="وصف SEO"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description (English)
                </label>
                <textarea
                  value={formData.meta_description?.en || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    meta_description: { ...prev.meta_description, en: e.target.value } 
                  }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="SEO Description"
                />
              </div>
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={formData.keywords?.join(', ') || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 rtl:space-x-reverse p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </div>

      {/* Pricing Model Confirmation Modal */}
      {showPricingModelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Pricing Model Change</h3>
            <p className="text-gray-600 mb-6">
              Changing the pricing model will {newPricingModel === 'variants' ? 'allow you to add multiple pricing tiers' : 'remove all existing variants and use a single price'}. 
              Are you sure you want to continue?
            </p>
            <div className="flex space-x-3 rtl:space-x-reverse">
              <button
                onClick={() => setShowPricingModelConfirm(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmPricingModelChange}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}