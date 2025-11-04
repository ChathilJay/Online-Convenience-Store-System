import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  FileText,
  BarChart3
} from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    {
      name: 'Products',
      path: '/admin/products',
      icon: Package
    },
    {
      name: 'Orders',
      path: '/admin/orders',
      icon: ShoppingCart
    },
    {
      name: 'Reports',
      path: '/admin/reports',
      icon: BarChart3
    }
  ];

  const isActive = (path, end = false) => {
    if (end) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-100 bg-white border-r border-gray-200 p-8 shadow" style={{ height: '70vh' }}>
      <div>
        <h2 className="text-2xl font-bold mb-8 text-gray-900">Admin Portal</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.end);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  active
                    ? 'bg-black text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
