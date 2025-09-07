import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Eye, Download, Search, Filter, Calendar, MessageCircle, Instagram, Send, CheckCircle, Copy } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { Order } from '../types';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const { user } = useAuth();
  const { state } = useApp();
  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(
              *,
              translations:product_translations(*)
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchQuery || 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Exclude orders that are still pending (not paid yet).
  // We only want to show orders that have completed payment (paid, delivered, refunded, etc.)
  const visibleOrders = filteredOrders.filter(order => order.status && order.status !== 'pending');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const downloadReceipt = async (order: Order) => {
    try {
      // Create receipt content
      const receiptContent = document.createElement('div');
      receiptContent.style.cssText = `
        width: 400px;
        padding: 20px;
        font-family: Arial, sans-serif;
        background: white;
        color: black;
        direction: ${state.language === 'ar' ? 'rtl' : 'ltr'};
      `;
      
      const currencySymbol = order.currency === 'USD' ? '$' : 'دج';
      
      receiptContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #f59e0b; margin: 0;">ATHMANEBZN STORE</h2>
          <p style="margin: 5px 0; font-size: 14px;">Digital Products Receipt</p>
        </div>
        
        <div style="border-bottom: 2px solid #f59e0b; margin: 20px 0;"></div>
        
        <div style="margin-bottom: 15px;">
          <strong>Order #:</strong> ${order.order_number}<br>
          <strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}<br>
          <strong>Status:</strong> ${order.status}<br>
          <strong>Payment Method:</strong> ${order.payment_method}<br>
          <strong>Customer:</strong> ${order.customer_email}
        </div>
        
        <div style="border-bottom: 1px solid #ddd; margin: 15px 0;"></div>
        
        <div style="margin-bottom: 15px;">
          <h3 style="margin: 0 0 10px 0;">Items:</h3>
          ${order.items?.filter(item => item.order_id === order.id).map(item => {
            const product = item.product!;
            const name = product.translations?.find(t => t.language === state.language)?.name || 
                       product.translations?.find(t => t.language === 'en')?.name || 
                       'Unknown Product';
            return `
              <div style="margin-bottom: 8px; padding: 8px; background: #f9f9f9;">
                <strong>${name}</strong><br>
                Qty: ${item.quantity} × ${currencySymbol}${item.unit_price.toFixed(2)} = ${currencySymbol}${item.total_price.toFixed(2)}
                ${item.delivery_code ? `<br><strong>Code:</strong> ${item.delivery_code}` : ''}
              </div>
            `;
          }).join('')}
        </div>
        
        <div style="border-bottom: 1px solid #ddd; margin: 15px 0;"></div>
        
        <div style="text-align: right;">
          <div><strong>Subtotal:</strong> ${currencySymbol}${order.subtotal.toFixed(2)}</div>
          ${order.tax_amount > 0 ? `<div><strong>Tax:</strong> ${currencySymbol}${order.tax_amount.toFixed(2)}</div>` : ''}
          <div style="font-size: 18px; color: #f59e0b;"><strong>Total: ${currencySymbol}${order.total_amount.toFixed(2)}</strong></div>
        </div>
        
        <div style="border-top: 2px solid #f59e0b; margin: 20px 0; padding-top: 15px; text-align: center; font-size: 12px;">
          <p>Thank you for your purchase!</p>
          <p>Support: WhatsApp +213 96 35 47 92</p>
          <p>Instagram: @athmaanebzn | Telegram: @atmnexe1</p>
        </div>
      `;
      
      // Add to DOM temporarily
      document.body.appendChild(receiptContent);
      
      // Convert to canvas and PDF
      const canvas = await html2canvas(receiptContent, {
        backgroundColor: '#ffffff',
        scale: 2
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`Receipt-${order.order_number}.pdf`);
      
      // Remove from DOM
      document.body.removeChild(receiptContent);
      
      toast.success('Receipt downloaded successfully!');
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error('Failed to generate receipt');
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-8">You need to be signed in to view your orders.</p>
          <Link
            to="/login"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${state.language === 'ar' ? 'rtl' : 'ltr'}`}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('orders.title')}</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        ) : visibleOrders.length > 0 ? (
          <div className="space-y-6">
            {visibleOrders.map((order) => {
              const currencySymbol = order.currency === 'USD' ? '$' : 'دج';
              
              return (
                <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.order_number}
                        </h3>
                        <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-600 mt-1">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                          <span>{currencySymbol}{order.total_amount.toFixed(2)}</span>
                          <span className="capitalize">{order.payment_method}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <button
                          onClick={() => downloadReceipt(order)}
                          className="flex items-center space-x-1 rtl:space-x-reverse text-green-600 hover:text-green-700 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          <span>Receipt</span>
                        </button>
                        <Link
                          to={`/order-success?order=${order.id}`}
                          className="flex items-center space-x-1 rtl:space-x-reverse text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-3">
                      {order.items?.slice(0, 3).map((item) => {
                        const product = item.product!;
                        const name = product.translations?.find(t => t.language === state.language)?.name || 
                                   product.translations?.find(t => t.language === 'en')?.name || 
                                   'Unknown Product';
                        
                        return (
                          <div key={item.id} className="flex items-center space-x-3 rtl:space-x-reverse">
                            <div className="h-12 w-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Package className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                              <p className="text-xs text-gray-500">
                                Qty: {item.quantity} × {currencySymbol}{item.unit_price.toFixed(2)}
                              </p>
                              {item.delivery_status === 'delivered' ? (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                                  <div className="flex items-center mb-2">
                                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 rtl:ml-2 rtl:mr-0" />
                                    <span className="text-sm font-medium text-green-800">Delivered</span>
                                  </div>
                                  {item.delivery_code ? (
                                    <div className="space-y-2">
                                      <p className="text-xs text-green-700">Your activation code:</p>
                                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                        <code className="bg-white px-3 py-1 rounded border text-sm font-mono">
                                          {item.delivery_code}
                                        </code>
                                        <button
                                          onClick={() => navigator.clipboard.writeText(item.delivery_code!)}
                                          className="text-green-600 hover:text-green-700 transition-colors"
                                        >
                                          <Copy className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>
                                  ) : null}
                                </div>
                              ) : (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                                  <div className="flex items-center mb-2">
                                    <MessageCircle className="h-4 w-4 text-blue-600 mr-2 rtl:ml-2 rtl:mr-0" />
                                    <span className="text-sm font-medium text-blue-800">Contact Support</span>
                                  </div>
                                  <p className="text-xs text-blue-700 mb-3">
                                    Please contact our support team to receive your account details:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    <a
                                      href="https://wa.me/21396354792"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center space-x-1 rtl:space-x-reverse bg-green-100 text-green-800 px-2 py-1 rounded text-xs hover:bg-green-200 transition-colors"
                                    >
                                      <MessageCircle className="h-3 w-3" />
                                      <span>WhatsApp</span>
                                    </a>
                                    <a
                                      href="https://instagram.com/athmaanebzn"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center space-x-1 rtl:space-x-reverse bg-pink-100 text-pink-800 px-2 py-1 rounded text-xs hover:bg-pink-200 transition-colors"
                                    >
                                      <Instagram className="h-3 w-3" />
                                      <span>Instagram</span>
                                    </a>
                                    <a
                                      href="https://t.me/atmnexe1"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center space-x-1 rtl:space-x-reverse bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs hover:bg-blue-200 transition-colors"
                                    >
                                      <Send className="h-3 w-3" />
                                      <span>Telegram</span>
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      {order.items && order.items.length > 3 && (
                        <p className="text-sm text-gray-500 text-center pt-2">
                          +{order.items.length - 3} more items
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('orders.no_orders')}</h3>
            <p className="text-gray-600 mb-8">You haven't placed any orders yet.</p>
            <Link
              to="/"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}