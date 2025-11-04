import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Eye, Calendar, DollarSign, CreditCard, RefreshCw } from 'lucide-react';
import apiClient from '../utils/apiInterceptor';
import { useToast } from '../context/ToastContext';
import useSSE from '../hooks/useSSE';
import Header from '../components/Header';
import Footer from '../components/Footer';

const OrdersPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // SSE callback for order status updates
  const handleOrderStatusUpdate = useCallback(() => {
    // Refresh all orders when any order status changes
    fetchOrders(true);
  }, []);

  // Set up SSE connection
  useSSE(handleOrderStatusUpdate, null, null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const { data } = await apiClient.get('http://127.0.0.1:5000/api/orders');
      setOrders(data);
    } catch (err) {
      if (!silent) {
        setError(err.response?.data?.error || 'Failed to fetch orders.');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  const handleManualRefresh = () => {
    fetchOrders();
    toast.info('Refreshing orders...', 2000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'paid': 'bg-green-100 text-green-800',
      'dispatched': 'bg-blue-100 text-blue-800',
      'delivered': 'bg-purple-100 text-purple-800',
      'cancelled': 'bg-red-100 text-red-800',
      'pending': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="text-sm text-gray-500 mb-6">
            Home › <span className="text-black">My Orders</span>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <h1 className="text-3xl font-bold">My Orders</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh orders"
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                onClick={() => navigate('/payment-history')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <CreditCard size={18} />
                Payment History
              </button>
            </div>
          </div>

          {/* Real-time notifications indicator */}
          <div className="flex items-center gap-2 mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-gray-700">
              🔔 Real-time notifications enabled - You'll receive instant updates when order status changes
            </span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
              <Package size={64} className="mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
              <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
              <button
                onClick={() => navigate('/products')}
                className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Package className="text-gray-700" size={24} />
                        <div>
                          <h3 className="text-lg font-bold">Order #{order.id}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={14} />
                            <span>{formatDate(order.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <div className="flex items-center gap-2 text-gray-700">
                          <DollarSign size={16} />
                          <span className="font-semibold">${order.total_amount}</span>
                        </div>
                        {order.items && (
                          <span className="text-sm text-gray-600">
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                          </span>
                        )}
                      </div>
                      
                      {order.shipping_address && (
                        <p className="text-sm text-gray-600">
                          Ship to: {order.shipping_address.city}, {order.shipping_address.state}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        <Eye size={18} />
                        View Details
                      </button>
                      
                      {order.status === 'paid' && (
                        <button
                          onClick={() => navigate(`/orders/${order.id}`)}
                          className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
