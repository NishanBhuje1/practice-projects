import React, { createContext, useContext, useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Shield } from 'lucide-react';
import { authService, userService } from '../services/supabase';
import { useStore } from '../store/useStore';
import { authAPI } from '../services/apiService';

// Admin Context
const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const { user, isAuthenticated, setUser, setIsAuthenticated } = useStore();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if current user is admin
    if (isAuthenticated && user) {
      setIsAdminAuthenticated(user.isAdmin || false);
    } else {
      setIsAdminAuthenticated(false);
    }
    setLoading(false);
  }, [isAuthenticated, user]);

  return (
    <AdminContext.Provider
      value={{
        isAdminAuthenticated,
        setIsAdminAuthenticated,
        loading,
        user,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

// Admin Login Component
export const AdminLogin = () => {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useStore();
  const { setIsAdminAuthenticated } = useAdmin();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      // Sign in with Supabase
      const { user, error: signInError } = await authAPI.login({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        setError(signInError);
        setLoading(false);
        return;
      }

      if (user) {
        // Get user profile to check admin status

        // Check if user is admin
        if (!user?.isAdmin) {
          setError('Access denied. Admin privileges required.');
          await authService.signOut();
          setLoading(false);
          return;
        }

        // Set user in store
        const userData = {
          id: user.id,
          email: user.email,
          firstName: user?.first_name || '',
          lastName: user?.last_name || '',
          phone: user?.phone || '',
          isAdmin: true,
        };

        setUser(userData);
        setIsAuthenticated(true);
        setIsAdminAuthenticated(true);

        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Admin login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 bg-amber-600 rounded-full flex items-center justify-center">
            <Shield className="text-white text-2xl" size={24} />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Admin Access
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Sign in to the Goldmark admin dashboard
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center space-x-2">
              <AlertCircle size={16} className="text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-600 placeholder-gray-400 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                  placeholder="Enter admin email"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-600 placeholder-gray-400 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                  placeholder="Enter password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff
                      size={16}
                      className="text-gray-400 hover:text-gray-300"
                    />
                  ) : (
                    <Eye
                      size={16}
                      className="text-gray-400 hover:text-gray-300"
                    />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Access Admin Dashboard'
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              ← Back to main site
            </button>
          </div>
        </form>

        {/* Demo Admin Account Info */}
        <div className="bg-blue-900/50 border border-blue-700 rounded-md p-4 mt-6">
          <h4 className="text-blue-300 font-medium mb-2">
            Demo Admin Account:
          </h4>
          <p className="text-blue-200 text-sm">
            To create an admin account:
            <br />
            1. Register normally on the main site
            <br />
            2. Set{' '}
            <code className="bg-blue-800 px-1 rounded">is_admin = true</code> in
            Supabase
            <br />
            3. Login here with those credentials
          </p>
        </div>
      </div>
    </div>
  );
};

// Protected Admin Route Component
export const ProtectedAdminRoute = ({ children }) => {
  const { isAdminAuthenticated, loading } = useAdmin();
  const { isAuthenticated } = useStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdminAuthenticated) {
    return <AdminLogin />;
  }

  return children;
};

// Admin Header Component
export const AdminHeader = () => {
  const navigate = useNavigate();
  const { user, logout } = useStore();
  const { setIsAdminAuthenticated } = useAdmin();

  const handleLogout = async () => {
    await logout();
    setIsAdminAuthenticated(false);
    navigate('/');
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Shield className="text-amber-500 mr-3" size={24} />
            <h1 className="text-xl font-semibold text-white">
              Goldmark Admin Dashboard
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-gray-300 text-sm">
              Welcome, {user?.firstName || 'Admin'}
            </span>
            <button
              onClick={() => navigate('/')}
              className="text-gray-300 hover:text-white text-sm transition-colors"
            >
              View Site
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
