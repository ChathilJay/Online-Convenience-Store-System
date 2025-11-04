import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiInterceptor';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await apiClient.get('http://127.0.0.1:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data.user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth initialization failed:', error);
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await apiClient.post('http://127.0.0.1:5000/api/auth/login', {
        email,
        password,
      });
      
      localStorage.setItem('token', data.access_token);
      setUser(data.user);
      setIsAuthenticated(true);
      
      return { success: true, user: data.user };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      return { success: false, error: errorMessage };
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await apiClient.post('http://127.0.0.1:5000/api/auth/register', {
        name,
        email,
        password,
      });
      
      localStorage.setItem('token', data.access_token);
      setUser(data.user);
      setIsAuthenticated(true);
      
      return { success: true, user: data.user };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  const updateUser = async (userData) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await apiClient.put(
        'http://127.0.0.1:5000/api/auth/profile',
        userData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Update failed';
      return { success: false, error: errorMessage };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await apiClient.put(
        'http://127.0.0.1:5000/api/auth/password',
        {
          current_password: currentPassword,
          new_password: newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      return { success: true, message: data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Password change failed';
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
