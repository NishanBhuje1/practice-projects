import React from 'react';
import { useFadeIn } from './useFadeIn.js';

const steps = [
  {
    number: '01',
    title: 'Review the week',
    body: 'See every transaction from the past 7 days, organised by bucket. No surprises.',
  },
  {
    number: '02',
    title: 'Celebrate wins',
    body: "Did you hit a savings milestone? Stay under budget? TwoWallet surfaces the good stuff.",
  },
  {
    number: '03',
    title: 'Plan together',
    body: 'Set intentions for the coming week — upcoming bills, savings contributions, and shared spending.',
  },
  {
    number: '04',
    title: 'Stay aligned',
    body: 'End each session with clarity and confidence. Money talks become conversations, not arguments.',
  },
];

export default function MoneyDate() {
  const ref = useFadeIn();

  return (
    <section
      id="money-date"
      ref={ref}
      className="py-24 px-4 sm:px-6 lg:px-8"
      style={{ background: 'linear-gradient(135deg, #0f2018 0%, #1a3a28 50%, #0f2018 100%)' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text side */}
          <div>
            <div className="fade-in inline-flex items-center gap-2 bg-white/10 text-[#6ee7b7] text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <span>💚</span>
              New feature
            </div>

            <h2 className="fade-in fade-in-delay-1 font-heading font-extrabold text-4xl sm:text-5xl text-white mb-6 leading-tight">
              Introducing
              <br />
              <span className="text-[#1D9E75]">Money Date</span>
            </h2>

            <p className="fade-in fade-in-delay-2 text-gray-300 text-lg leading-relaxed mb-10">
              A dedicated weekly ritual to review your finances together. Guided prompts, automatic summaries,
              and a simple flow that makes talking about money feel like a date — not a chore.
            </p>

            <a
              href="#waitlist"
              className="fade-in fade-in-delay-3 inline-flex items-center gap-2 bg-[#1D9E75] text-white font-semibold px-7 h-12 rounded-xl hover:bg-[#189060] transition-all hover:shadow-lg hover:shadow-[#1D9E75]/30"
            >
              Try Money Date
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          {/* Steps */}
          <div className="space-y-5">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className={`fade-in fade-in-delay-${i + 1} flex gap-5 bg-white/5 rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-colors`}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#1D9E75]/20 flex items-center justify-center">
                  <span className="font-heading font-bold text-sm text-[#1D9E75]">{step.number}</span>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white text-base mb-1">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
