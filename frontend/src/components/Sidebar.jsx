import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import apiClient from '../utils/apiInterceptor';

const Sidebar = ({ filters, setFilters }) => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await apiClient.get('http://127.0.0.1:5000/api/products/categories');
        setCategories(data.map(category => ({
          name: category,
          checked: filters.category === category
        })));
      } catch (err) {
        setError('Failed to load categories');
        console.error('Error:', err);
      }
    };

    fetchCategories();
  }, [filters.category]);

  return (
    <div className="w-64 pr-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4 cursor-pointer">
          <h3 className="font-semibold">Category</h3>
          <ChevronDown size={16} />
        </div>
        <div className="space-y-3">
          {categories.map((cat) => (
            <label key={cat.name} className="flex items-center justify-between cursor-pointer ml-4">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={cat.checked}
                  className="rounded"
                  onChange={() => {
                    setFilters(prev => ({
                      ...prev,
                      category: cat.checked ? null : cat.name
                    }));
                  }}
                />
                <span className="text-gray-700">{cat.name}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        {['Brands', 'Price', 'Size'].map((filter) => (
          <div key={filter} className="mb-4 flex items-center justify-between cursor-pointer py-2">
            <span className="font-medium">{filter}</span>
            <ChevronRight size={16} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
