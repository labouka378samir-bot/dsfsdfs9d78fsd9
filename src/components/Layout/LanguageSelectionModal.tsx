import React, { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { Language } from '../../types';

interface LanguageSelectionModalProps {
  isOpen: boolean;
  onLanguageSelect: (language: Language) => void;
  suggestedLanguage?: Language;
}

export function LanguageSelectionModal({ isOpen, onLanguageSelect, suggestedLanguage }: LanguageSelectionModalProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(suggestedLanguage || 'en');

  const languages = [
    {
      code: 'ar' as Language,
      name: 'العربية',
      englishName: 'Arabic',
      flag: '🇩🇿',
      description: 'اللغة العربية'
    },
    {
      code: 'en' as Language,
      name: 'English',
      englishName: 'English',
      flag: '🌐',
      description: 'English Language'
    }
  ];

  const handleConfirm = () => {
    onLanguageSelect(selectedLanguage);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4 sm:p-6">
      <div className="bg-white rounded-2xl max-w-sm sm:max-w-md w-full shadow-2xl transform transition-all">
        {/* Header */}
        <div className="text-center p-6 sm:p-8 border-b border-gray-100">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-2">
            {selectedLanguage === 'ar' ? 'اختر لغتك المفضلة' : 'Choose Your Language'}
          </h2>
          <p className="text-secondary-600 text-xs sm:text-sm">
            {selectedLanguage === 'ar' ? 'اختر اللغة التي تفضلها' : 'Select your preferred language'}
          </p>
        </div>

        {/* Language Options */}
        <div className="p-4 sm:p-6">
          <div className="space-y-2 sm:space-y-3">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => setSelectedLanguage(language.code)}
                className={`w-full p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 flex items-center space-x-3 sm:space-x-4 rtl:space-x-reverse ${
                  selectedLanguage === language.code
                    ? 'border-primary-500 bg-primary-50 shadow-md'
                    : 'border-secondary-200 hover:border-secondary-300 hover:bg-secondary-50'
                }`}
              >
                <div className="text-xl sm:text-2xl">{language.flag}</div>
                <div className="flex-1 text-left rtl:text-right">
                  <div className="font-semibold text-secondary-900 text-base sm:text-lg">
                    {language.name}
                  </div>
                  <div className="text-xs sm:text-sm text-secondary-500">
                    {language.description}
                  </div>
                </div>
                {selectedLanguage === language.code && (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Suggested Language Notice */}
          {suggestedLanguage && (
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-primary-50 border border-primary-200 rounded-lg">
              <p className="text-xs sm:text-sm text-primary-800 text-center">
                {suggestedLanguage === 'ar' 
                  ? '🇩🇿 تم اقتراح العربية بناءً على موقعك'
                  : '🌐 English suggested based on your location'
                }
              </p>
            </div>
          )}

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            className="w-full mt-4 sm:mt-6 bg-gradient-to-r from-primary-500 to-primary-600 text-secondary-900 py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold text-base sm:text-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            {selectedLanguage === 'ar' ? 'تأكيد الاختيار' : 'Confirm Selection'}
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <p className="text-xs text-secondary-500 text-center leading-relaxed">
            {selectedLanguage === 'ar' 
              ? 'تم حفظ اختيارك وسيتم تذكره في المرات القادمة'
              : 'Your choice has been saved and will be remembered for future visits'
            }
          </p>
        </div>
      </div>
    </div>
  );
}