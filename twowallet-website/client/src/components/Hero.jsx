import React, { useEffect, useRef } from 'react';

export default function Hero() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll('.fade-in');
    // Trigger immediately for hero
    requestAnimationFrame(() => {
      targets.forEach((t, i) => {
        setTimeout(() => t.classList.add('visible'), i * 120);
      });
    });
  }, []);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
      style={{
        background: 'linear-gradient(160deg, #f0fdf8 0%, #F8F9FA 50%, #eff6ff 100%)',
      }}
    >
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #1D9E75 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #378ADD 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* Text */}
        <div className="flex-1 text-center lg:text-left">
          <div className="fade-in inline-flex items-center gap-2 bg-white border border-[#1D9E75]/20 text-[#1D9E75] text-sm font-semibold px-4 py-2 rounded-full mb-6 shadow-sm">
            <span className="w-2 h-2 bg-[#1D9E75] rounded-full animate-pulse" />
            Now in early access
          </div>

          <h1 className="fade-in fade-in-delay-1 font-heading font-extrabold text-5xl sm:text-6xl lg:text-7xl text-gray-900 leading-[1.05] tracking-tight mb-6">
            Money for two,{' '}
            <span className="text-[#1D9E75]">done right.</span>
          </h1>

          <p className="fade-in fade-in-delay-2 text-lg sm:text-xl text-gray-500 leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0">
            TwoWallet gives couples a shared financial layer without giving up independence.
            Split expenses fairly, save toward goals together, and never argue about money again.
          </p>

          <div className="fade-in fade-in-delay-3 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <a
              href="#waitlist"
              className="inline-flex items-center justify-center gap-2 bg-[#1D9E75] text-white font-semibold px-8 h-12 rounded-xl hover:bg-[#189060] transition-all hover:shadow-lg hover:shadow-[#1D9E75]/25 hover:-translate-y-0.5"
            >
              Get Early Access
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="#buckets"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 font-semibold px-8 h-12 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              See how it works
            </a>
          </div>

          <p className="fade-in fade-in-delay-4 mt-6 text-sm text-gray-400">
            Free to try. No credit card required.
          </p>
        </div>

        {/* Phone mockup */}
        <div className="fade-in fade-in-delay-2 flex-shrink-0 relative">
          <div className="relative w-64 h-[520px] bg-gray-900 rounded-[3rem] shadow-2xl p-3 ring-4 ring-gray-800">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-2xl z-10" />
            {/* Screen */}
            <div
              className="w-full h-full rounded-[2.4rem] overflow-hidden flex flex-col"
              style={{ background: 'linear-gradient(180deg, #1a2e1a 0%, #0f1f15 100%)' }}
            >
              {/* Status bar */}
              <div className="px-6 pt-8 pb-4">
                <p className="text-xs text-gray-400 font-medium">Good morning</p>
                <p className="text-white font-heading font-bold text-lg">Sarah & James</p>
              </div>

              {/* Balance card */}
              <div className="mx-3 bg-[#1D9E75] rounded-2xl p-4 mb-3">
                <p className="text-[#a7f3d0] text-xs font-medium mb-1">Shared balance</p>
                <p className="text-white font-heading font-bold text-2xl">$3,240</p>
                <div className="flex gap-2 mt-3">
                  <div className="flex-1 bg-white/10 rounded-xl p-2">
                    <p className="text-[#a7f3d0] text-[10px]">Mine</p>
                    <p className="text-white text-sm font-bold">$1,100</p>
                  </div>
                  <div className="flex-1 bg-white/10 rounded-xl p-2">
                    <p className="text-[#a7f3d0] text-[10px]">Ours</p>
                    <p className="text-white text-sm font-bold">$1,580</p>
                  </div>
                  <div className="flex-1 bg-white/10 rounded-xl p-2">
                    <p className="text-[#a7f3d0] text-[10px]">Theirs</p>
                    <p className="text-white text-sm font-bold">$560</p>
                  </div>
                </div>
              </div>

              {/* Transactions */}
              <div className="mx-3 flex-1">
                <p className="text-gray-400 text-xs font-medium mb-2 px-1">Recent</p>
                {[
                  { icon: '🛒', label: 'Groceries', amount: '-$84', sub: 'Ours', color: '#1D9E75' },
                  { icon: '☕', label: 'Coffee', amount: '-$6', sub: 'Mine', color: '#378ADD' },
                  { icon: '🏠', label: 'Rent', amount: '-$1,200', sub: 'Ours', color: '#1D9E75' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 py-2.5 border-b border-white/5">
                    <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center text-base">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-xs font-medium">{item.label}</p>
                      <p className="text-[10px]" style={{ color: item.color }}>{item.sub}</p>
                    </div>
                    <p className="text-white text-xs font-semibold">{item.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating badge */}
          <div className="absolute -right-6 top-20 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1D9E75]/10 rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 text-[#1D9E75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Split handled</p>
              <p className="text-[11px] text-gray-400">James owes $42</p>
            </div>
          </div>

          <div className="absolute -left-8 bottom-28 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center text-base">🎯</div>
            <div>
              <p className="text-xs font-bold text-gray-800">Holiday fund</p>
              <p className="text-[11px] text-gray-400">68% of goal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <p className="text-xs text-gray-400 font-medium">Scroll to explore</p>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
