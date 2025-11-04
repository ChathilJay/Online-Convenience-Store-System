import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(email, password);
      } else {
        result = await register(name, email, password);
      }

      if (result.success) {
        // Redirect to the page they were trying to access or to products page
        const from = location.state?.from?.pathname || '/products';
        navigate(from, { replace: true });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      
      <div className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="text-sm text-gray-500 mb-6">
            Home › <span className="text-black">{isLogin ? 'Login' : 'Register'}</span>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border p-8">
              <h1 className="text-3xl font-bold text-center mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-gray-600 text-center mb-8">
                {isLogin ? 'Sign in to access your account' : 'Join us and start shopping'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="name">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon size={20} className="absolute left-3 top-3 text-gray-400" />
                      <input
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        id="name"
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={20} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={20} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-gray-600 hover:text-black transition-colors"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                    }}
                  >
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    <span className="font-semibold underline">
                      {isLogin ? 'Sign up' : 'Sign in'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LoginPage;
