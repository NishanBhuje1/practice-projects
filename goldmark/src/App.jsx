import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useStore } from "./hooks/useStore";

// Components
import Header from "./components/Header";
import Hero from "./components/Hero";
import BestSellers from "./components/BestSellers";
import Categories from "./components/Categories";
import InstagramGallery from "./components/InstagramGallery";
import Footer from "./components/Footer";
import ShoppingCart from "./components/ShoppingCart";

// Pages
import ProductsPage from "./components/ProductsPage";
import ProductDetail from "./components/ProductDetail";
import OurStoryPage from "./components/OurStoryPage";
import ContactPage from "./components/ContactPage";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";

// Admin Components
import {
  AdminProvider,
  ProtectedAdminRoute,
  AdminHeader,
} from "./components/AdminAuth";
import AdminDashboard from "./components/AdminDashboard";

// Protected Route Component
const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { isAuthenticated, isLoading } = useStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const { isLoading, error, clearError, initializeStore, initializeAuth } =
    useStore();

  // Initialize store and auth safely
  useEffect(() => {
    const initialize = async () => {
      try {
        if (initializeAuth) {
          await initializeAuth();
        }
        if (initializeStore) {
          await initializeStore();
        }
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };

    initialize();
  }, [initializeAuth, initializeStore]);

  // Clear errors after 5 seconds
  useEffect(() => {
    if (error && clearError) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Goldmark...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminProvider>
      <div className="min-h-screen bg-white">
        <Toaster position="top-right" />

        {/* Global Error Display */}
        {error && (
          <div className="fixed top-4 right-4 z-50 bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-md">
            <div className="flex items-center justify-between">
              <span className="text-sm">{error}</span>
              <button
                onClick={clearError}
                className="ml-4 text-white hover:text-gray-200 text-lg font-bold"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <Routes>
          {/* Public Routes */}
          <Route path="/*" element={<PublicApp />} />

          {/* Admin Routes */}
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </div>
    </AdminProvider>
  );
}

function PublicApp() {
  return (
    <>
      <Header />

      <Routes>
        {/* Home Page */}
        <Route
          path="/"
          element={
            <>
              <Hero />
              <BestSellers />
              <Categories />
              <InstagramGallery />
            </>
          }
        />

        {/* Public Routes */}
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/our-story" element={<OurStoryPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Admin Redirect */}
        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />

        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
      <ShoppingCart />
    </>
  );
}

function AdminApp() {
  return (
    <ProtectedAdminRoute>
      <AdminHeader />
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
      </Routes>
    </ProtectedAdminRoute>
  );
}

export default App;
