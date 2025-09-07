import React, { useState } from 'react';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Key, 
  Folder, 
  CreditCard, 
  Settings,
  Menu,
  X,
  Globe,
  Search,
  User,
  LogOut,
  Bell,
  Sun,
  Moon
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { adminAuth } from '../../services/AdminAuthService';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AdminLayout({ children, activeTab, onTabChange }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { state, setLanguage } = useApp();

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 'products', name: 'Products', icon: Package, color: 'text-green-600', bgColor: 'bg-green-50' },
    { id: 'orders', name: 'Orders', icon: ShoppingCart, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { id: 'auto-codes', name: 'Auto Codes', icon: Key, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { id: 'categories', name: 'Categories', icon: Folder, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    { id: 'payments', name: 'Payments', icon: CreditCard, color: 'text-pink-600', bgColor: 'bg-pink-50' },
    { id: 'settings', name: 'Settings', icon: Settings, color: 'text-gray-600', bgColor: 'bg-gray-50' },
  ];

  const languages = [
    { code: 'en', name: 'EN', flag: '🇺🇸' },
    { code: 'ar', name: 'AR', flag: '🇩🇿' }
  ];

  const handleLogout = () => {
    adminAuth.logout();
    window.location.href = '/login';
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${state.language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 rtl:right-0 rtl:left-auto z-50 w-72 bg-white shadow-xl border-r border-gray-200 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        
        {/* Logo */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <img 
              src="/logo.PNG" 
              alt="ATHMANEBZN" 
              className="h-10 w-10 object-contain rounded-lg bg-white p-1"
            />
            <div>
              <h1 className="text-xl font-bold text-white">ATHMANEBZN</h1>
              <p className="text-blue-200 text-sm">Admin Dashboard</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-blue-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  activeTab === item.id
                    ? `${item.bgColor} ${item.color} shadow-sm border-l-4 rtl:border-r-4 rtl:border-l-0 border-current`
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3 rtl:ml-3 rtl:mr-0 flex-shrink-0" />
                {item.name}
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72 rtl:lg:pr-72 rtl:lg:pl-0">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6 lg:px-8">
            {/* Left side */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              {/* Search */}
              <div className="relative hidden lg:block">
                <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all w-64 xl:w-80"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Theme Toggle */}
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Language Selector */}
              <div className="relative hidden md:block">
                <select
                  value={state.language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
                <Globe className="absolute right-2 rtl:left-2 rtl:right-auto top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
              </div>

              {/* Admin Menu */}
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="hidden md:flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{adminAuth.getAdminEmail()?.split('@')[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}