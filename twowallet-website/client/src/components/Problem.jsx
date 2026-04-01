import React from 'react';
import { useFadeIn } from './useFadeIn.js';

const painPoints = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    emoji: '😬',
    title: '"Who paid for that?"',
    body: 'Endless Venmo requests, forgotten splits, and the awkward "you owe me" text. Managing shared expenses is exhausting.',
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-100',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    emoji: '😰',
    title: 'Zero financial privacy',
    body: 'Sharing one account means sharing everything — including that spontaneous purchase you\'d rather keep to yourself.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    emoji: '😤',
    title: 'Goals with no system',
    body: 'You both want to save for a house and a holiday — but without a plan, "savings" just means whatever\'s left over.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
];

export default function Problem() {
  const ref = useFadeIn();

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="fade-in text-[#1D9E75] font-semibold text-sm uppercase tracking-wider mb-3">
            Sound familiar?
          </p>
          <h2 className="fade-in fade-in-delay-1 font-heading font-extrabold text-4xl sm:text-5xl text-gray-900 mb-4">
            Couples deserve better
            <br />
            money tools
          </h2>
          <p className="fade-in fade-in-delay-2 text-gray-500 text-lg max-w-2xl mx-auto">
            Most finance apps are built for individuals. TwoWallet is built for two.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {painPoints.map((point, i) => (
            <div
              key={point.title}
              className={`fade-in fade-in-delay-${i + 1} rounded-2xl border p-7 ${point.bg} ${point.border} hover:shadow-md transition-shadow`}
            >
              <div className="text-4xl mb-4">{point.emoji}</div>
              <h3 className="font-heading font-bold text-xl text-gray-900 mb-3">{point.title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{point.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
