import { AnimatePresence, motion } from "framer-motion";
import { Routes, Route, useLocation } from "react-router-dom";

import Home from "../../pages/Home.jsx";
import About from "../../pages/About.jsx";
import Portfolio from "../../pages/Portfolio.jsx";
import Blog from "../../pages/Blog.jsx";
import Contact from "../../pages/Contact.jsx";
import Book from "../../pages/Book.jsx";
// import Admin from "../../pages/Admin.jsx";

function Page({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <Page>
              <Home />
            </Page>
          }
        />
        <Route
          path="/about"
          element={
            <Page>
              <About />
            </Page>
          }
        />
        <Route
          path="/portfolio"
          element={
            <Page>
              <Portfolio />
            </Page>
          }
        />
        <Route
          path="/blog"
          element={
            <Page>
              <Blog />
            </Page>
          }
        />
        <Route
          path="/contact"
          element={
            <Page>
              <Contact />
            </Page>
          }
        />
        <Route
          path="/book"
          element={
            <Page>
              <Book />
            </Page>
          }
        />
        {/* <Route
          path="/admin"
          element={
            <Page>
              <Admin />
            </Page>
          }
        /> */}
      </Routes>
    </AnimatePresence>
  );
}
