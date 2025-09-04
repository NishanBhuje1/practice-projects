import { useState, createContext, useContext, useEffect } from "react";
import { Shield, Eye, EyeOff } from "lucide-react";

// Admin Context
const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
};

// Admin Provider
export const AdminProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in (using localStorage for demo)
    const adminAuth = localStorage.getItem("goldmark_admin_auth");
    if (adminAuth === "authenticated") {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);


  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/admin/login`, {
        email: username,
        password,
      });

      localStorage.setItem("admin_token", response.data.token);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("Admin login error:", error);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("goldmark_admin_auth");
  };

  return (
    <AdminContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AdminContext.Provider>
  );
};

// Admin Login Component
export const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAdmin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const success = login(credentials.username, credentials.password);

    if (!success) {
      setError("Invalid credentials. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-amber-600 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-serif text-gray-900">
            Goldmark Admin
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to manage your jewelry store
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Demo Credentials Info */}
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm">
              <p className="font-medium mb-1">Demo Credentials:</p>
              <p>Email: admin@goldmark.com</p>
              <p>Password: goldmark123</p>
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="username"
                type="email"
                required
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                placeholder="admin@goldmark.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 disabled:bg-amber-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-top-transparent"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              ← Back to Store
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>&copy; 2025 Goldmark. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

// Protected Admin Route
export const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-600 border-top-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return children;
};

// Admin Header with Logout
export const AdminHeader = () => {
  const { logout } = useAdmin();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <a href="/" className="text-2xl font-serif text-gray-900">
              Goldmark
            </a>
            <span className="text-sm text-gray-500">Admin Panel</span>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="/"
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              View Store
            </a>
            <button
              onClick={handleLogout}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
