import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ReceiptPage = () => {
  const { receiptId, orderId } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    fetchReceipt();
  }, [receiptId, orderId]);

  const fetchReceipt = async () => {
    try {
      const token = localStorage.getItem('token');
      let url;
      
      // If we have orderId, use the order endpoint, otherwise use receipt ID
      if (orderId) {
        url = `http://localhost:5000/api/receipts/order/${orderId}`;
      } else if (receiptId) {
        url = `http://localhost:5000/api/receipts/${receiptId}`;
      } else {
        setError('No receipt or order ID provided');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(url, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setReceipt(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load receipt');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!receipt) return;
    
    setResending(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/receipts/${receipt.id}/resend`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Receipt resent to your email!');
    } catch (err) {
      alert('Failed to resend receipt');
    } finally {
      setResending(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading receipt...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">{error}</p>
          <button
            onClick={() => navigate('/orders')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Action buttons */}
        <div className="mb-6 flex justify-between items-center print:hidden">
          <button
            onClick={() => navigate(`/orders/${receipt.order_id}`)}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Order
          </button>
          <div className="space-x-3">
            <button
              onClick={handlePrint}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Print
            </button>
            <button
              onClick={handleResend}
              disabled={resending}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Resend Email'}
            </button>
          </div>
        </div>

        {/* Receipt Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 print:shadow-none">
          {/* Header */}
          <div className="text-center mb-8 pb-6 border-b-2 border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Receipt</h1>
            <p className="text-gray-600">Proof of Payment</p>
          </div>

          {/* Receipt Details */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-sm text-gray-600 mb-1">Receipt Number</p>
              <p className="text-lg font-semibold text-gray-900">{receipt.receipt_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Order Number</p>
              <p className="text-lg font-semibold text-gray-900">#{receipt.order_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Issued Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(receipt.issued_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Payment Method</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">{receipt.payment_method}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-medium">Name:</span> {receipt.customer_name}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Email:</span> {receipt.customer_email}
              </p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
                <p className="text-3xl font-bold text-blue-600">
                  ${receipt.amount.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                {receipt.transaction_id && (
                  <>
                    <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                    <p className="text-sm font-mono text-gray-800">{receipt.transaction_id}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-800 font-semibold text-lg">Payment Successful</span>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>This is an official receipt for your payment.</p>
            <p className="mt-2">For questions, please contact support with your receipt number.</p>
            <p className="mt-4 font-medium">Thank you for your purchase!</p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-600 print:hidden">
          <p>Need help? Contact us at support@store.com</p>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPage;
