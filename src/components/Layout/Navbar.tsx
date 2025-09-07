import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Globe, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const { user, signOut } = useAuth();
  const { state, setLanguage, setCurrency } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Update cart count when state changes or custom event is fired
  useEffect(() => {
    const updateCartCount = () => {
      const count = state.cart.reduce((total, item) => total + item.quantity, 0);
      setCartCount(count);
    };
    
    updateCartCount();
    
    // Listen for cart update events
    const handleCartUpdate = () => {
      setTimeout(updateCartCount, 50);
    };
    
    window.addEventListener('cart-updated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, [state.cart]);
  
  const cartItemsCount = cartCount;

  const languages = [
    {
      code: 'en' as const,
      name: 'English',
      shortName: 'EN'
    },
    {
      code: 'ar' as const,
      name: 'العربية',
      shortName: 'AR'
    }
  ];

  const currencies = [
    {
      code: 'DZD' as const,
      name: 'دينار جزائري',
      englishName: 'Algerian Dinar',
      flag: '🇩🇿',
      symbol: 'دج'
    },
    {
      code: 'USD' as const,
      name: 'دولار أمريكي',
      englishName: 'US Dollar',
      flag: '$',
      symbol: '$'
    }
  ];

  const currentLanguage = languages.find(lang => lang.code === state.language) || languages[0];
  const currentCurrency = currencies.find(curr => curr.code === state.currency) || currencies[0];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setShowUserMenu(false);
    setIsMenuOpen(false);
  };

  const handleLanguageChange = (langCode: 'en' | 'ar') => {
    setLanguage(langCode);
    setShowLanguageMenu(false);
  };

  const handleCurrencyChange = (currencyCode: 'USD' | 'DZD') => {
    setCurrency(currencyCode);
    setShowCurrencyMenu(false);
  };

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className={`bg-white shadow-lg sticky top-0 z-50 ${state.language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo and Site Name */}
          <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse flex-shrink-0 min-w-0">
            <img 
              src="/logo.PNG" 
              alt="ATHMANEBZN STORE" 
              className="h-8 w-8 sm:h-10 sm:w-10 object-contain flex-shrink-0"
            />
            <span className="text-lg sm:text-2xl font-bold text-primary-500 tracking-wider truncate sm:font-dripping sm:drop-shadow-lg sm:transform sm:hover:scale-105 sm:transition-all sm:duration-300">
              ATHMANEBZN
            </span>
          </Link>

          {/* Mobile: Cart + Menu Button */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse lg:hidden">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-secondary-700 hover:text-primary-600 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 rtl:-left-1 rtl:right-auto bg-primary-500 text-secondary-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-secondary-700 hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Desktop Navigation - Only visible on large screens */}
          <div className="hidden lg:flex items-center space-x-4 rtl:space-x-reverse">
            {/* Orders Link */}
            {user && (
              <Link
                to="/orders"
                className="text-secondary-700 hover:text-primary-600 px-2 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {t('nav.orders')}
              </Link>
            )}

            {/* Language Selector */}
            <div className="relative hidden">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center space-x-1 rtl:space-x-reverse bg-white border border-gray-300 rounded-lg px-2 py-2 text-sm font-medium text-secondary-700 hover:bg-gray-50 hover:border-primary-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-[70px]"
              >
                <Globe className="h-4 w-4 text-primary-500" />
                <span>{currentLanguage.shortName}</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showLanguageMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {showLanguageMenu && (
                <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code)}
                      className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        state.language === language.code 
                          ? 'bg-primary-50 text-primary-700 font-medium' 
                          : 'text-secondary-700'
                      }`}
                    >
                      <Globe className="h-4 w-4 text-primary-500" />
                      <span className="flex-1 text-left rtl:text-right">{language.name}</span>
                      {state.language === language.code && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Currency Selector */}
            <div className="relative">
              <button
                onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
                className="flex items-center space-x-1 rtl:space-x-reverse bg-white border border-gray-300 rounded-lg px-2 py-2 text-sm font-medium text-secondary-700 hover:bg-gray-50 hover:border-primary-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-[70px]"
              >
                <span className="text-base">{currentCurrency.flag}</span>
                <span>{currentCurrency.code}</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showCurrencyMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {showCurrencyMenu && (
                <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {currencies.map((currency) => (
                    <button
                      key={currency.code}
                      onClick={() => handleCurrencyChange(currency.code)}
                      className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        state.currency === currency.code 
                          ? 'bg-primary-50 text-primary-700 font-medium' 
                          : 'text-secondary-700'
                      }`}
                    >
                      <span className="text-base">{currency.flag}</span>
                      <div className="flex-1 text-left rtl:text-right">
                        <div className="font-medium">{currency.code}</div>
                        <div className="text-xs text-gray-500">
                          {state.language === 'ar' ? currency.name : currency.englishName}
                        </div>
                      </div>
                      {state.currency === currency.code && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-secondary-700 hover:text-primary-600 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 rtl:-left-1 rtl:right-auto bg-primary-500 text-secondary-900 text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-semibold">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 rtl:space-x-reverse text-secondary-700 hover:text-primary-600 transition-colors p-2 rounded-md"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm max-w-32 truncate">{user.username || user.email}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Link
                  to="/login"
                  className="text-secondary-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary-500 text-secondary-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-600 transition-colors"
                >
                  {t('nav.signup')}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu - Only visible when menu is open */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-secondary-200 bg-white relative z-50">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Orders Link for logged in users */}
              {user && (
                <Link
                  to="/orders"
                  className="block px-3 py-2 text-secondary-700 hover:text-primary-600 hover:bg-secondary-50 rounded-md text-base font-medium transition-colors relative z-10"
                  onClick={closeMobileMenu}
                >
                  {t('nav.orders')}
                </Link>
              )}

              {/* Cart Link with count */}
              <Link
                to="/cart"
                className="flex items-center px-3 py-2 text-secondary-700 hover:text-primary-600 hover:bg-secondary-50 rounded-md text-base font-medium transition-colors relative z-10"
                onClick={closeMobileMenu}
              >
                <ShoppingCart className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
                {t('nav.cart')} {cartItemsCount > 0 && `(${cartItemsCount})`}
              </Link>

              {/* Language Selector in Mobile Menu */}
              <div className="px-3 py-2 relative z-10 hidden">
                <div className="text-sm font-medium text-secondary-700 mb-2">Language / اللغة</div>
                <div className="space-y-1">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => {
                        handleLanguageChange(language.code);
                        closeMobileMenu();
                      }}
                      className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-md text-sm transition-colors relative z-10 ${
                        state.language === language.code 
                          ? 'bg-primary-100 text-primary-700 font-medium' 
                          : 'text-secondary-600 hover:bg-secondary-50'
                      }`}
                    >
                      <Globe className="h-4 w-4 text-primary-500" />
                      <span>{language.name}</span>
                      {state.language === language.code && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full ml-auto rtl:mr-auto rtl:ml-0"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Currency Selector in Mobile Menu */}
              <div className="px-3 py-2 relative z-10">
                <div className="text-sm font-medium text-secondary-700 mb-2">Currency / العملة</div>
                <div className="space-y-1">
                  {currencies.map((currency) => (
                    <button
                      key={currency.code}
                      onClick={() => {
                        handleCurrencyChange(currency.code);
                        closeMobileMenu();
                      }}
                      className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-md text-sm transition-colors relative z-10 ${
                        state.currency === currency.code 
                          ? 'bg-primary-100 text-primary-700 font-medium' 
                          : 'text-secondary-600 hover:bg-secondary-50'
                      }`}
                    >
                      <span className="text-base">{currency.flag}</span>
                      <div className="flex-1 text-left rtl:text-right">
                        <div className="font-medium">{currency.code}</div>
                        <div className="text-xs text-gray-500">
                          {state.language === 'ar' ? currency.name : currency.englishName}
                        </div>
                      </div>
                      {state.currency === currency.code && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full ml-auto rtl:mr-auto rtl:ml-0"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* User Authentication Section */}
              {user ? (
                <div className="px-3 py-2 space-y-2 border-t border-secondary-200 mt-2 pt-4 relative z-10">
                  <div className="text-sm text-secondary-600 truncate">{user.username || user.email}</div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full bg-secondary-100 text-secondary-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary-200 transition-colors relative z-10"
                  >
                    <LogOut className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {t('nav.logout')}
                  </button>
                </div>
              ) : (
                <div className="px-3 py-2 space-y-2 border-t border-secondary-200 mt-2 pt-4 relative z-10">
                  <Link
                    to="/login"
                    className="block w-full text-center text-secondary-700 hover:text-primary-600 hover:bg-secondary-50 px-3 py-2 rounded-md text-base font-medium transition-colors relative z-10"
                    onClick={closeMobileMenu}
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/signup"
                    className="block w-full text-center bg-primary-500 text-secondary-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-600 transition-colors relative z-10"
                    onClick={closeMobileMenu}
                  >
                    {t('nav.signup')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Overlays */}
      {(isMenuOpen || showUserMenu || showLanguageMenu || showCurrencyMenu) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-30"
          onClick={() => {
            setIsMenuOpen(false);
            setShowUserMenu(false);
            setShowLanguageMenu(false);
            setShowCurrencyMenu(false);
          }}
        />
      )}
    </nav>
  );
};