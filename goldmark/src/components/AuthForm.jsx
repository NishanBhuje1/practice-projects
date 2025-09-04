import { useState } from "react";
import { X } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

// API Configuration
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://your-production-domain.com/api"
    : "http://localhost:5000/api";

const AuthForm = ({ isAuthOpen, toggleAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (!isLogin && (!formData.firstName || !formData.lastName)) {
      toast.error("Please enter your first and last name");
      return;
    }

    setIsLoading(true);

    try {
      let response;

      if (isLogin) {
        // Login request
        response = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: formData.email,
          password: formData.password,
        });
      } else {
        // Registration request
        response = await axios.post(`${API_BASE_URL}/auth/register`, {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || undefined,
        });
      }

      // Store token and user data
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Success message
      toast.success(isLogin ? "Login successful!" : "Registration successful!");

      // Close modal and reset form
      toggleAuth();
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        phone: "",
      });

      // Optional: Refresh page to update UI with user data
      window.location.reload();
    } catch (error) {
      console.error("Auth error:", error);

      // Handle different error types
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        (isLogin ? "Login failed" : "Registration failed");

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      phone: "",
    });
  };

  if (!isAuthOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 backdrop-blur-md bg-black/50 z-40"
        onClick={toggleAuth}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-lg transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {isLogin ? "Login" : "Create Account"}
            </h2>
            <button
              onClick={toggleAuth}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={isLoading}
            >
              <X size={20} />
            </button>
          </div>

          {/* Auth Form */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Name and Last Name (Registration only) */}
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required={!isLogin}
                    disabled={isLoading}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 disabled:bg-gray-100"
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required={!isLogin}
                    disabled={isLoading}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 disabled:bg-gray-100"
                  />
                </div>
              )}

              {/* Email */}
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 disabled:bg-gray-100"
              />

              {/* Phone (Registration only) */}
              {!isLogin && (
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number (Optional)"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 disabled:bg-gray-100"
                />
              )}

              {/* Password */}
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                disabled={isLoading}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 disabled:bg-gray-100"
              />

              {/* Confirm Password (Registration only) */}
              {!isLogin && (
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 disabled:bg-gray-100"
                />
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-colors duration-300 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-top-transparent"></div>
                    <span>
                      {isLogin ? "Signing in..." : "Creating account..."}
                    </span>
                  </div>
                ) : isLogin ? (
                  "Login"
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Toggle Login/Register */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  disabled={isLoading}
                  className="text-blue-500 hover:underline font-medium disabled:text-blue-300"
                >
                  {isLogin ? "Create one here" : "Sign in here"}
                </button>
              </p>
            </div>

            {/* Demo Info */}
            {isLogin && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <p className="font-medium mb-2">Demo Account:</p>
                <p>Email: admin@goldmark.com</p>
                <p>Password: goldmark123</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthForm;
