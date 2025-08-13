import Header from "./components/Header";
import Hero from "./components/Hero";
import BestSellers from "./components/BestSellers";
import Categories from "./components/Categories";
import InstagramGallery from "./components/InstagramGallery";
import Footer from "./components/Footer";
import ShoppingCart from "./components/ShoppingCart";
import { Routes, Route } from "react-router-dom";
import ProductsPage from "./components/ProductsPage";
import ProductDetail from "./components/ProductDetail";
import { Toaster } from "react-hot-toast";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { products } from "./data/products"; // adjust path if needed

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Toaster />

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
        <Route path="/" element={<Hero />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetail />} />
      </Routes>
      <Footer />
      <ShoppingCart />
    </div>
  );
}

export default App;
