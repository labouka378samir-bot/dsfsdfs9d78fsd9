import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Key, 
  Folder, 
  CreditCard, 
  Settings,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Upload,
  Save,
  X,
  Code,
  FileText,
  Globe
} from 'lucide-react';
import { AdminLayout } from '../components/Admin/AdminLayout';
import { ProductEditModal } from '../components/Admin/ProductEditModal';
import { adminDataService, EnhancedProduct, CodeData } from '../services/AdminDataService';
import { Order, Category, Settings as SettingsType } from '../types';
import { useApp } from '../contexts/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import toast from 'react-hot-toast';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data states
  const [products, setProducts] = useState<EnhancedProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [codes, setCodes] = useState<CodeData[]>([]);
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  
  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<EnhancedProduct | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showCodesModal, setShowCodesModal] = useState(false);
  const [selectedProductForCodes, setSelectedProductForCodes] = useState<string>('');
  
  const { state } = useApp();
  const { t, getTranslation } = useTranslation();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [productsData, ordersData, categoriesData, codesData, settingsData, statsData] = await Promise.all([
        adminDataService.getProducts(),
        adminDataService.getOrders(),
        adminDataService.getCategories(),
        adminDataService.getCodes(),
        adminDataService.getSettings(),
        adminDataService.getDashboardStats()
      ]);
      
      setProducts(productsData);
      setOrders(ordersData);
      setCategories(categoriesData);
      setCodes(codesData);
      setSettings(settingsData);
      setDashboardStats(statsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductSave = async () => {
    await loadDashboardData();
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const success = await adminDataService.deleteProduct(productId);
      if (success) {
        await loadDashboardData();
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    const success = await adminDataService.updateOrderStatus(orderId, status);
    if (success) {
      await loadDashboardData();
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      const success = await adminDataService.deleteOrder(orderId);
      if (success) {
        await loadDashboardData();
      }
    }
  };

  // Dashboard Overview Component
  const DashboardOverview = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Products</p>
              <p className="text-3xl font-bold mt-1">{dashboardStats?.totalProducts || 0}</p>
              <p className="text-blue-100 text-xs mt-2">{dashboardStats?.activeProducts || 0} active</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-xl p-3">
              <Package className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Orders</p>
              <p className="text-3xl font-bold mt-1">{dashboardStats?.totalOrders || 0}</p>
              <p className="text-green-100 text-xs mt-2">{dashboardStats?.pendingOrders || 0} pending</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-xl p-3">
              <ShoppingCart className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold mt-1">${dashboardStats?.totalRevenue?.toFixed(2) || '0.00'}</p>
              <p className="text-purple-100 text-xs mt-2">All time</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-xl p-3">
              <DollarSign className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Auto Codes</p>
              <p className="text-3xl font-bold mt-1">{dashboardStats?.availableCodes || 0}</p>
              <p className="text-orange-100 text-xs mt-2">{dashboardStats?.usedCodes || 0} used</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-xl p-3">
              <Key className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
            <button 
              onClick={() => setActiveTab('orders')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {dashboardStats?.recentOrders?.slice(0, 5).map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div>
                  <p className="font-semibold text-gray-900">#{order.order_number}</p>
                  <p className="text-sm text-gray-600">{order.customer_email}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">${order.total_amount}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    order.status === 'paid' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-8">No recent orders</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                setSelectedProduct(null);
                setShowProductModal(true);
              }}
              className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-200 group"
            >
              <Plus className="h-8 w-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-blue-900">Add Product</span>
            </button>
            
            <button
              onClick={() => setActiveTab('orders')}
              className="flex flex-col items-center p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all duration-200 group"
            >
              <ShoppingCart className="h-8 w-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-green-900">View Orders</span>
            </button>
            
            <button
              onClick={() => setActiveTab('auto-codes')}
              className="flex flex-col items-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all duration-200 group"
            >
              <Key className="h-8 w-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-purple-900">Manage Codes</span>
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className="flex flex-col items-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl transition-all duration-200 group"
            >
              <Settings className="h-8 w-8 text-orange-600 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-orange-900">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Products Management Component
  const ProductsManagement = () => {
    const filteredProducts = products.filter(product =>
      product.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Products Management</h2>
            <p className="text-gray-600 mt-1">Manage your digital products and inventory</p>
          </div>
          <button
            onClick={() => {
              setSelectedProduct(null);
              setShowProductModal(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <button className="flex items-center space-x-2 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Filter className="h-5 w-5" />
              <span>Filter</span>
            </button>
            <button 
              onClick={loadDashboardData}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Product</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Category</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Price</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Stock</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center overflow-hidden">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name_en}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{product.name_en}</p>
                          <p className="text-sm text-gray-500">{product.sku}</p>
                          {product.duration_days > 0 && (
                            <p className="text-xs text-blue-600">
                              {product.duration_days >= 365 
                                ? `${Math.floor(product.duration_days / 365)} ${Math.floor(product.duration_days / 365) === 1 ? 'year' : 'years'}`
                                : `${Math.floor(product.duration_days / 30)} ${Math.floor(product.duration_days / 30) === 1 ? 'month' : 'months'}`
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {product.category ? getTranslation(product.category.translations, 'name') : 'No Category'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold text-gray-900">${product.price_usd}</p>
                        {product.price_dzd > 0 && (
                          <p className="text-sm text-gray-500">{product.price_dzd} DZD</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                        product.stock_quantity > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                        product.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowProductModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No products found</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Orders Management Component
  const OrdersManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Orders Management</h2>
          <p className="text-gray-600 mt-1">Track and manage customer orders</p>
        </div>
        <button 
          onClick={loadDashboardData}
          className="flex items-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
        >
          <RefreshCw className="h-5 w-5" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Order</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Customer</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Amount</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Date</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-semibold text-gray-900">#{order.order_number}</p>
                      <p className="text-sm text-gray-500 capitalize">{order.payment_method}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900">{order.customer_email}</p>
                      {order.customer_phone && (
                        <p className="text-sm text-gray-500">{order.customer_phone}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-semibold text-gray-900">
                      {order.currency === 'USD' ? '$' : 'دج'}{order.total_amount}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      className={`px-3 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${
                        order.status === 'paid' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="delivered">Delivered</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {orders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );

  // Auto Codes Management Component
  const AutoCodesManagement = () => {
    const [newCodes, setNewCodes] = useState('');
    const [selectedProductId, setSelectedProductId] = useState('');

    const handleAddCodes = async () => {
      if (!selectedProductId || !newCodes.trim()) {
        toast.error('Please select a product and enter codes');
        return;
      }

      const codesArray = newCodes.split('\n').filter(code => code.trim());
      if (codesArray.length === 0) {
        toast.error('Please enter valid codes');
        return;
      }

      const success = await adminDataService.addCodes(selectedProductId, codesArray);
      if (success) {
        setNewCodes('');
        setSelectedProductId('');
        await loadDashboardData();
      }
    };

    const handleDeleteCode = async (codeId: string) => {
      if (window.confirm('Are you sure you want to delete this code?')) {
        const success = await adminDataService.deleteCode(codeId);
        if (success) {
          await loadDashboardData();
        }
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Auto Codes Management</h2>
            <p className="text-gray-600 mt-1">Manage activation codes for automatic product delivery</p>
          </div>
          <button 
            onClick={loadDashboardData}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Add Codes Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Codes</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> Only products with "Auto" fulfillment type are shown here. 
              Auto codes are used for automatic product delivery.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Product</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a product...</option>
                {products.filter(product => product.fulfillment_type === 'auto').map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name_en} ({product.sku})
                  </option>
                ))}
              </select>
              {products.filter(product => product.fulfillment_type === 'auto').length === 0 && (
                <p className="text-sm text-amber-600 mt-2">
                  No products with auto fulfillment found. Please set fulfillment type to "auto" for products that need codes.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Codes (one per line)
              </label>
              <textarea
                value={newCodes}
                onChange={(e) => setNewCodes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter codes, one per line..."
              />
              <button
                onClick={handleAddCodes}
                className="mt-3 w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Add Codes
              </button>
            </div>
          </div>
        </div>

        {/* Codes Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Code</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Product</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Used Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {codes.map((code) => (
                  <tr key={code.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <code className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-mono">
                        {code.code}
                      </code>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-gray-900">{code.product?.name_en || 'Unknown'}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                        code.is_used 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {code.is_used ? 'Used' : 'Available'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-600">
                        {code.used_at ? new Date(code.used_at).toLocaleDateString() : '-'}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      {!code.is_used && (
                        <button
                          onClick={() => handleDeleteCode(code.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {codes.length === 0 && (
            <div className="text-center py-12">
              <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No codes found</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Categories Management Component
  const CategoriesManagement = () => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCategory, setNewCategory] = useState({
      slug: '',
      name_ar: '',
      name_en: '',
      description_ar: '',
      description_en: ''
    });

    const handleCreateCategory = async () => {
      if (!newCategory.slug || !newCategory.name_en || !newCategory.name_ar) {
        toast.error('Please fill in all required fields');
        return;
      }

      const categoryData = {
        slug: newCategory.slug,
        translations: [
          {
            language: 'ar',
            name: newCategory.name_ar,
            description: newCategory.description_ar
          },
          {
            language: 'en',
            name: newCategory.name_en,
            description: newCategory.description_en
          }
        ]
      };

      const success = await adminDataService.createCategory(categoryData);
      if (success) {
        setNewCategory({
          slug: '',
          name_ar: '',
          name_en: '',
          description_ar: '',
          description_en: ''
        });
        setShowAddForm(false);
        await loadDashboardData();
      }
    };

    const handleDeleteCategory = async (categoryId: string) => {
      if (window.confirm('Are you sure you want to delete this category?')) {
        const success = await adminDataService.deleteCategory(categoryId);
        if (success) {
          await loadDashboardData();
        }
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Categories Management</h2>
            <p className="text-gray-600 mt-1">Organize your products with categories</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            <span>Add Category</span>
          </button>
        </div>

        {/* Add Category Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
                <input
                  type="text"
                  value={newCategory.slug}
                  onChange={(e) => setNewCategory({...newCategory, slug: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="category-slug"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name (English) *</label>
                <input
                  type="text"
                  value={newCategory.name_en}
                  onChange={(e) => setNewCategory({...newCategory, name_en: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Category Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name (Arabic) *</label>
                <input
                  type="text"
                  value={newCategory.name_ar}
                  onChange={(e) => setNewCategory({...newCategory, name_ar: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="اسم الفئة"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (English)</label>
                <input
                  type="text"
                  value={newCategory.description_en}
                  onChange={(e) => setNewCategory({...newCategory, description_en: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Category description"
                />
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleCreateCategory}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-colors"
              >
                Create Category
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Categories Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Category</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Slug</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Products</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((category) => {
                  const productsCount = products.filter(p => p.category_id === category.id).length;
                  return (
                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {getTranslation(category.translations, 'name')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {getTranslation(category.translations, 'description')}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <code className="bg-gray-100 px-3 py-1 rounded-lg text-sm">
                          {category.slug}
                        </code>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {productsCount} products
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {categories.length === 0 && (
            <div className="text-center py-12">
              <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No categories found</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Settings Management Component
  const SettingsManagement = () => {
    const [localSettings, setLocalSettings] = useState<SettingsType | null>(settings);

    useEffect(() => {
      setLocalSettings(settings);
    }, [settings]);

    const handleUpdateSetting = async (key: string, value: any) => {
      const success = await adminDataService.updateSetting(key, value);
      if (success) {
        await loadDashboardData();
      }
    };

    if (!localSettings) return <div>Loading...</div>;

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Settings Management</h2>
          <p className="text-gray-600 mt-1">Configure store settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Exchange Rate */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Exchange Rate</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  USD to DZD Rate
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={localSettings.exchange_rate_usd_to_dzd}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    exchange_rate_usd_to_dzd: parseFloat(e.target.value) || 0
                  })}
                  onBlur={() => handleUpdateSetting('exchange_rate_usd_to_dzd', localSettings.exchange_rate_usd_to_dzd)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={localSettings.tax_rate * 100}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    tax_rate: (parseFloat(e.target.value) || 0) / 100
                  })}
                  onBlur={() => handleUpdateSetting('tax_rate', localSettings.tax_rate)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Payment Methods</h3>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localSettings.payment_methods.paypal}
                  onChange={(e) => {
                    const newPaymentMethods = {
                      ...localSettings.payment_methods,
                      paypal: e.target.checked
                    };
                    setLocalSettings({
                      ...localSettings,
                      payment_methods: newPaymentMethods
                    });
                    handleUpdateSetting('payment_methods', newPaymentMethods);
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">PayPal</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localSettings.payment_methods.crypto}
                  onChange={(e) => {
                    const newPaymentMethods = {
                      ...localSettings.payment_methods,
                      crypto: e.target.checked
                    };
                    setLocalSettings({
                      ...localSettings,
                      payment_methods: newPaymentMethods
                    });
                    handleUpdateSetting('payment_methods', newPaymentMethods);
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">Cryptocurrency</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localSettings.payment_methods.chargily}
                  onChange={(e) => {
                    const newPaymentMethods = {
                      ...localSettings.payment_methods,
                      chargily: e.target.checked
                    };
                    setLocalSettings({
                      ...localSettings,
                      payment_methods: newPaymentMethods
                    });
                    handleUpdateSetting('payment_methods', newPaymentMethods);
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">Chargily (Edahabia/CIB)</span>
              </label>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp
                </label>
                <input
                  type="text"
                  value={localSettings.contact_info.whatsapp}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    contact_info: {
                      ...localSettings.contact_info,
                      whatsapp: e.target.value
                    }
                  })}
                  onBlur={() => handleUpdateSetting('contact_info', localSettings.contact_info)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+213 96 35 47 92"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telegram
                </label>
                <input
                  type="text"
                  value={localSettings.contact_info.telegram}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    contact_info: {
                      ...localSettings.contact_info,
                      telegram: e.target.value
                    }
                  })}
                  onBlur={() => handleUpdateSetting('contact_info', localSettings.contact_info)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="@username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={localSettings.contact_info.email}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    contact_info: {
                      ...localSettings.contact_info,
                      email: e.target.value
                    }
                  })}
                  onBlur={() => handleUpdateSetting('contact_info', localSettings.contact_info)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="support@store.com"
                />
              </div>
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Site Status</h3>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localSettings.maintenance_mode}
                  onChange={(e) => {
                    setLocalSettings({
                      ...localSettings,
                      maintenance_mode: e.target.checked
                    });
                    handleUpdateSetting('maintenance_mode', e.target.checked);
                  }}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">Maintenance Mode</span>
              </label>
              <p className="text-sm text-gray-500">
                When enabled, the site will show a maintenance page to visitors
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'products':
        return <ProductsManagement />;
      case 'orders':
        return <OrdersManagement />;
      case 'auto-codes':
        return <AutoCodesManagement />;
      case 'categories':
        return <CategoriesManagement />;
      case 'settings':
        return <SettingsManagement />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
      
      {/* Product Modal */}
      <ProductEditModal
        product={selectedProduct}
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setSelectedProduct(null);
        }}
        onSave={handleProductSave}
      />
    </AdminLayout>
  );
}