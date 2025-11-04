import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, MapPin, CreditCard, ArrowRight, FileText } from 'lucide-react';
import apiClient from '../utils/apiInterceptor';
import Header from '../components/Header';
import Footer from '../components/Footer';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const { data } = await apiClient.get(`http://127.0.0.1:5000/api/orders/${orderId}`);
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch order details.');
    } finally {
      setLoading(false);
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

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 bg-gray-50">
          <div className="container mx-auto px-4 py-12">
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error || 'Order not found'}
            </div>
            <button
              onClick={() => navigate('/orders')}
              className="bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              View All Orders
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
          {/* Success Header */}
          <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8 text-center">
            <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-gray-600 mb-4">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
            <div className="flex justify-center gap-4 mb-4">
              <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600">Order ID:</span>
                <span className="font-mono font-semibold">#{order.id}</span>
              </div>
              {order.payment && order.payment.id && (
                <button
                  onClick={() => navigate(`/receipt/order/${order.id}`)}
                  className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <FileText size={16} />
                  <span className="text-sm font-medium">View Receipt</span>
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500">
              A confirmation email with your receipt has been sent to {order.customer_email}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Package className="text-gray-700" size={24} />
                  <h2 className="text-xl font-bold">Order Items</h2>
                </div>
                
                <div className="space-y-4">
                  {order.items && order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
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
                        <h3 className="font-semibold mb-1">{item.product_name}</h3>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-sm font-medium mt-2">${item.unit_price?.toFixed(2)} each</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${item.line_total?.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="text-gray-700" size={24} />
                  <h2 className="text-xl font-bold">Shipping Address</h2>
                </div>
                
                {order.shipping_address && (
                  <div className="text-gray-700">
                    <p>{order.shipping_address.street}</p>
                    <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                    <p>{order.shipping_address.country}</p>
                  </div>
                )}
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="text-gray-700" size={24} />
                  <h2 className="text-xl font-bold">Payment Information</h2>
                </div>
                
                {order.payment && (
                  <div className="space-y-2">
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
                      <span className="font-mono text-sm">{order.payment.transaction_id}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-6">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Order Date:</span>
                    <span className="font-medium text-sm">{formatDate(order.created_at)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-gray-600 mb-2">
                      <span>Subtotal:</span>
                      <span className="font-medium">${order.total_amount}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 mb-2">
                      <span>Shipping:</span>
                      <span className="font-medium">Free</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total:</span>
                        <span className="text-2xl font-bold">${order.total_amount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/orders')}
                    className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    View All Orders <ArrowRight size={20} />
                  </button>
                  
                  {(order.status === 'paid' || order.status === 'dispatched' || order.status === 'delivered') && (
                    <button
                      onClick={() => navigate(`/orders/${orderId}/invoice`)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <FileText size={20} />
                      View Invoice
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
    </div>
  );
};

export default OrderConfirmationPage;
