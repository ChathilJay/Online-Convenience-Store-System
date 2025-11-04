import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import apiClient from '../utils/apiInterceptor';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState('');

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await apiClient.get('http://127.0.0.1:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(data.items);
    } catch (err) {
      setError('Failed to fetch cart items.');
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const handleCheckout = () => {
    navigate('/checkout');
  };
  
  const handleRemoveFromCart = async (itemId) => {
    try {
        const token = localStorage.getItem('token');
        await apiClient.post('http://127.0.0.1:5000/api/cart/remove', {
            item_id: itemId
        }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        fetchCartItems();
    } catch (error) {
        setError('Failed to remove item from cart.');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2);
  };

  return (
    <div className="min-h-screen flex flex-col">

      <div className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="text-sm text-gray-500 mb-6">
            Home › <span className="text-black">Shopping Cart</span>
          </div>

          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {cartItems.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
              <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some products to get started!</p>
              <a 
                href="/products"
                className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Continue Shopping <ArrowRight size={20} />
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl shadow-sm border p-6">
                    <div className="flex gap-6">
                      <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden shrink-0">
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
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-xl font-semibold mb-1">{item.product.name}</h3>
                            <p className="text-gray-600 text-sm">{item.product.description}</p>
                          </div>
                          <button 
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-2"
                            title="Remove from cart"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">Quantity:</span>
                            <span className="font-semibold">{item.quantity}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Price per item</p>
                            <p className="text-2xl font-bold">${item.product.price}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-6">
                  <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-medium">${calculateTotal()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="font-medium">Free</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-2xl font-bold">${calculateTotal()}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout <ArrowRight size={20} />
                  </button>

                  <a 
                    href="/products"
                    className="block text-center mt-4 text-sm text-gray-600 hover:text-black transition-colors"
                  >
                    Continue Shopping
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default CartPage;
