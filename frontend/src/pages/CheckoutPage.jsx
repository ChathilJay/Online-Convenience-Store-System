import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, Package, ArrowLeft, Lock } from 'lucide-react';
import apiClient from '../utils/apiInterceptor';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    // Shipping Address
    shipping_street: '',
    shipping_city: '',
    shipping_state: '',
    shipping_postal_code: '',
    shipping_country: '',
    
    // Billing Address
    use_shipping_as_billing: true,
    billing_street: '',
    billing_city: '',
    billing_state: '',
    billing_postal_code: '',
    billing_country: '',
    
    // Payment Details
    payment_method: 'credit_card',
    card_number: '',
    card_holder: '',
    cvv: '',
    expiry_date: '',
  });

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const { data } = await apiClient.get('http://127.0.0.1:5000/api/cart');
      setCartItems(data.items);
      
      if (!data.items || data.items.length === 0) {
        navigate('/cart');
      }
    } catch (err) {
      setError('Failed to fetch cart items.');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const generateIdempotencyKey = () => {
    return `checkout_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const billingAddress = formData.use_shipping_as_billing ? {
        street: formData.shipping_street,
        city: formData.shipping_city,
        state: formData.shipping_state,
        postal_code: formData.shipping_postal_code,
        country: formData.shipping_country,
      } : {
        street: formData.billing_street,
        city: formData.billing_city,
        state: formData.billing_state,
        postal_code: formData.billing_postal_code,
        country: formData.billing_country,
      };

      const payload = {
        shipping_address: {
          street: formData.shipping_street,
          city: formData.shipping_city,
          state: formData.shipping_state,
          postal_code: formData.shipping_postal_code,
          country: formData.shipping_country,
        },
        billing_address: billingAddress,
        payment_details: {
          payment_method: formData.payment_method,
          card_number: formData.card_number,
          card_holder: formData.card_holder,
          cvv: formData.cvv,
          expiry_date: formData.expiry_date,
        }
      };

      const idempotencyKey = generateIdempotencyKey();
      
      const { data } = await apiClient.post(
        'http://127.0.0.1:5000/api/orders/checkout',
        payload,
        {
          headers: {
            'Idempotency-Key': idempotencyKey
          }
        }
      );

      if (data.success) {
        navigate(`/orders/${data.order_id}/confirmation`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="text-sm text-gray-500 mb-6">
            Home › Cart › <span className="text-black">Checkout</span>
          </div>

          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition-colors"
          >
            <ArrowLeft size={20} /> Back to Cart
          </button>

          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Shipping Address */}
                <div className="bg-white rounded-2xl shadow-sm border p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="text-gray-700" size={24} />
                    <h2 className="text-xl font-bold">Shipping Address</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="shipping_street"
                        value={formData.shipping_street}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="123 Main St"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="shipping_city"
                        value={formData.shipping_city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Anytown"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        name="shipping_state"
                        value={formData.shipping_state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="CA"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        name="shipping_postal_code"
                        value={formData.shipping_postal_code}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="12345"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country *
                      </label>
                      <input
                        type="text"
                        name="shipping_country"
                        value={formData.shipping_country}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="USA"
                      />
                    </div>
                  </div>
                </div>

                {/* Billing Address */}
                <div className="bg-white rounded-2xl shadow-sm border p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Package className="text-gray-700" size={24} />
                    <h2 className="text-xl font-bold">Billing Address</h2>
                  </div>
                  
                  <div className="mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="use_shipping_as_billing"
                        checked={formData.use_shipping_as_billing}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                      />
                      <span className="text-sm text-gray-700">Same as shipping address</span>
                    </label>
                  </div>

                  {!formData.use_shipping_as_billing && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          name="billing_street"
                          value={formData.billing_street}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="123 Main St"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          name="billing_city"
                          value={formData.billing_city}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="Anytown"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State *
                        </label>
                        <input
                          type="text"
                          name="billing_state"
                          value={formData.billing_state}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="CA"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          name="billing_postal_code"
                          value={formData.billing_postal_code}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="12345"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country *
                        </label>
                        <input
                          type="text"
                          name="billing_country"
                          value={formData.billing_country}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="USA"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Details */}
                <div className="bg-white rounded-2xl shadow-sm border p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="text-gray-700" size={24} />
                    <h2 className="text-xl font-bold">Payment Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Holder Name *
                      </label>
                      <input
                        type="text"
                        name="card_holder"
                        value={formData.card_holder}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        name="card_number"
                        value={formData.card_number}
                        onChange={handleInputChange}
                        required
                        maxLength="16"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="4111111111111111"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          name="expiry_date"
                          value={formData.expiry_date}
                          onChange={handleInputChange}
                          required
                          placeholder="MM/YY"
                          maxLength="5"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV *
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          required
                          maxLength="4"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="123"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                    <Lock size={16} />
                    <span>Your payment information is secure and encrypted</span>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-6">
                  <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                  
                  <div className="space-y-3 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                          {item.product.image_path ? (
                            <img 
                              src={item.product.image_path.startsWith('http') 
                                ? item.product.image_path 
                                : `http://127.0.0.1:5000/${item.product.image_path}`
                              } 
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.product.name}</p>
                          <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                          <p className="text-sm font-semibold">${item.product.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 space-y-2 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-medium">${calculateTotal()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="font-medium">Free</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-2xl font-bold">${calculateTotal()}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Complete Order'}
                  </button>
                  
                  <p className="text-xs text-gray-600 text-center mt-4">
                    By completing this order, you agree to our terms and conditions
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
