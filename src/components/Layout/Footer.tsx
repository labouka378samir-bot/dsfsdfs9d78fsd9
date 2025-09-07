import React from 'react';
import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { TermsAndConditions } from '../Legal/TermsAndConditions';
import { PrivacyPolicy } from '../Legal/PrivacyPolicy';

export function Footer() {
  const { state } = useApp();
  const { t } = useTranslation();
  const [showTerms, setShowTerms] = React.useState(false);
  const [showPrivacy, setShowPrivacy] = React.useState(false);

  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-secondary-900 text-white mt-20 ${state.language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="space-y-3 sm:space-y-4 text-center xs:text-left lg:col-span-2 xl:col-span-1">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <img 
                src="/logo.PNG" 
                alt="ATHMANEBZN STORE" 
                className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
              />
              <span className="text-xl sm:text-2xl font-bold text-primary-500 tracking-wider sm:font-dripping sm:drop-shadow-lg">
                ATHMANEBZN
              </span>
            </div>
            <p className="text-secondary-400 text-xs sm:text-sm leading-relaxed">
              Your trusted platform for digital products and services. Fast delivery, secure payments, and 24/7 support.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 sm:space-y-4 text-center xs:text-left">
            <h3 className="text-base sm:text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <Link to="/" className="text-secondary-400 hover:text-primary-400 transition-colors text-sm">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-secondary-400 hover:text-primary-400 transition-colors text-sm">
                  {t('nav.cart')}
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-secondary-400 hover:text-primary-400 transition-colors text-sm">
                  {t('nav.orders')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3 sm:space-y-4 text-center xs:text-left">
            <h3 className="text-base sm:text-lg font-semibold">{t('footer.support')}</h3>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <button 
                  onClick={() => setShowTerms(true)}
                  className="text-secondary-400 hover:text-primary-400 transition-colors text-sm"
                >
                  {t('footer.terms')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setShowPrivacy(true)}
                  className="text-secondary-400 hover:text-primary-400 transition-colors text-sm"
                >
                  {t('footer.privacy')}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3 sm:space-y-4 text-center xs:text-left">
            <h3 className="text-base sm:text-lg font-semibold">Contact Us</h3>
            <div className="space-y-1 sm:space-y-2">
              <a
                href="https://wa.me/21396354792"
                className="text-secondary-400 hover:text-primary-400 transition-colors flex items-center justify-center xs:justify-start space-x-2 rtl:space-x-reverse text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{t('contact.whatsapp')}: +213 96 35 47 92</span>
              </a>
              <a
                href="https://instagram.com/athmaanebzn"
                className="text-secondary-400 hover:text-primary-400 transition-colors flex items-center justify-center xs:justify-start space-x-2 rtl:space-x-reverse text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>Instagram: @athmaanebzn</span>
              </a>
              <a
                href="https://t.me/atmnexe1"
                className="text-secondary-400 hover:text-primary-400 transition-colors flex items-center justify-center xs:justify-start space-x-2 rtl:space-x-reverse text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                <span>Telegram: @atmnexe1</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-secondary-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-secondary-400 text-xs sm:text-sm text-center sm:text-left order-2 sm:order-1">
            © {currentYear} ATHMANEBZN. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 rtl:space-x-reverse order-1 sm:order-2">
            <span className="text-secondary-400 text-xs sm:text-sm">Secure payments</span>
            <span className="text-secondary-400 text-xs sm:text-sm">24/7 Support</span>
            <span className="text-secondary-400 text-xs sm:text-sm">Instant delivery</span>
          </div>
        </div>
      </div>
      
      {/* Legal Modals */}
      <TermsAndConditions isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <PrivacyPolicy isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </footer>
  );
}