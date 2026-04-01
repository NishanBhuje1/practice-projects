import React from 'react';
import { useFadeIn } from './useFadeIn.js';

const buckets = [
  {
    name: 'Mine',
    color: '#378ADD',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    textColor: 'text-[#378ADD]',
    ring: 'ring-blue-200',
    icon: '👤',
    description: 'Your personal spending, completely private. Your morning coffee, gym membership, or online shopping stays yours.',
    examples: ['Personal subscriptions', 'Personal hobbies', 'Individual savings'],
  },
  {
    name: 'Ours',
    color: '#1D9E75',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    textColor: 'text-[#1D9E75]',
    ring: 'ring-emerald-200',
    icon: '💑',
    description: 'Everything shared — rent, groceries, utilities. Automatically split fairly based on your agreed contribution ratio.',
    examples: ['Rent & utilities', 'Shared groceries', 'Joint holidays'],
    featured: true,
  },
  {
    name: 'Theirs',
    color: '#BA7517',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    textColor: 'text-[#BA7517]',
    ring: 'ring-amber-200',
    icon: '🎁',
    description: "Money set aside for your partner — birthday gifts, surprises, or just treating them. They can't see this bucket.",
    examples: ['Anniversary gifts', 'Surprise treats', 'Special occasions'],
  },
];

export default function ThreeBuckets() {
  const ref = useFadeIn();

  return (
    <section id="buckets" ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="fade-in text-[#1D9E75] font-semibold text-sm uppercase tracking-wider mb-3">
            The TwoWallet system
          </p>
          <h2 className="fade-in fade-in-delay-1 font-heading font-extrabold text-4xl sm:text-5xl text-gray-900 mb-4">
            Three buckets.
            <br />
            Total clarity.
          </h2>
          <p className="fade-in fade-in-delay-2 text-gray-500 text-lg max-w-2xl mx-auto">
            Every transaction belongs to a bucket. No more confusion about what's shared, what's private, and what's for them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {buckets.map((bucket, i) => (
            <div
              key={bucket.name}
              className={`fade-in fade-in-delay-${i + 1} relative rounded-2xl border-2 p-8 bg-white shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 ${
                bucket.featured ? 'border-[#1D9E75] ring-4 ring-[#1D9E75]/10' : 'border-gray-100'
              }`}
            >
              {bucket.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1D9E75] text-white text-xs font-bold px-4 py-1 rounded-full">
                  Most used
                </div>
              )}

              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6"
                style={{ backgroundColor: `${bucket.color}15` }}
              >
                {bucket.icon}
              </div>

              <h3
                className="font-heading font-extrabold text-3xl mb-3"
                style={{ color: bucket.color }}
              >
                {bucket.name}
              </h3>

              <p className="text-gray-600 leading-relaxed mb-6 text-sm">{bucket.description}</p>

              <ul className="space-y-2">
                {bucket.examples.map((ex) => (
                  <li key={ex} className="flex items-center gap-2 text-sm text-gray-500">
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: bucket.color }}
                    />
                    {ex}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Flow diagram hint */}
        <div className="fade-in mt-12 flex items-center justify-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#378ADD]" />
            <span>Mine</span>
          </div>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#1D9E75]" />
            <span>Ours</span>
          </div>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#BA7517]" />
            <span>Theirs</span>
          </div>
          <span className="ml-2">— each transaction categorised in seconds</span>
        </div>
      </div>
    </section>
  );
}
