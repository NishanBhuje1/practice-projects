import React from 'react';
import { useFadeIn } from './useFadeIn.js';

const tiers = [
  {
    name: 'Solo',
    price: 'Free',
    per: 'forever',
    description: 'Get started with the basics.',
    color: '#378ADD',
    features: [
      'Mine & Ours buckets',
      'Manual transaction entry',
      'Up to 3 shared goals',
      'Basic spending summary',
      '1 partner connection',
    ],
    cta: 'Start free',
    ctaLink: '#waitlist',
    outlined: true,
  },
  {
    name: 'Together',
    price: '$9',
    per: 'per couple / month',
    description: 'The full TwoWallet experience.',
    color: '#1D9E75',
    featured: true,
    features: [
      'All three buckets',
      'Bank account sync',
      'Unlimited goals',
      'Money Date mode',
      'Smart spending insights',
      'Nudge notifications',
      'Custom split ratios',
      'Priority support',
    ],
    cta: 'Get Together',
    ctaLink: '#waitlist',
  },
  {
    name: 'Family',
    price: '$15',
    per: 'per family / month',
    description: 'For households with more complexity.',
    color: '#BA7517',
    features: [
      'Everything in Together',
      'Up to 4 connected wallets',
      'Sub-accounts for kids',
      'Family goals & chores',
      'Allowance tracking',
      'Premium support',
    ],
    cta: 'Coming soon',
    ctaLink: '#waitlist',
    outlined: true,
    disabled: true,
  },
];

export default function Pricing() {
  const ref = useFadeIn();

  return (
    <section id="pricing" ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="fade-in text-[#1D9E75] font-semibold text-sm uppercase tracking-wider mb-3">
            Simple pricing
          </p>
          <h2 className="fade-in fade-in-delay-1 font-heading font-extrabold text-4xl sm:text-5xl text-gray-900 mb-4">
            One plan for most couples
          </h2>
          <p className="fade-in fade-in-delay-2 text-gray-500 text-lg max-w-xl mx-auto">
            Start free. Upgrade when you're ready. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {tiers.map((tier, i) => (
            <div
              key={tier.name}
              className={`fade-in fade-in-delay-${i + 1} relative rounded-2xl bg-white p-8 transition-all ${
                tier.featured
                  ? 'border-2 border-[#1D9E75] shadow-xl ring-4 ring-[#1D9E75]/10 md:-mt-4 md:pb-12'
                  : 'border border-gray-200 shadow-sm hover:shadow-md'
              }`}
            >
              {tier.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#1D9E75] text-white text-xs font-bold px-5 py-1.5 rounded-full whitespace-nowrap">
                  Most popular
                </div>
              )}

              <div className="mb-6">
                <h3
                  className="font-heading font-extrabold text-xl mb-1"
                  style={{ color: tier.color }}
                >
                  {tier.name}
                </h3>
                <p className="text-gray-500 text-sm">{tier.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-end gap-1">
                  <span className="font-heading font-extrabold text-4xl text-gray-900">{tier.price}</span>
                </div>
                <p className="text-gray-400 text-sm mt-1">{tier.per}</p>
              </div>

              <a
                href={tier.ctaLink}
                className={`block text-center font-semibold h-12 leading-[3rem] rounded-xl mb-8 text-sm transition-all ${
                  tier.disabled
                    ? 'bg-gray-100 text-gray-400 cursor-default'
                    : tier.featured
                    ? 'bg-[#1D9E75] text-white hover:bg-[#189060] hover:shadow-lg hover:shadow-[#1D9E75]/25'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {tier.cta}
              </a>

              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      style={{ color: tier.color }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="fade-in text-center text-sm text-gray-400 mt-10">
          All plans include 14-day free trial. No credit card required to start.
        </p>
      </div>
    </section>
  );
}
