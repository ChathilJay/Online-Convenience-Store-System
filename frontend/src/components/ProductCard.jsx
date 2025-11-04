import React from 'react';
import apiClient from '../utils/apiInterceptor';

const ProductCard = ({ product }) => {

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add items to your cart.');
        return;
      }
      await apiClient.post('http://127.0.0.1:5000/api/cart/add', 
        { product_id: product.id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Product added to cart!');
    } catch (error) {
      alert('Failed to add product to cart.');
    }
  };

  return (
    <div className="group cursor-pointer">
      <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-3 aspect-[3/4]">
        {product.onSale && (
          <span className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 text-xs font-semibold rounded">
            SALE
          </span>
        )}
        {product.image_path ? (
          <img 
            src={product.image_path.startsWith('http') 
              ? product.image_path 
              : `http://127.0.0.1:5000/${product.image_path}`
            } 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
      </div>
      <h3 className="font-medium mb-1">{product.name}</h3>
      <div className="flex items-center gap-2">
        <span className="font-bold text-lg">${product.price}</span>
        {product.originalPrice && (
          <span className="text-gray-400 line-through text-sm">${product.originalPrice}</span>
        )}
      </div>
      <p className="text-gray-500 text-sm mb-2">{product.description}</p>
      <button 
        onClick={handleAddToCart}
        className="mt-2 bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg w-full transition-colors"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
