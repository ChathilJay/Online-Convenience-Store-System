
import React, { useState, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import apiClient from '../utils/apiInterceptor';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import Sidebar from '../components/Sidebar';
import Pagination from '../components/Pagination';

// Main Product Page Component
const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState([]);
  const productsPerPage = 9;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = filters.category 
          ? `http://127.0.0.1:5000/api/products?category=${filters.category}`
          : 'http://127.0.0.1:5000/api/products';
        const { data } = await apiClient.get(url);
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }
    };
    fetchProducts();
  }, [filters.category]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  const removeFilter = (filterType) => {
    setFilters({ ...filters, [filterType]: null });
  };

  return (
    <div className="min-h-screen flex flex-col">
      
      <div className="container mx-auto px-4 py-6">
        <div className="text-sm text-gray-500 mb-6">
          Home › <span className="text-black">Browse Products</span>
        </div>

        <div className="flex">
          <Sidebar filters={filters} setFilters={setFilters} />
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl">
                Showing <span className="font-semibold">{currentProducts.length}</span> results from total <span className="font-semibold">{products.length}</span> for "tops"
              </h1>
              <div className="flex items-center gap-2">
                <span>Sort by</span>
                <button className="flex items-center gap-1 border px-4 py-2 rounded-lg">
                  Popularity <ChevronDown size={16} />
                </button>
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              <span className="text-gray-600">Applied Filters:</span>
              {filters.category && (
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {filters.category}
                  <X size={14} className="cursor-pointer" onClick={() => removeFilter('category')} />
                </span>
              )}
              {filters.priceRange && (
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {filters.priceRange}
                  <X size={14} className="cursor-pointer" onClick={() => removeFilter('priceRange')} />
                </span>
              )}
              {filters.size && (
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {filters.size}
                  <X size={14} className="cursor-pointer" onClick={() => removeFilter('size')} />
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-6">
              {currentProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProductPage;