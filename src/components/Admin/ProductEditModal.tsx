import React, { useState, useEffect } from 'react';
import { X, Save, Package, DollarSign, Calendar, Settings, Globe, Image, Key, AlertCircle } from 'lucide-react';
import { adminDataService, EnhancedProduct } from '../../services/AdminDataService';
import { useApp } from '../../contexts/AppContext';
import toast from 'react-hot-toast';

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: EnhancedProduct | null;
  onSave: () => void;
}

export function ProductEditModal({ isOpen, onClose, product, onSave }: ProductEditModalProps) {
  const { state } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<EnhancedProduct>>({
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    price_usd: 0,
    price_dzd: 0,
    duration_days: 30,
    fulfillment_type: 'manual',
    is_out_of_stock: false,
    is_active: true,
    image_url: '',
    category_id: '',
    pricing_model: 'simple',
    variants: []
  });

  // Initialize form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        name_en: product.name_en || '',
        name_ar: product.name_ar || '',
        description_en: product.description_en || '',
        description_ar: product.description_ar || '',
        price_usd: product.price_usd || 0,
        price_dzd: product.price_dzd || 0,
        duration_days: product.duration_days || 30,
        fulfillment_type: product.fulfillment_type || 'manual',
        is_out_of_stock: product.is_out_of_stock || false,
        is_active: product.is_active !== undefined ? product.is_active : true,
        image_url: product.image_url || '',
        category_id: product.category_id || '',
        pricing_model: (product.variants && product.variants.length>0) ? 'variants' : (product.pricing_model || 'simple'),
        variants: product.variants || []
      });
    } else {
      // Reset for new product
      setFormData({
        name_en: '',
        name_ar: '',
        description_en: '',
        description_ar: '',
        price_usd: 0,
        price_dzd: 0,
        duration_days: 30,
        fulfillment_type: 'manual',
        is_out_of_stock: false,
        is_active: true,
        image_url: '',
        category_id: '',
        pricing_model: 'simple',
        variants: []
      });
    }
  }, [product]);

  // Auto-calculate USD price when DZD price changes
  useEffect(() => {
    if (formData.price_dzd && formData.price_dzd > 0) {
      const calculatedUsd = formData.price_dzd / state.settings.exchange_rate_usd_to_dzd;
      setFormData(prev => ({
        ...prev,
        price_usd: Math.round(calculatedUsd * 100) / 100
      }));
    }
  }, [formData.price_dzd, state.settings.exchange_rate_usd_to_dzd]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name_en || !formData.name_ar) {
      toast.error('Product name is required in both languages');
      return;
    }

    if (!formData.price_dzd || formData.price_dzd <= 0) {
      toast.error('Price in DZD is required');
      return;
    }

    setIsLoading(true);

    try {
      let success = false;
      
      if (product) {
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
        toast.success(product ? 'Product updated successfully!' : 'Product created successfully!');
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setIsLoading(false);
    }
  };

  const addVariant = () => {
    const newVariant = {
      name: { en: '', ar: '' },
      duration_value: 1,
      duration_unit: 'months',
      price_usd: 0,
      price_dzd: 0,
      fulfillment_type: 'manual' as const,
      is_out_of_stock: false,
      is_default: false
    };
    
    setFormData(prev => ({
      ...prev,
      variants: [...(prev.variants || []), newVariant]
    }));
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
            <>
              {/* English Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (English) *
                </label>
                <textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product description in English"
                  required
                />
              </div>

              {/* Arabic Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Arabic) *
                </label>
                <textarea
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل وصف المنتج بالعربية"
            <>
              {/* DZD Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (DZD) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    value={formData.price_dzd}
                    onChange={(e) => setFormData({ ...formData, price_dzd: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* USD Price (Auto-calculated) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (USD) - Auto-calculated
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    value={formData.price_usd}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    placeholder="0.00"
                    readOnly
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Calculated: {formData.price_dzd} DZD ÷ {state.settings.exchange_rate_usd_to_dzd} = ${formData.price_usd}
                </p>
              </div>
            </>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hide base price/duration when using variants */}
            {formData.pricing_model !== 'variants' && (
            {/* English Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name (English) *
              </label>
              <input
                type="text"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter product name in English"
                required
              />
            </div>

            {/* Arabic Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name (Arabic) *
              </label>
              <input
                type="text"
                value={formData.name_ar}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل اسم المنتج بالعربية"
                required
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hide base price/duration when using variants */}
            {formData.pricing_model !== 'variants' && (
            {/* English Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (English) *
              </label>
              <textarea
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter product description in English"
                required
              />
            </div>

            {/* Arabic Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Arabic) *
              </label>
              <textarea
                value={formData.description_ar}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل وصف المنتج بالعربية"
                required
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hide base price/duration when using variants */}
            {formData.pricing_model !== 'variants' && (
            {/* DZD Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (DZD) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="number"
                  value={formData.price_dzd}
                  onChange={(e) => setFormData({ ...formData, price_dzd: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* USD Price (Auto-calculated) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (USD) - Auto-calculated
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="number"
                  value={formData.price_usd}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  placeholder="0.00"
                  readOnly
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Calculated: {formData.price_dzd} DZD ÷ {state.settings.exchange_rate_usd_to_dzd} = ${formData.price_usd}
              </p>
            </div>
          </div>

          {/* Category and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hide base price/duration when using variants */}
            {formData.pricing_model !== 'variants' && (
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Category</option>
                {state.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.translations?.find(t => t.language === 'en')?.name || 'Unknown Category'}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (Days)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="number"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="30"
                  min="0"
                />
              </div>
            </div>
            )}
          </div>

          {/* Fulfillment Type and Stock Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hide base price/duration when using variants */}
            {formData.pricing_model !== 'variants' && (
            {/* Fulfillment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fulfillment Type
              </label>
              <select
                value={formData.fulfillment_type}
                onChange={(e) => setFormData({ ...formData, fulfillment_type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="auto">Auto (Codes)</option>
                <option value="manual">Manual</option>
                <option value="assisted">Assisted</option>
              </select>
            </div>

            {/* Stock Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Status *
              </label>
              <select
                value={formData.is_out_of_stock ? 'out_of_stock' : 'in_stock'}
                onChange={(e) => setFormData({
                  ...formData,
                  is_out_of_stock: e.target.value === 'out_of_stock'
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Active Status and Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hide base price/duration when using variants */}
            {formData.pricing_model !== 'variants' && (
            {/* Active Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Status
              </label>
              <select
                value={formData.is_active ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <div className="relative">
                <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </div>

          {/* Pricing Model */}
            <>
              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (Days)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    value={formData.duration_days}
                    onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) || 0 })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="30"
                    min="0"
                  />
                </div>
              </div>
            </>
          )}

          {/* Category - Always show */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Category</option>
              {state.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.translations?.find(t => t.language === 'en')?.name || 'Unknown Category'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fulfillment Type and Stock Status - Always show */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fulfillment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fulfillment Type
            </label>
            <select
              value={formData.fulfillment_type}
              onChange={(e) => setFormData({ ...formData, fulfillment_type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="auto">Auto (Codes)</option>
              <option value="manual">Manual</option>
              <option value="assisted">Assisted</option>
            </select>
          </div>

          {/* Stock Status - Always show */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Status *
            </label>
            <select
              value={formData.is_out_of_stock ? 'out_of_stock' : 'in_stock'}
              onChange={(e) => setFormData({
                ...formData,
                is_out_of_stock: e.target.value === 'out_of_stock'
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Active Status and Image - Always show */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Status
            </label>
            <select
              value={formData.is_active ? 'active' : 'inactive'}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL
            </label>
            <div className="relative">
              <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
        </div>

        {/* Pricing Model */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pricing Model
          </label>
          <select
            value={formData.pricing_model}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              pricing_model: e.target.value as any,
              variants: (e.target.value === 'variants' && (!prev.variants || prev.variants.length === 0)) ? [
                { name: { en: '1 Month', ar: 'شهر واحد' }, duration_value: 1, duration_unit: 'months', price_usd: 0, price_dzd: 0, fulfillment_type: prev.fulfillment_type || 'manual', is_out_of_stock: false, is_default: true }
              ] : prev.variants
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="simple">Simple Pricing</option>
            <option value="variants">Multiple Variants</option>
          </select>
        </div>

        {/* Variants Section */}
        {formData.pricing_model === 'variants' && (
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Product Variants</h3>
              <button
                type="button"
                onClick={addVariant}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Add Variant
              </button>
            </div>

            {formData.variants && formData.variants.length > 0 ? (
              <div className="space-y-4">
                {formData.variants.map((variant, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Variant {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Variant Name (English) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name (English)
                        </label>
                        <input
                          type="text"
                          value={variant.name.en || ''}
                          onChange={(e) => updateVariant(index, 'name', { ...variant.name, en: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 1 Month"
                        />
                      </div>

                      {/* Variant Name (Arabic) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name (Arabic)
                        </label>
                        <input
                          type="text"
                          value={variant.name.ar || ''}
                          onChange={(e) => updateVariant(index, 'name', { ...variant.name, ar: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="مثال: شهر واحد"
                        />
                      </div>

                      {/* Duration */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            value={variant.duration_value}
                            onChange={(e) => updateVariant(index, 'duration_value', parseInt(e.target.value) || 1)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="1"
                          />
                          <select
                            value={variant.duration_unit}
                            onChange={(e) => updateVariant(index, 'duration_unit', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="days">Days</option>
                            <option value="months">Months</option>
                            <option value="years">Years</option>
                          </select>
                        </div>
                      </div>

                      {/* Variant Price (DZD) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price (DZD)
                        </label>
                        <input
                          type="number"
                          value={variant.price_dzd}
                          onChange={(e) => {
                            const priceDzd = parseFloat(e.target.value) || 0;
                            const priceUsd = Math.round((priceDzd / state.settings.exchange_rate_usd_to_dzd) * 100) / 100;
                            updateVariant(index, 'price_dzd', priceDzd);
                            updateVariant(index, 'price_usd', priceUsd);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      {/* Default Variant */}
                      <div className="md:col-span-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={variant.is_default}
                            onChange={(e) => {
                              // Only one variant can be default
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  variants: prev.variants?.map((v, i) => ({
                                    ...v,
                                    is_default: i === index
                                  })) || []
                                }));
                              } else {
                                updateVariant(index, 'is_default', false);
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Default variant</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No variants added yet. Click "Add Variant" to create pricing options.</p>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  </div>
);
}

                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Variant {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Variant Name (English) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name (English)
                          </label>
                          <input
                            type="text"
                            value={variant.name.en || ''}
                            onChange={(e) => updateVariant(index, 'name', { ...variant.name, en: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., 1 Month"
                          />
                        </div>

                        {/* Variant Name (Arabic) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name (Arabic)
                          </label>
                          <input
                            type="text"
                            value={variant.name.ar || ''}
                            onChange={(e) => updateVariant(index, 'name', { ...variant.name, ar: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="مثال: شهر واحد"
                          />
                        </div>

                        {/* Duration */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="number"
                              value={variant.duration_value}
                              onChange={(e) => updateVariant(index, 'duration_value', parseInt(e.target.value) || 1)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              min="1"
                            />
                            <select
                              value={variant.duration_unit}
                              onChange={(e) => updateVariant(index, 'duration_unit', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="days">Days</option>
                              <option value="months">Months</option>
                              <option value="years">Years</option>
                            </select>
                          </div>
                        </div>

                        {/* Variant Price (DZD) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price (DZD)
                          </label>
                          <input
                            type="number"
                            value={variant.price_dzd}
                            onChange={(e) => {
                              const priceDzd = parseFloat(e.target.value) || 0;
                              const priceUsd = Math.round((priceDzd / state.settings.exchange_rate_usd_to_dzd) * 100) / 100;
                              updateVariant(index, 'price_dzd', priceDzd);
                              updateVariant(index, 'price_usd', priceUsd);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                          />
                        </div>

                        {/* Default Variant */}
                        <div className="md:col-span-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={variant.is_default}
                              onChange={(e) => {
            <>
              {/* English Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name (English) *
                </label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product name in English"
                  required
                />
              </div>

              {/* Arabic Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name (Arabic) *
                </label>
                <input
                  type="text"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل اسم المنتج بالعربية"
                  required
                />
              </div>
            </>
          )}

          {/* Show names always for variants */}
          {formData.pricing_model === 'variants' && (
            <>
              {/* English Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name (English) *
                </label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product name in English"
                  required
                />
              </div>

              {/* Arabic Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name (Arabic) *
                </label>
                <input
                  type="text"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل اسم المنتج بالعربية"
                  required
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}