import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";
import AnimatedRoutes from "./components/router/AnimatedRoutes.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-softserve text-[rgb(var(--fg))]">
      <Navbar />
      <AnimatedRoutes />
      <Footer />
    </div>
  );
}
