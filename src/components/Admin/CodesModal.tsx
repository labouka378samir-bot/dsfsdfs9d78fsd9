import React, { useState } from 'react';
import { X, Plus, Key } from 'lucide-react';
import { adminDataService } from '../../services/AdminDataService';
import toast from 'react-hot-toast';

interface CodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  onSave: () => void;
}

export function CodesModal({ isOpen, onClose, productId, productName, onSave }: CodesModalProps) {
  const [codes, setCodes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!codes.trim()) {
      toast.error('Please enter at least one code');
      return;
    }

    setIsLoading(true);

    try {
      // Split codes by new lines and filter empty lines
      const codeList = codes
        .split('\n')
        .map(code => code.trim())
        .filter(code => code.length > 0);

      if (codeList.length === 0) {
        toast.error('Please enter valid codes');
        return;
      }

      const success = await adminDataService.addCodes(productId, codeList);
      
      if (success) {
        setCodes('');
        onSave();
        onClose();
        toast.success(`${codeList.length} codes added successfully!`);
      }
    } catch (error: any) {
      console.error('Error adding codes:', error);
      toast.error('Failed to add codes');
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
            <Key className="h-6 w-6 mr-2 text-blue-600" />
            Add Codes for {productName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Codes *
            </label>
            <textarea
              value={codes}
              onChange={(e) => setCodes(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="Enter one code per line:&#10;CODE123&#10;CODE456&#10;CODE789"
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              Enter one code per line. Empty lines will be ignored.
            </p>
          </div>

          {/* Preview */}
          {codes.trim() && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Preview:</h3>
              <p className="text-sm text-gray-600">
                {codes.split('\n').filter(code => code.trim().length > 0).length} codes will be added
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !codes.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Codes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}