import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../utils/apiInterceptor';
import { ArrowLeft, Package, User, MapPin, CreditCard, Truck, CheckCircle } from 'lucide-react';

const AdminOrderDetailsPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`http://127.0.0.1:5000/api/orders/${orderId}`);
      setOrder(response.data);
      setError('');
    } catch (error) {
      setError('Failed to fetch order details: ' + (error.response?.data?.error || error.message));
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatch = async () => {
    try {
      await apiClient.post(`http://127.0.0.1:5000/api/orders/${orderId}/dispatch`);
      fetchOrderDetails(); // Refresh order
    } catch (error) {
      alert('Failed to dispatch order: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeliver = async () => {
    try {
      await apiClient.post(`http://127.0.0.1:5000/api/orders/${orderId}/deliver`);
      fetchOrderDetails(); // Refresh order
    } catch (error) {
      alert('Failed to deliver order: ' + (error.response?.data?.error || error.message));
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      placed: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      dispatched: 'bg-blue-100 text-blue-800',
      delivered: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  };

  const canDispatch = (status) => status === 'paid';
  const canDeliver = (status) => status === 'dispatched';

  if (loading) {
    return (
      <div>
        <div className="text-center py-12">Loading order details...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Order not found'}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb and Header */}
        <div className="mb-8">
          <div className="text-sm text-gray-500 mb-4">
            Home › Admin › Orders › <span className="text-black">Order #{order.id}</span>
          </div>
          <button
            onClick={() => navigate('/admin/orders')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft size={20} />
              Back to Orders
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
                <p className="text-gray-500 mt-1">
                  Placed on {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <span className={`px-4 py-2 text-sm font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          {(canDispatch(order.status) || canDeliver(order.status)) && (
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex gap-4">
                {canDispatch(order.status) && (
                  <button
                    onClick={handleDispatch}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    <Truck size={20} />
                    Mark as Dispatched
                  </button>
                )}
                {canDeliver(order.status) && (
                  <button
                    onClick={handleDeliver}
                    className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-medium"
                  >
                    <CheckCircle size={20} />
                    Mark as Delivered
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Package size={20} />
                    Order Items
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.product_name}</h3>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">${item.line_total.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">${item.unit_price.toFixed(2)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total</span>
                      <span className="text-blue-600">${order.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer & Shipping Info */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <User size={20} />
                    Customer Info
                  </h2>
                </div>
                <div className="p-6 space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{order.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{order.customer_email}</p>
                  </div>
                  {order.customer_phone && (
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{order.customer_phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin size={20} />
                    Shipping Address
                  </h2>
                </div>
                <div className="p-6">
                  {order.shipping_address ? (
                    <>
                      <p className="text-gray-900">{order.shipping_address.street}</p>
                      <p className="text-gray-900">
                        {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                      </p>
                      <p className="text-gray-900">{order.shipping_address.country}</p>
                    </>
                  ) : (
                    <p className="text-gray-500">No shipping address provided</p>
                  )}
                </div>
              </div>

              {/* Order Timeline */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Order Timeline</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${order.status === 'placed' || order.status === 'paid' || order.status === 'dispatched' || order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <div className="w-0.5 h-8 bg-gray-300"></div>
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-gray-900">Order Placed</p>
                        <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${order.status === 'paid' || order.status === 'dispatched' || order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <div className="w-0.5 h-8 bg-gray-300"></div>
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-gray-900">Payment Confirmed</p>
                        <p className="text-sm text-gray-500">
                          {order.status === 'paid' || order.status === 'dispatched' || order.status === 'delivered' ? 
                            new Date(order.updated_at).toLocaleString() : 'Pending'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${order.status === 'dispatched' || order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <div className="w-0.5 h-8 bg-gray-300"></div>
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-gray-900">Dispatched</p>
                        <p className="text-sm text-gray-500">
                          {order.status === 'dispatched' || order.status === 'delivered' ? 
                            new Date(order.updated_at).toLocaleString() : 'Pending'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Delivered</p>
                        <p className="text-sm text-gray-500">
                          {order.status === 'delivered' ? 
                            new Date(order.updated_at).toLocaleString() : 'Pending'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default AdminOrderDetailsPage;
