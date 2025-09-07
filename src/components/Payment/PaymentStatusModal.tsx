import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, X, Download, MessageCircle, Phone, Send, Instagram } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Order } from '../../types';

interface PaymentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'success' | 'failed' | 'cancelled';
  order?: Order | null;
}

export function PaymentStatusModal({ isOpen, onClose, status, order }: PaymentStatusModalProps) {
  const { state } = useApp();

  if (!isOpen) return null;

  const isSuccess = status === 'success';
  const isFailed = status === 'failed';
  const isCancelled = status === 'cancelled';

  const getTitle = () => {
    if (isSuccess) return state.language === 'ar' ? 'تم الدفع بنجاح!' : 'Payment Successful!';
    if (isFailed) return state.language === 'ar' ? 'فشل في الدفع' : 'Payment Failed';
    return state.language === 'ar' ? 'تم إلغاء الدفع' : 'Payment Cancelled';
  };

  const getMessage = () => {
    if (isSuccess) {
      return state.language === 'ar' 
        ? 'تم إتمام عملية الدفع بنجاح. سيتم تسليم طلبك قريباً.'
        : 'Payment completed successfully. Your order will be delivered soon.';
    }
    if (isFailed) {
      return state.language === 'ar'
        ? 'لم يتم إتمام عملية الدفع. يرجى المحاولة مرة أخرى أو الاتصال بالدعم.'
        : 'Payment was not completed. Please try again or contact support.';
    }
    return state.language === 'ar'
      ? 'تم إلغاء عملية الدفع. يمكنك المحاولة مرة أخرى.'
      : 'Payment was cancelled. You can try again.';
  };

  const supportOptions = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: 'https://wa.me/21396354792',
      color: 'bg-green-500 hover:bg-green-600',
      label: state.language === 'ar' ? 'واتساب' : 'WhatsApp'
    },
    {
      name: 'Telegram',
      icon: Send,
      url: 'https://t.me/atmnexe1',
      color: 'bg-blue-500 hover:bg-blue-600',
      label: state.language === 'ar' ? 'تليجرام' : 'Telegram'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://instagram.com/athmaanebzn',
      color: 'bg-pink-500 hover:bg-pink-600',
      label: state.language === 'ar' ? 'انستجرام' : 'Instagram'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4">
      <div className={`bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all ${state.language === 'ar' ? 'rtl' : 'ltr'}`}>
        {/* Header */}
        <div className={`text-center p-6 border-b ${isSuccess ? 'bg-green-50' : isFailed ? 'bg-red-50' : 'bg-yellow-50'}`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isSuccess ? 'bg-green-100' : isFailed ? 'bg-red-100' : 'bg-yellow-100'
          }`}>
            {isSuccess ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <X className="h-8 w-8 text-red-600" />
            )}
          </div>
          <h2 className={`text-xl font-bold mb-2 ${
            isSuccess ? 'text-green-800' : isFailed ? 'text-red-800' : 'text-yellow-800'
          }`}>
            {getTitle()}
          </h2>
          <p className={`text-sm ${
            isSuccess ? 'text-green-700' : isFailed ? 'text-red-700' : 'text-yellow-700'
          }`}>
            {getMessage()}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess && order && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">
                {state.language === 'ar' ? 'رقم الطلب:' : 'Order Number:'}
              </div>
              <div className="font-mono text-lg font-semibold text-gray-900">
                #{order.order_number}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {isSuccess && order && (
              <>
                <Link
                  to={`/order-success?order=${order.id}`}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center block"
                  onClick={onClose}
                >
                  <Download className="h-4 w-4 inline mr-2 rtl:ml-2 rtl:mr-0" />
                  {state.language === 'ar' ? 'تحميل الوصل' : 'Download Receipt'}
                </Link>
                
                <Link
                  to="/orders"
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors text-center block"
                  onClick={onClose}
                >
                  {state.language === 'ar' ? 'طلباتي' : 'My Orders'}
                </Link>
              </>
            )}

            {(isFailed || isCancelled) && (
              <Link
                to="/cart"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center block"
                onClick={onClose}
              >
                {state.language === 'ar' ? 'العودة للسلة' : 'Back to Cart'}
              </Link>
            )}

            {/* Support Section */}
            <div className="border-t pt-4">
              <div className="text-sm font-medium text-gray-700 mb-3 text-center">
                {state.language === 'ar' ? 'تحتاج مساعدة؟ تواصل معنا:' : 'Need help? Contact us:'}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {supportOptions.map((option) => (
                  <a
                    key={option.name}
                    href={option.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${option.color} text-white p-3 rounded-lg text-center transition-colors flex flex-col items-center space-y-1`}
                  >
                    <option.icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{option.label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              {state.language === 'ar' ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}