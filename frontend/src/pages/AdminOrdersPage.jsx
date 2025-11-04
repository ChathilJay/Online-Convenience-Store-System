import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiInterceptor';
import { Search, Filter, Truck, CheckCircle } from 'lucide-react';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('http://127.0.0.1:5000/api/orders/all');
      setOrders(response.data);
      setError('');
    } catch (error) {
      setError('Failed to fetch orders: ' + (error.response?.data?.error || error.message));
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toString().includes(searchTerm) ||
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const handleDispatch = async (orderId, e) => {
    e.stopPropagation();
    try {
      await apiClient.post(`http://127.0.0.1:5000/api/orders/${orderId}/dispatch`);
      fetchOrders(); // Refresh orders
    } catch (error) {
      alert('Failed to dispatch order: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeliver = async (orderId, e) => {
    e.stopPropagation();
    try {
      await apiClient.post(`http://127.0.0.1:5000/api/orders/${orderId}/deliver`);
      fetchOrders(); // Refresh orders
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

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="text-sm text-gray-500 mb-4">
            Home › Admin › <span className="text-black">Order Management</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            Loading orders...
          </div>
        )}

          {!loading && (
            <>
              {/* Filters and Search */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search by order ID, customer name, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent appearance-none"
                    >
                      <option value="all">All Status</option>
                      <option value="placed">Placed</option>
                      <option value="paid">Paid</option>
                      <option value="dispatched">Dispatched</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Orders Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 text-center">
              <p className="text-gray-600 text-sm">Total</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 text-center">
              <p className="text-gray-600 text-sm">Paid</p>
              <p className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.status === 'paid').length}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 text-center">
              <p className="text-gray-600 text-sm">Dispatched</p>
              <p className="text-2xl font-bold text-blue-600">
                {orders.filter(o => o.status === 'dispatched').length}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 text-center">
              <p className="text-gray-600 text-sm">Delivered</p>
              <p className="text-2xl font-bold text-purple-600">
                {orders.filter(o => o.status === 'delivered').length}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 text-center">
              <p className="text-gray-600 text-sm">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">
                {orders.filter(o => o.status === 'cancelled').length}
              </p>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr 
                        key={order.id} 
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                          <div className="text-sm text-gray-500">{order.customer_email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          ${order.total_amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()} <br />
                          <span className="text-xs">{new Date(order.created_at).toLocaleTimeString()}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {canDispatch(order.status) && (
                            <button
                              onClick={(e) => handleDispatch(order.id, e)}
                              className="text-green-600 hover:text-green-900 inline-flex items-center gap-1"
                              title="Mark as Dispatched"
                            >
                              <Truck size={16} />
                            </button>
                          )}
                          {canDeliver(order.status) && (
                            <button
                              onClick={(e) => handleDeliver(order.id, e)}
                              className="text-purple-600 hover:text-purple-900 inline-flex items-center gap-1"
                              title="Mark as Delivered"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
            </>
          )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
