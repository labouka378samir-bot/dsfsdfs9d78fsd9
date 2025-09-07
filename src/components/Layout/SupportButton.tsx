import React, { useState } from 'react';
import { MessageCircle, Phone, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export function SupportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { state } = useApp();

  const supportOptions = [
    {
      name: 'WhatsApp',
      logo: 'https://www.citypng.com/public/uploads/preview/whatsapp-logo-green-app-icon-square-radius-704081694688051kzomuccrii.png?v=2025061907',
      url: 'https://wa.me/21396354792',
      color: 'bg-green-500 hover:bg-green-600',
      description: state.language === 'ar' ? 'دردشة فورية' : 'Instant Chat'
    },
    {
      name: 'Telegram',
      logo: 'https://cdn3.iconfinder.com/data/icons/social-media-chamfered-corner/154/telegram-512.png',
      url: 'https://t.me/atmnexe1',
      color: 'bg-blue-500 hover:bg-blue-600',
      description: state.language === 'ar' ? 'رسائل سريعة' : 'Quick Messages'
    },
    {
      name: 'Instagram',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png',
      url: 'https://instagram.com/athmaanebzn',
      color: 'bg-pink-500 hover:bg-pink-600',
      description: state.language === 'ar' ? 'تابعنا' : 'Follow Us'
    }
  ];

  const handleOptionClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Support Options */}
      {isOpen && (
        <div className={`fixed bottom-24 ${state.language === 'ar' ? 'left-6' : 'right-6'} z-50 space-y-3`}>
          {supportOptions.map((option, index) => (
            <div
              key={option.name}
              className={`transform transition-all duration-300 ${
                isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <button
                onClick={() => handleOptionClick(option.url)}
                className={`${option.color} text-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center space-x-3 rtl:space-x-reverse min-w-max`}
              >
                <img 
                  src={option.logo} 
                  alt={option.name}
                  className="w-6 h-6 object-contain"
                />
                <div className="text-left rtl:text-right">
                  <div className="font-semibold text-sm">{option.name}</div>
                  <div className="text-xs opacity-90">{option.description}</div>
                </div>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Support Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 ${state.language === 'ar' ? 'left-6' : 'right-6'} z-50 bg-gradient-to-r from-primary-500 to-primary-600 text-secondary-900 p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 group`}
        aria-label={state.language === 'ar' ? 'فتح الدعم' : 'Open Support'}
      >
        {isOpen ? (
          <X className="h-6 w-6 transition-transform duration-200" />
        ) : (
          <div className="relative">
            <MessageCircle className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
            {/* Pulse animation */}
            <div className="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-75"></div>
          </div>
        )}
      </button>

      {/* Tooltip */}
      {!isOpen && (
        <div className={`fixed bottom-20 ${state.language === 'ar' ? 'left-6' : 'right-6'} z-40 bg-secondary-800 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap`}>
          {state.language === 'ar' ? 'تحتاج مساعدة؟' : 'Need Help?'}
        </div>
      )}
    </>
  );
}