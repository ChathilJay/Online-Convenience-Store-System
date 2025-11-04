import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Calendar, DollarSign, Package, Eye, CheckCircle, XCircle } from 'lucide-react';
import apiClient from '../utils/apiInterceptor';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PaymentHistoryPage = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      // Fetch all orders which contain payment information
      const { data } = await apiClient.get('http://127.0.0.1:5000/api/orders');
      
      // Filter orders that have payments and extract payment info
      const paymentsWithOrders = data
        .filter(order => order.payment)
        .map(order => ({
          ...order.payment,
          orderId: order.id,
          orderStatus: order.status,
          customerName: order.customer_name,
          createdAt: order.created_at
        }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setPayments(paymentsWithOrders);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch payment history.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentStatusIcon = (status) => {
    const lowerStatus = status?.toLowerCase();
    if (lowerStatus === 'completed' || lowerStatus === 'captured') {
      return <CheckCircle className="text-green-500" size={20} />;
    }
    return <XCircle className="text-red-500" size={20} />;
  };

  const getPaymentStatusColor = (status) => {
    const statusColors = {
      'completed': 'bg-green-100 text-green-800',
      'captured': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'declined': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800',
      'refunded': 'bg-blue-100 text-blue-800'
    };
    return statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const calculateTotalPaid = () => {
    return payments
      .filter(p => p.status === 'completed' || p.status === 'captured')
      .reduce((sum, p) => sum + (p.amount || 0), 0)
      .toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payment history...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="text-sm text-gray-500 mb-6">
            Home › Account › <span className="text-black">Payment History</span>
          </div>

          <h1 className="text-3xl font-bold mb-8">Payment History</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="text-blue-600" size={24} />
                <h3 className="text-sm font-medium text-gray-600">Total Payments</h3>
              </div>
              <p className="text-2xl font-bold">{payments.length}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="text-green-600" size={24} />
                <h3 className="text-sm font-medium text-gray-600">Total Paid</h3>
              </div>
              <p className="text-2xl font-bold">${calculateTotalPaid()}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="text-purple-600" size={24} />
                <h3 className="text-sm font-medium text-gray-600">Successful</h3>
              </div>
              <p className="text-2xl font-bold">
                {payments.filter(p => p.status === 'completed' || p.status === 'captured').length}
              </p>
            </div>
          </div>

          {/* Payment List */}
          {payments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
              <CreditCard size={64} className="mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No payment history</h2>
              <p className="text-gray-600 mb-6">You haven't made any payments yet.</p>
              <button
                onClick={() => navigate('/products')}
                className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Transaction ID</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Order</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Method</th>
                      <th className="text-right py-4 px-6 font-semibold text-gray-700">Amount</th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">Status</th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            {getPaymentStatusIcon(payment.status)}
                            <span className="font-mono text-sm">{payment.transaction_id}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Package size={16} className="text-gray-400" />
                            <span className="font-medium">#{payment.orderId}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={14} />
                            {formatDate(payment.created_at)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="capitalize text-sm">
                            {payment.payment_method?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="font-semibold">${payment.amount?.toFixed(2)}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>
                              {payment.status?.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-center">
                            <button
                              onClick={() => navigate(`/orders/${payment.orderId}`)}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                            >
                              <Eye size={16} />
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentHistoryPage;
