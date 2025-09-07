import React, { useState, useEffect } from 'react';
import { Settings, Clock, Mail, MessageCircle, Instagram, Send, Wrench, Shield, Zap } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { useApp } from '../contexts/AppContext';

export function MaintenancePage() {
  const { state } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const supportOptions = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: 'https://wa.me/21396354792',
      color: 'bg-green-500 hover:bg-green-600',
      description: state.language === 'ar' ? 'دردشة فورية' : 'Instant Chat'
    },
    {
      name: 'Telegram',
      icon: Send,
      url: 'https://t.me/atmnexe1',
      color: 'bg-blue-500 hover:bg-blue-600',
      description: state.language === 'ar' ? 'رسائل سريعة' : 'Quick Messages'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://instagram.com/athmaanebzn',
      color: 'bg-pink-500 hover:bg-pink-600',
      description: state.language === 'ar' ? 'تابعنا' : 'Follow Us'
    }
  ];

  const features = [
    {
      icon: Shield,
      title: state.language === 'ar' ? 'تحسين الأمان' : 'Security Improvements',
      description: state.language === 'ar' ? 'تعزيز حماية البيانات والمعاملات' : 'Enhanced data protection and transaction security'
    },
    {
      icon: Zap,
      title: state.language === 'ar' ? 'تحسين الأداء' : 'Performance Boost',
      description: state.language === 'ar' ? 'تسريع الموقع وتحسين تجربة المستخدم' : 'Faster loading times and improved user experience'
    },
    {
      icon: Settings,
      title: state.language === 'ar' ? 'ميزات جديدة' : 'New Features',
      description: state.language === 'ar' ? 'إضافة خدمات ومنتجات جديدة' : 'Adding new services and products'
    }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 ${state.language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="max-w-4xl w-full">
          {/* Main Card */}
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Wrench className="h-12 w-12 text-white animate-bounce" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <Settings className="h-4 w-4 text-white animate-spin" />
                  </div>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {state.language === 'ar' ? 'الموقع قيد الصيانة' : 'Site Under Maintenance'}
              </h1>
              
              <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                {state.language === 'ar' 
                  ? 'نحن نعمل على تحسين موقعنا لتقديم تجربة أفضل لك. سنعود قريباً بمميزات جديدة ومثيرة!'
                  : 'We are working hard to improve our website and bring you an even better experience. We will be back soon with exciting new features!'
                }
              </p>
            </div>

            {/* Content Body */}
            <div className="px-8 py-12">
              {/* Current Time */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-gray-100 rounded-full px-6 py-3">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-800 font-medium">
                    {currentTime.toLocaleString(state.language === 'ar' ? 'ar-DZ' : 'en-US')}
                  </span>
                </div>
              </div>

              {/* What We're Working On */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
                  {state.language === 'ar' ? 'ما نعمل عليه' : 'What We\'re Working On'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {features.map((feature, index) => (
                    <div key={index} className="text-center p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <feature.icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-12">
                <div className="text-center mb-4">
                  <span className="text-gray-700 font-medium">
                    {state.language === 'ar' ? 'تقدم الصيانة' : 'Maintenance Progress'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full animate-pulse" style={{ width: '75%' }}></div>
                </div>
                <div className="text-center mt-2">
                  <span className="text-sm text-gray-600">75% {state.language === 'ar' ? 'مكتمل' : 'Complete'}</span>
                </div>
              </div>

              {/* Contact Support */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {state.language === 'ar' ? 'تحتاج مساعدة؟' : 'Need Help?'}
                  </h2>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {state.language === 'ar' 
                      ? 'فريق الدعم متاح 24/7 للإجابة على استفساراتك'
                      : 'Our support team is available 24/7 to answer your questions'
                    }
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {supportOptions.map((option) => (
                    <a
                      key={option.name}
                      href={option.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${option.color} text-white p-6 rounded-xl text-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg group`}
                    >
                      <option.icon className="h-8 w-8 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                      <div className="font-semibold text-lg mb-1">{option.name}</div>
                      <div className="text-sm opacity-90">{option.description}</div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Expected Return Time */}
              <div className="text-center mt-12">
                <div className="inline-flex items-center space-x-3 rtl:space-x-reverse bg-blue-50 border border-blue-200 rounded-full px-6 py-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-800 font-medium">
                    {state.language === 'ar' 
                      ? 'متوقع العودة خلال ساعات قليلة'
                      : 'Expected to return within a few hours'
                    }
                  </span>
                </div>
              </div>

              {/* Footer Message */}
              <div className="text-center mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse mb-4">
                  <img 
                    src="/logo.PNG" 
                    alt="ATHMANEBZN STORE" 
                    className="h-8 w-8 object-contain"
                  />
                  <span className="text-2xl font-bold text-primary-500 tracking-wider sm:font-dripping">
                    ATHMANEBZN
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  {state.language === 'ar' 
                    ? 'شكراً لصبركم. نعمل بجد لتقديم أفضل خدمة لكم.'
                    : 'Thank you for your patience. We are working hard to provide you with the best service.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Particles Animation */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}