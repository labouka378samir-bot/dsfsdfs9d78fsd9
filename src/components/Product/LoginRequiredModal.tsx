import React from 'react';
import { Link } from 'react-router-dom';
import { X, User, UserPlus, Lock, Shield } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginRequiredModal({ isOpen, onClose }: LoginRequiredModalProps) {
  const { state } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4">
      <div className={`bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all ${state.language === 'ar' ? 'rtl' : 'ltr'}`}>
        {/* Header */}
        <div className="text-center p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {state.language === 'ar' ? 'تسجيل الدخول مطلوب' : 'Login Required'}
          </h2>
          <p className="text-gray-600 text-sm">
            {state.language === 'ar' 
              ? 'يجب إنشاء حساب أو تسجيل الدخول للمتابعة مع عملية الشراء'
              : 'You need to create an account or sign in to continue with your purchase'
            }
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Benefits */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {state.language === 'ar' ? 'مزايا إنشاء الحساب:' : 'Account Benefits:'}
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-3 rtl:space-x-reverse text-sm text-gray-700">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="h-3 w-3 text-green-600" />
                </div>
                <span>{state.language === 'ar' ? 'تتبع طلباتك' : 'Track your orders'}</span>
              </li>
              <li className="flex items-center space-x-3 rtl:space-x-reverse text-sm text-gray-700">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="h-3 w-3 text-green-600" />
                </div>
                <span>{state.language === 'ar' ? 'حفظ معلومات الدفع' : 'Save payment information'}</span>
              </li>
              <li className="flex items-center space-x-3 rtl:space-x-reverse text-sm text-gray-700">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="h-3 w-3 text-green-600" />
                </div>
                <span>{state.language === 'ar' ? 'دعم فني مخصص' : 'Dedicated support'}</span>
              </li>
              <li className="flex items-center space-x-3 rtl:space-x-reverse text-sm text-gray-700">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="h-3 w-3 text-green-600" />
                </div>
                <span>{state.language === 'ar' ? 'عروض حصرية' : 'Exclusive offers'}</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              to="/login"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center block flex items-center justify-center"
              onClick={onClose}
            >
              <User className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {state.language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
            </Link>
            
            <Link
              to="/signup"
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors text-center block flex items-center justify-center"
              onClick={onClose}
            >
              <UserPlus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {state.language === 'ar' ? 'إنشاء حساب جديد' : 'Create New Account'}
            </Link>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors mt-3"
          >
            {state.language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>

        {/* Close X Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rtl:left-4 rtl:right-auto text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}