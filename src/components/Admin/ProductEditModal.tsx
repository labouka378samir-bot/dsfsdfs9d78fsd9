import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Star, Tag, ToggleLeft, ToggleRight, Package } from 'lucide-react';
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

    if (formData.pricing_model === 'simple' && (formData.price_dzd === undefined || formData.price_dzd < 0)) {
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

  const addVariant = () => {
    const newVariant: ProductVariant = {
      name: { ar: '', en: '', fr: '' },
      duration_value: 1,
      duration_unit: 'months',
      price_usd: 0,
      price_dzd: 0,
      fulfillment_type: 'manual',
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

  // Auto-calculate USD price when DZD price changes
  const handleDzdPriceChange = (value: number) => {
    const priceUsd = value / state.settings.exchange_rate_usd_to_dzd;
    setFormData(prev => ({ 
      ...prev, 
      price_dzd: value,
      price_usd: Math.round(priceUsd * 100) / 100
    }));
  };

  // Auto-calculate USD price for variants
  const handleVariantDzdPriceChange = (index: number, value: number) => {
    const priceUsd = value / state.settings.exchange_rate_usd_to_dzd;
    updateVariant(index, { 
      price_dzd: value,
      price_usd: Math.round(priceUsd * 100) / 100
    });
  };

  if (!isOpen) return null;

  const getTranslation = (translations: any[], field: string, language: string) => {
    const translation = translations?.find(t => t.language === language);
    return translation?.[field] || '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto ${state.language === 'ar' ? 'rtl' : 'ltr'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            {product ? 'تعديل المنتج' : 'إضافة منتج جديد'}
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
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">المعلومات الأساسية</h3>
            
            {/* Product Names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم المنتج (عربي) *
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
                  اسم المنتج (إنجليزي) *
                </label>
                <input
                  type="text"
                  value={formData.name_en || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Product Name"
                />
              </div>
            </div>

            {/* Category, Status, and Out of Stock */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الفئة
                </label>
                <select
                  value={formData.category_id || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">اختر الفئة</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {getTranslation(category.translations, 'name', state.language)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الحالة
                </label>
                <select
                  value={formData.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'active' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  حالة المخزون
                </label>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, is_out_of_stock: !prev.is_out_of_stock }))}
                  className={`w-full flex items-center justify-center px-3 py-2 rounded-md border-2 transition-all ${
                    formData.is_out_of_stock
                      ? 'border-red-300 bg-red-50 text-red-700'
                      : 'border-green-300 bg-green-50 text-green-700'
                  }`}
                >
                  {formData.is_out_of_stock ? (
                    <>
                      <ToggleRight className="h-5 w-5 mr-2" />
                      نفد المخزون
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="h-5 w-5 mr-2" />
                      متوفر
                    </>
                  )}
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  أولوية العرض
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
                  رابط صورة المنتج
                </label>
                <input
                  type="url"
                  value={formData.image_url || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رابط اللوجو
                </label>
                <input
                  type="url"
                  value={formData.logo_url || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/logo.jpg"
                />
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">الأوصاف</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الوصف (عربي) *
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
                  الوصف (إنجليزي) *
                </label>
                <textarea
                  value={formData.description_en || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Product description"
                />
              </div>
            </div>
          </div>

          {/* Pricing Model */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">نموذج التسعير</h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-4 rtl:space-x-reverse mb-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="pricing_model"
                    value="simple"
                    checked={formData.pricing_model === 'simple'}
                    onChange={(e) => setFormData(prev => ({ ...prev, pricing_model: e.target.value as any }))}
                    className="mr-2 rtl:ml-2 rtl:mr-0"
                  />
                  <span className="font-medium">سعر واحد (Simple)</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="pricing_model"
                    value="variants"
                    checked={formData.pricing_model === 'variants'}
                    onChange={(e) => setFormData(prev => ({ ...prev, pricing_model: e.target.value as any }))}
                    className="mr-2 rtl:ml-2 rtl:mr-0"
                  />
                  <span className="font-medium">أسعار متعددة (Variants)</span>
                </label>
              </div>
              
              <div className="text-sm text-blue-700">
                <p><strong>سعر واحد:</strong> منتج بسعر ثابت واحد</p>
                <p><strong>أسعار متعددة:</strong> منتج بخيارات مختلفة (مثل: شهر، 3 أشهر، سنة) كل خيار له سعر منفصل</p>
              </div>
            </div>

            {/* Simple Pricing */}
            {formData.pricing_model === 'simple' && (
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h4 className="font-medium text-gray-900">إعدادات السعر الواحد</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      السعر (دينار جزائري) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price_dzd || ''}
                      onChange={(e) => handleDzdPriceChange(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1500"
                    />
                    <div className="mt-1 text-xs text-green-600 font-medium">
                      💵 السعر بالدولار: ${formData.price_dzd ? (formData.price_dzd / state.settings.exchange_rate_usd_to_dzd).toFixed(2) : '0.00'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      المدة (بالأيام)
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
                      نوع التسليم
                    </label>
                    <select
                      value={formData.fulfillment_type || 'manual'}
                      onChange={(e) => setFormData(prev => ({ ...prev, fulfillment_type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="auto">تلقائي</option>
                      <option value="manual">يدوي</option>
                      <option value="assisted">بمساعدة</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Variants Pricing */}
            {formData.pricing_model === 'variants' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">📋 كيفية استخدام الأسعار المتعددة:</h4>
                  <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
                    <li>اضغط "إضافة خيار" لإنشاء باقة جديدة</li>
                    <li>أدخل اسم الباقة (مثل: "شهر واحد" أو "3 أشهر")</li>
                    <li>حدد المدة والوحدة (أيام/أشهر/سنوات)</li>
                    <li>أدخل السعر بالدينار (الدولار يُحسب تلقائياً)</li>
                    <li>فعّل "افتراضي" للباقة الأكثر شعبية</li>
                  </ol>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">خيارات المنتج (Variants)</span>
                  <button
                    onClick={addVariant}
                    className="flex items-center space-x-1 rtl:space-x-reverse px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>إضافة خيار</span>
                  </button>
                </div>

                {formData.variants?.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>لا توجد خيارات بعد. اضغط "إضافة خيار" لإنشاء باقات مختلفة</p>
                  </div>
                )}

                {formData.variants?.map((variant, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4 bg-white">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">الخيار {index + 1}</span>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <label className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={variant.is_default}
                            onChange={(e) => {
                              // إذا تم تفعيل هذا كافتراضي، إلغاء الافتراضي من الباقي
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  variants: prev.variants?.map((v, i) => ({
                                    ...v,
                                    is_default: i === index
                                  })) || []
                                }));
                              } else {
                                updateVariant(index, { is_default: false });
                              }
                            }}
                            className="mr-1 rtl:ml-1 rtl:mr-0"
                          />
                          افتراضي
                        </label>
                        <button
                          type="button"
                          onClick={() => updateVariant(index, { is_out_of_stock: !variant.is_out_of_stock })}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            variant.is_out_of_stock
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {variant.is_out_of_stock ? 'نفد المخزون' : 'متوفر'}
                        </button>
                        <button
                          onClick={() => removeVariant(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Variant Names */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={variant.name.ar || ''}
                        onChange={(e) => updateVariant(index, { 
                          name: { ...variant.name, ar: e.target.value } 
                        })}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="اسم الباقة (عربي) - مثل: شهر واحد"
                      />
                      <input
                        type="text"
                        value={variant.name.en || ''}
                        onChange={(e) => updateVariant(index, { 
                          name: { ...variant.name, en: e.target.value } 
                        })}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Package Name (English) - e.g: 1 Month"
                      />
                    </div>

                    {/* Variant Details */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">المدة</label>
                        <input
                          type="number"
                          value={variant.duration_value}
                          onChange={(e) => updateVariant(index, { duration_value: parseInt(e.target.value) || 1 })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                          placeholder="1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">الوحدة</label>
                        <select
                          value={variant.duration_unit}
                          onChange={(e) => updateVariant(index, { duration_unit: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="days">أيام</option>
                          <option value="months">أشهر</option>
                          <option value="years">سنوات</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">السعر (دج)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={variant.price_dzd}
                          onChange={(e) => handleVariantDzdPriceChange(index, parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                          placeholder="1500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">السعر ($)</label>
                        <div className="px-2 py-1 bg-green-50 border border-green-200 rounded text-sm text-green-700 font-medium">
                          ${variant.price_dzd ? (variant.price_dzd / state.settings.exchange_rate_usd_to_dzd).toFixed(2) : '0.00'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">التسليم</label>
                        <select
                          value={variant.fulfillment_type}
                          onChange={(e) => updateVariant(index, { fulfillment_type: e.target.value as any })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="auto">تلقائي</option>
                          <option value="manual">يدوي</option>
                          <option value="assisted">بمساعدة</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Example for guidance */}
                {formData.variants?.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h5 className="font-medium text-yellow-800 mb-2">💡 مثال على الاستخدام:</h5>
                    <div className="text-sm text-yellow-700 space-y-1">
                      <p><strong>الخيار 1:</strong> "شهر واحد" - 1500 دج - افتراضي</p>
                      <p><strong>الخيار 2:</strong> "3 أشهر" - 4000 دج - وفر أكثر</p>
                      <p><strong>الخيار 3:</strong> "سنة كاملة" - 12000 دج - أفضل قيمة</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fulfillment Notes */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">ملاحظات التفعيل</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ملاحظة التفعيل (عربي)
                </label>
                <textarea
                  value={formData.fulfillment_note_ar || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, fulfillment_note_ar: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="سيتم إرسال بيانات الحساب عبر WhatsApp خلال 24 ساعة"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ملاحظة التفعيل (إنجليزي)
                </label>
                <textarea
                  value={formData.fulfillment_note_en || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, fulfillment_note_en: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Account details will be sent via WhatsApp within 24 hours"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 rtl:space-x-reverse p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'جاري الحفظ...' : (product ? 'تحديث المنتج' : 'إنشاء المنتج')}
          </button>
        </div>
      </div>
    </div>
  );
}