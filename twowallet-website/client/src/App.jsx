import React from 'react';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Problem from './components/Problem.jsx';
import ThreeBuckets from './components/ThreeBuckets.jsx';
import Features from './components/Features.jsx';
import MoneyDate from './components/MoneyDate.jsx';
import Pricing from './components/Pricing.jsx';
import Waitlist from './components/Waitlist.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
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
