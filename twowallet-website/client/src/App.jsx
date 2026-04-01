import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Problem from './components/Problem.jsx';
import ThreeBuckets from './components/ThreeBuckets.jsx';
import Features from './components/Features.jsx';
import MoneyDate from './components/MoneyDate.jsx';
import Pricing from './components/Pricing.jsx';
import Waitlist from './components/Waitlist.jsx';
import Footer from './components/Footer.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import TermsOfService from './pages/TermsOfService.jsx';

function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <ThreeBuckets />
        <Features />
        <MoneyDate />
        <Pricing />
        <Waitlist />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
      </Routes>
    </BrowserRouter>
  );
}
