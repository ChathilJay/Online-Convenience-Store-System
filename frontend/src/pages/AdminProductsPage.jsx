import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiInterceptor';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    image: null
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Apply filter whenever products or statusFilter changes
    if (statusFilter === 'all') {
      setFilteredProducts(products);
    } else if (statusFilter === 'active') {
      setFilteredProducts(products.filter(p => p.is_active !== false));
    } else if (statusFilter === 'inactive') {
      setFilteredProducts(products.filter(p => p.is_active === false));
    }
  }, [products, statusFilter]);

  const fetchProducts = async () => {
    try {
      // Fetch all products including inactive ones
      const response = await apiClient.get('http://127.0.0.1:5000/api/products/?include_inactive=true');
      setProducts(Array.isArray(response.data) ? response.data : []);
      setError('');
    } catch (error) {
      setError('Failed to fetch products');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formPayload = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        formPayload.append(key, formData[key]);
      }
    });

    try {
      if (editingProduct) {
        await apiClient.put(`http://127.0.0.1:5000/api/products/${editingProduct.id}`, formPayload);
        setSuccess('Product updated successfully!');
      } else {
        await apiClient.post('http://127.0.0.1:5000/api/products/', formPayload);
        setSuccess('Product added successfully!');
      }
      fetchProducts();
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Operation failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('⚠️ PERMANENT DELETE - This will completely remove the product from the database. This action CANNOT be undone!\n\nAre you absolutely sure?')) {
      try {
        await apiClient.delete(`http://127.0.0.1:5000/api/products/${productId}/permanent`);
        setSuccess('Product permanently deleted');
        fetchProducts();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Failed to permanently delete product');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleActivate = async (productId) => {
    try {
      await apiClient.post(`http://127.0.0.1:5000/api/products/${productId}/activate`);
      setSuccess('Product activated successfully');
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to activate product');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeactivate = async (productId) => {
    if (window.confirm('Are you sure you want to deactivate this product?')) {
      try {
        await apiClient.post(`http://127.0.0.1:5000/api/products/${productId}/deactivate`);
        setSuccess('Product deactivated successfully');
        fetchProducts();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Failed to deactivate product');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category || '',
      image: null
    });
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', stock: '', category: '', image: null });
    setEditingProduct(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-sm text-gray-500 mb-2">
            Home › Admin › <span className="text-gray-900 font-medium">Product Management</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600 mt-2">Manage your product inventory, pricing, and availability</p>
        </div>
        
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-6 flex items-start animate-fade-in">
            <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
        
        {/* Success Alert */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-lg mb-6 flex items-start animate-fade-in">
            <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="font-medium">Success</p>
              <p className="text-sm">{success}</p>
            </div>
          </div>
        )}
        
        <div className="space-y-8">
          {/* Product Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    required 
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <input 
                    type="text" 
                    name="category" 
                    value={formData.category} 
                    onChange={handleInputChange}
                    placeholder="e.g., Electronics, Clothing"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($) *
                  </label>
                  <input 
                    type="number" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    required 
                    step="0.01" 
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input 
                    type="number" 
                    name="stock" 
                    value={formData.stock} 
                    onChange={handleInputChange}
                    placeholder="0"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    required 
                  />
                </div>

                {/* Description - Full Width */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange}
                    placeholder="Enter product description..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    rows="3" 
                  />
                </div>

                {/* Image Upload - Full Width */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image {!editingProduct && '*'}
                  </label>
                  <input 
                    type="file" 
                    name="image" 
                    onChange={handleImageChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" 
                    accept="image/*" 
                    {...(editingProduct ? {} : { required: true })} 
                  />
                  <p className="text-xs text-gray-500 mt-1">Accepted formats: JPG, PNG, GIF</p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
                {editingProduct && (
                  <button 
                    type="button" 
                    onClick={resetForm} 
                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Products List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Products List</h2>
                <p className="text-sm text-gray-600 mt-1">Total: {products.length} products</p>
              </div>
              
              {/* Filter Buttons */}
              <div className="flex gap-2">
                <button 
                  onClick={() => setStatusFilter('all')} 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === 'all' 
                      ? 'bg-gray-900 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All <span className="ml-1 font-bold">({products.length})</span>
                </button>
                <button 
                  onClick={() => setStatusFilter('active')} 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === 'active' 
                      ? 'bg-green-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Active <span className="ml-1 font-bold">({products.filter(p => p.is_active !== false).length})</span>
                </button>
                <button 
                  onClick={() => setStatusFilter('inactive')} 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === 'inactive' 
                      ? 'bg-red-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Inactive <span className="ml-1 font-bold">({products.filter(p => p.is_active === false).length})</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {product.image_path ? (
                            <img 
                              src={product.image_path} 
                              alt={product.name} 
                              className="w-14 h-14 object-cover rounded-lg shadow-sm border border-gray-200" 
                            />
                          ) : (
                            <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No image</span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.category || 'Uncategorized'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">${product.price.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${product.stock < 10 ? 'text-orange-600' : 'text-gray-900'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {product.is_active !== false ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(product)} 
                            className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Edit product"
                          >
                            Edit
                          </button>
                          {product.is_active !== false ? (
                            <button 
                              onClick={() => handleDeactivate(product.id)} 
                              className="px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                              title="Deactivate product"
                            >
                              Hide
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleActivate(product.id)} 
                              className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                              title="Activate product"
                            >
                              Show
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(product.id)} 
                            className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            title="Permanently delete product"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <p className="text-gray-500 font-medium">
                            {statusFilter === 'all' ? 'No products available' : `No ${statusFilter} products found`}
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            {statusFilter === 'all' ? 'Add your first product using the form above' : 'Try changing the filter'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductsPage;
