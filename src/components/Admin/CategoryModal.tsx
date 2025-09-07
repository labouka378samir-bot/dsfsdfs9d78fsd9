import React, { useState, useEffect } from 'react';
import { X, Save, Folder } from 'lucide-react';
import { adminDataService } from '../../services/AdminDataService';
import { Category } from '../../types';
import toast from 'react-hot-toast';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onSave: () => void;
}

export function CategoryModal({ isOpen, onClose, category, onSave }: CategoryModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    slug: '',
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: ''
  });

  useEffect(() => {
    if (category) {
      const enTranslation = category.translations?.find(t => t.language === 'en');
      const arTranslation = category.translations?.find(t => t.language === 'ar');
      
      setFormData({
        slug: category.slug || '',
        name_en: enTranslation?.name || '',
        name_ar: arTranslation?.name || '',
        description_en: enTranslation?.description || '',
        description_ar: arTranslation?.description || ''
      });
    } else {
      setFormData({
        slug: '',
        name_en: '',
        name_ar: '',
        description_en: '',
        description_ar: ''
      });
    }
  }, [category]);

  // Auto-generate slug from English name
  useEffect(() => {
    if (!category && formData.name_en) {
      const slug = formData.name_en
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name_en, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name_en || !formData.name_ar) {
      toast.error('Category name is required in both languages');
      return;
    }

    if (!formData.slug) {
      toast.error('Category slug is required');
      return;
    }

    setIsLoading(true);

    try {
      const translations = [
        {
          language: 'en',
          name: formData.name_en,
          description: formData.description_en
        },
        {
          language: 'ar',
          name: formData.name_ar,
          description: formData.description_ar
        }
      ];

      let success = false;
      
      if (category) {
        // Update existing category
        success = await adminDataService.updateCategory(category.id, {
          slug: formData.slug,
          translations
        });
      } else {
        // Create new category
        success = await adminDataService.createCategory({
          slug: formData.slug,
          translations
        });
      }

      if (success) {
        onSave();
        onClose();
        toast.success(category ? 'Category updated successfully!' : 'Category created successfully!');
      }
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Folder className="h-6 w-6 mr-2 text-blue-600" />
            {category ? 'Edit Category' : 'Add New Category'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* English Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name (English) *
              </label>
              <input
                type="text"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter category name in English"
                required
              />
            </div>

            {/* Arabic Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name (Arabic) *
              </label>
              <input
                type="text"
                value={formData.name_ar}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل اسم الفئة بالعربية"
                required
              />
            </div>
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="category-slug"
              required
              pattern="[a-z0-9-]+"
              title="Only lowercase letters, numbers, and hyphens allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Used in URLs. Only lowercase letters, numbers, and hyphens.
            </p>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* English Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (English)
              </label>
              <textarea
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter category description in English"
              />
            </div>

            {/* Arabic Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Arabic)
              </label>
              <textarea
                value={formData.description_ar}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل وصف الفئة بالعربية"
              />
            </div>
          </div>

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
              {category ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}