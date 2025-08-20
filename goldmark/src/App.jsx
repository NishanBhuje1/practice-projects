// Updated App.jsx with admin routes
import Header from "./components/Header";
import Hero from "./components/Hero";
import BestSellers from "./components/BestSellers";
import Categories from "./components/Categories";
import InstagramGallery from "./components/InstagramGallery";
import Footer from "./components/Footer";
import ShoppingCart from "./components/ShoppingCart";
import { Routes, Route, Navigate } from "react-router-dom";
import ProductsPage from "./components/ProductsPage";
import ProductDetail from "./components/ProductDetail";
import { Toaster } from "react-hot-toast";
import OurStoryPage from "./components/OurStoryPage";

// Admin Components
import AdminDashboard from "./components/AdminDashboard";
import {
  AdminProvider,
  ProtectedAdminRoute,
  AdminHeader,
} from "./components/AdminAuth";

function App() {
  return (
    <AdminProvider>
      <div className="min-h-screen bg-white">
        <Toaster position="top-right" />

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

// Public App Component (Customer-facing)
function PublicApp() {
  return (
    <>
      <Header />

      <Routes>
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
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/our-story" element={<OurStoryPage />} />

        {/* Redirect admin access to proper admin route */}
        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />
      </Routes>

      <Footer />
      <ShoppingCart />
    </>
  );
}

// Admin App Component
function AdminApp() {
  return (
    <ProtectedAdminRoute>
      <AdminHeader />
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        {/* Add more admin routes as needed */}
      </Routes>
    </ProtectedAdminRoute>
  );
}

export default App;
