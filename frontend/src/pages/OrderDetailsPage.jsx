import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, MapPin, CreditCard, ArrowLeft, X, AlertCircle, FileText, Eye, RefreshCw } from 'lucide-react';
import apiClient from '../utils/apiInterceptor';
import { useToast } from '../context/ToastContext';
import useSSE from '../hooks/useSSE';
import OrderStatusTimeline from '../components/OrderStatusTimeline';
import Header from '../components/Header';
import Footer from '../components/Footer';

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // SSE callback for order status updates
  const handleOrderStatusUpdate = useCallback((order_id, old_status, new_status) => {
    // Only refresh if it's for the current order
    if (order_id === parseInt(orderId)) {
      fetchOrderDetails(true); // silent refresh
    }
  }, [orderId]);

  // Set up SSE connection
  useSSE(handleOrderStatusUpdate, null, null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const { data } = await apiClient.get(`http://127.0.0.1:5000/api/orders/${orderId}`);
      setOrder(data);
      setError('');
    } catch (err) {
      if (!silent) {
        setError(err.response?.data?.error || 'Failed to fetch order details.');
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
    fetchOrderDetails();
    toast.info('Refreshing order status...', 2000);
  };

  const handleCancelOrder = async () => {
    setCancelLoading(true);
    setError('');
    
    try {
      await apiClient.post(`http://127.0.0.1:5000/api/orders/${orderId}/cancel`);
      setShowCancelModal(false);
      toast.success('Order cancelled successfully', 5000);
      fetchOrderDetails(); // Refresh order details
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel order.');
      toast.error(err.response?.data?.error || 'Failed to cancel order.', 5000);
      setShowCancelModal(false);
    } finally {
      setCancelLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const canCancelOrder = () => {
    return order && order.status === 'paid';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 bg-gray-50">
          <div className="container mx-auto px-4 py-12">
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
            <button
              onClick={() => navigate('/orders')}
              className="bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Back to Orders
            </button>
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
            Home › Orders › <span className="text-black">Order #{orderId}</span>
          </div>

          <button
            onClick={() => navigate('/orders')}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition-colors"
          >
            <ArrowLeft size={20} /> Back to Orders
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Order #{order.id}</h1>
              <p className="text-gray-600">Placed on {formatDate(order.created_at)}</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              {order.payment && order.payment.id && (
                <button
                  onClick={() => navigate(`/receipt/order/${order.id}`)}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <FileText size={16} />
                  View Receipt
                </button>
              )}
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh order status"
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
          </div>

          {/* Real-time notifications indicator */}
          <div className="flex items-center gap-2 mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-gray-700">
              🔔 Real-time notifications enabled - You'll be notified instantly when the order status changes
            </span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Status Timeline */}
              <OrderStatusTimeline 
                currentStatus={order.status}
                createdAt={order.created_at}
                updatedAt={order.updated_at}
              />

              {/* Order Items */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Package className="text-gray-700" size={24} />
                  <h2 className="text-xl font-bold">Order Items</h2>
                </div>
                
                <div className="space-y-4">
                  {order.items && order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        {item.product?.image_path ? (
                          <img 
                            src={item.product.image_path.startsWith('http') 
                              ? item.product.image_path 
                              : `http://127.0.0.1:5000${item.product.image_path}`
                            } 
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{item.product_name}</h3>
                        <p className="text-sm text-gray-600 mb-2">Quantity: {item.quantity}</p>
                        <p className="text-sm font-medium">${item.unit_price?.toFixed(2)} each</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">${item.line_total?.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping & Billing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shipping Address */}
                <div className="bg-white rounded-2xl shadow-sm border p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="text-gray-700" size={20} />
                    <h3 className="font-bold">Shipping Address</h3>
                  </div>
                  
                  {order.shipping_address && (
                    <div className="text-gray-700 text-sm">
                      <p>{order.shipping_address.street}</p>
                      <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                      <p>{order.shipping_address.postal_code}</p>
                      <p>{order.shipping_address.country}</p>
                    </div>
                  )}
                </div>

                {/* Billing Address */}
                <div className="bg-white rounded-2xl shadow-sm border p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="text-gray-700" size={20} />
                    <h3 className="font-bold">Billing Address</h3>
                  </div>
                  
                  {order.billing_address && (
                    <div className="text-gray-700 text-sm">
                      <p>{order.billing_address.street}</p>
                      <p>{order.billing_address.city}, {order.billing_address.state}</p>
                      <p>{order.billing_address.postal_code}</p>
                      <p>{order.billing_address.country}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="text-gray-700" size={24} />
                  <h2 className="text-xl font-bold">Payment Information</h2>
                </div>
                
                {order.payment && (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium capitalize">{order.payment.payment_method?.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.payment.status)}`}>
                        {order.payment.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-mono text-xs">{order.payment.transaction_id}</span>
                    </div>
                    {order.payment.paid_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Paid At:</span>
                        <span className="text-sm">{formatDate(order.payment.paid_at)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Invoice Section */}
              {(order.status === 'paid' || order.status === 'dispatched' || order.status === 'delivered') && (
                <div className="bg-white rounded-2xl shadow-sm border p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="text-gray-700" size={24} />
                    <h2 className="text-xl font-bold">Invoice</h2>
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    Your invoice has been generated and sent to your email.
                  </p>
                  
                  <button
                    onClick={() => navigate(`/orders/${orderId}/invoice`)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <Eye size={18} />
                    View Invoice
                  </button>
                </div>
              )}
            </div>

            {/* Order Summary & Actions */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-6">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-medium">${order.total_amount}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping:</span>
                    <span className="font-medium">Free</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-2xl font-bold">${order.total_amount}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {canCancelOrder() && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      disabled={cancelLoading}
                      className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancelLoading ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                  
                  <button
                    onClick={() => navigate('/products')}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-black font-medium py-3 rounded-lg transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Cancel Order?</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-500 hover:text-black transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-black font-medium py-3 rounded-lg transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelLoading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailsPage;
