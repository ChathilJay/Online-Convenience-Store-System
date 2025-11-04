import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Search, ShoppingCart, User, X, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <div className="bg-black text-white text-center py-2 text-sm">
        <button className="absolute right-4 top-2">
          <X size={16} />
        </button>
      </div>
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">SWE3003</Link>
          <div className="flex items-center gap-8">
            <button className="flex items-center gap-1">
              Home <ChevronDown size={16} />
            </button>
            <Link to="/products" className="hover:text-gray-600">Products</Link>
            <a href="#" className="hover:text-gray-600">Contact Us</a>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-2.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search" 
                className="pl-10 pr-4 py-2 border rounded-lg w-64"
              />
            </div>
            <Link to="/cart" title="Shopping Cart">
              <ShoppingCart size={20} className="cursor-pointer" />
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/orders" title="My Orders">
                  <Package size={20} className="cursor-pointer" />
                </Link>
                <NotificationCenter />
              </>
            )}
            {isAuthenticated ? (
              <>
                <Link to="/profile" title={user?.name}>
                  <User size={20} className="cursor-pointer" />
                </Link>
                {user?.user_type === 'admin' && (
                  <Link to="/admin/products" className="text-blue-600 hover:text-blue-800 font-medium">
                    Admin Portal
                  </Link>
                )}
                <button onClick={handleLogout} className="hover:text-gray-600 text-sm cursor-pointer">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login">
                <User size={20} className="cursor-pointer" />
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
