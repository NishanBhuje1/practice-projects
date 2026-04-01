import React from 'react';
import { useFadeIn } from './useFadeIn.js';

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Smart Fair Split',
    body: 'Set a contribution ratio (50/50, 60/40, or custom) and shared expenses are split automatically. No mental math needed.',
    color: '#1D9E75',
    bg: '#1D9E7515',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: 'Instant Bank Sync',
    body: 'Connect your bank accounts and transactions appear automatically — no manual entry, no forgotten expenses.',
    color: '#378ADD',
    bg: '#378ADD15',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Shared Goals',
    body: "Create savings goals together — holiday, house deposit, emergency fund. Watch the progress bar fill up side by side.",
    color: '#BA7517',
    bg: '#BA751715',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: 'Money Date Mode',
    body: "A guided weekly check-in for couples. Review spending, celebrate wins, and plan the week ahead — together.",
    color: '#1D9E75',
    bg: '#1D9E7515',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    title: 'Nudge Notifications',
    body: "Gentle reminders when a shared bill is due, when you're close to a budget, or when your partner logs an expense.",
    color: '#378ADD',
    bg: '#378ADD15',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Spending Insights',
    body: "Beautiful charts showing where your money goes — per bucket, per category, per person. Clarity at a glance.",
    color: '#BA7517',
    bg: '#BA751715',
  },
];

export default function Features() {
  const ref = useFadeIn();

  return (
    <section id="features" ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="fade-in text-[#1D9E75] font-semibold text-sm uppercase tracking-wider mb-3">
            Everything you need
          </p>
          <h2 className="fade-in fade-in-delay-1 font-heading font-extrabold text-4xl sm:text-5xl text-gray-900 mb-4">
            Built for modern couples
          </h2>
          <p className="fade-in fade-in-delay-2 text-gray-500 text-lg max-w-2xl mx-auto">
            Every feature designed around how couples actually think about and spend money.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`fade-in fade-in-delay-${(i % 3) + 1} group rounded-2xl bg-[#F8F9FA] border border-gray-100 p-6 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all`}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: feature.bg, color: feature.color }}
              >
                {feature.icon}
              </div>
              <h3 className="font-heading font-bold text-lg text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
