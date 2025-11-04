import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Download, Mail, ArrowLeft, Building, MapPin, Calendar, DollarSign } from 'lucide-react';
import apiClient from '../utils/apiInterceptor';
import Header from '../components/Header';
import Footer from '../components/Footer';

const InvoicePage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    fetchInvoiceAndOrder();
  }, [orderId]);

  const fetchInvoiceAndOrder = async () => {
    try {
      // Fetch invoice
      const { data: invoiceData } = await apiClient.get(
        `http://127.0.0.1:5000/api/invoices/orders/${orderId}/invoice`
      );
      setInvoice(invoiceData);

      // Fetch order details
      const { data: orderData } = await apiClient.get(
        `http://127.0.0.1:5000/api/orders/${orderId}`
      );
      setOrder(orderData);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch invoice.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvoice = async () => {
    setResending(true);
    setError('');
    setResendSuccess(false);

    try {
      await apiClient.post(
        `http://127.0.0.1:5000/api/invoices/${invoice.id}/resend`
      );
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend invoice.');
    } finally {
      setResending(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading invoice...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !invoice) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 bg-gray-50">
          <div className="container mx-auto px-4 py-12">
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
            <button
              onClick={() => navigate(`/orders/${orderId}`)}
              className="bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Back to Order
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-500 mb-6 print:hidden">
            Home › Orders › Order #{orderId} › <span className="text-black">Invoice</span>
          </div>

          {/* Back button */}
          <button
            onClick={() => navigate(`/orders/${orderId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition-colors print:hidden"
          >
            <ArrowLeft size={20} /> Back to Order Details
          </button>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Download size={18} />
              Download/Print
            </button>
            
            <button
              onClick={handleResendInvoice}
              disabled={resending}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail size={18} />
              {resending ? 'Sending...' : 'Resend to Email'}
            </button>
          </div>

          {/* Success/Error Messages */}
          {resendSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6 print:hidden">
              Invoice has been sent to your email successfully!
            </div>
          )}

          {error && invoice && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 print:hidden">
              {error}
            </div>
          )}

          {/* Invoice */}
          <div className="bg-white rounded-2xl shadow-sm border p-8 md:p-12 print:shadow-none print:border-0">
            {/* Invoice Header */}
            <div className="flex flex-col md:flex-row justify-between items-start mb-8 pb-8 border-b">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <FileText size={32} className="text-gray-700" />
                  <h1 className="text-3xl font-bold">INVOICE</h1>
                </div>
                <div className="text-gray-600">
                  <p className="font-semibold text-lg mb-1">{invoice.invoice_number}</p>
                  <p className="text-sm">Order ID: #{order?.id}</p>
                </div>
              </div>
              
              <div className="mt-6 md:mt-0 text-left md:text-right">
                <div className="flex items-center gap-2 mb-2">
                  <Building size={20} className="text-gray-600" />
                  <h2 className="font-bold text-lg">Online Convenience Store</h2>
                </div>
                <p className="text-sm text-gray-600">123 Business Street</p>
                <p className="text-sm text-gray-600">City, State 12345</p>
                <p className="text-sm text-gray-600">contact@store.com</p>
                <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
              </div>
            </div>

            {/* Customer & Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Bill To */}
              <div>
                <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <MapPin size={18} />
                  Bill To
                </h3>
                <div className="text-gray-700">
                  <p className="font-semibold">{invoice.customer_name}</p>
                  <p className="text-sm">{invoice.customer_email}</p>
                  {invoice.billing_address && (
                    <>
                      <p className="text-sm mt-2">{invoice.billing_address.street}</p>
                      <p className="text-sm">
                        {invoice.billing_address.city}, {invoice.billing_address.state}
                      </p>
                      <p className="text-sm">{invoice.billing_address.postal_code}</p>
                      <p className="text-sm">{invoice.billing_address.country}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Invoice Details */}
              <div>
                <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Calendar size={18} />
                  Invoice Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Issue Date:</span>
                    <span className="font-medium">{formatDate(invoice.issue_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-medium">{formatDate(invoice.due_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 
                      invoice.status === 'issued' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {invoice.status?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items Table */}
            <div className="mb-8">
              <h3 className="font-bold text-gray-700 mb-4">Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">Item</th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-700">Quantity</th>
                      <th className="text-right py-3 px-2 font-semibold text-gray-700">Unit Price</th>
                      <th className="text-right py-3 px-2 font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order?.items?.map((item) => (
                      <tr key={item.id} className="border-b border-gray-200">
                        <td className="py-4 px-2">
                          <div className="font-medium">{item.product_name}</div>
                        </td>
                        <td className="py-4 px-2 text-center">{item.quantity}</td>
                        <td className="py-4 px-2 text-right">${item.unit_price?.toFixed(2)}</td>
                        <td className="py-4 px-2 text-right font-medium">
                          ${item.line_total?.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full md:w-80">
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-medium">${invoice.total_amount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax:</span>
                    <span className="font-medium">${invoice.tax_amount?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping:</span>
                    <span className="font-medium">${invoice.shipping_amount?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">Total:</span>
                      <span className="text-2xl font-bold">${invoice.total_amount?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            {order?.payment && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <DollarSign size={18} />
                  Payment Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium capitalize">
                        {order.payment.payment_method?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.payment.status === 'completed' || order.payment.status === 'captured' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.payment.status?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between md:col-span-2">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-mono text-xs">{order.payment.transaction_id}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Note */}
            <div className="mt-8 pt-8 border-t text-center text-sm text-gray-500">
              <p>Thank you for your business!</p>
              <p className="mt-2">For any questions regarding this invoice, please contact us at contact@store.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
