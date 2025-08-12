import Header from "./components/Header";
import Hero from "./components/Hero";
import BestSellers from "./components/BestSellers";
import Categories from "./components/Categories";
import InstagramGallery from "./components/InstagramGallery";
import Footer from "./components/Footer";
import ShoppingCart from "./components/ShoppingCart";


function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <BestSellers />
      <Categories />
      <InstagramGallery />
      <Footer />
      <ShoppingCart />
      
    </div>
  );
}

export default App;
