import React, { useEffect, useRef } from "react";

export default function Hero() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll(".fade-in");
    // Trigger immediately for hero
    requestAnimationFrame(() => {
      targets.forEach((t, i) => {
        setTimeout(() => t.classList.add("visible"), i * 120);
      });
    });
  }, []);

  return (
    <section
      ref={ref}
      className="relative flex items-center justify-center overflow-hidden pt-16"
      style={{
        background:
          "linear-gradient(160deg, #f0fdf8 0%, #F8F9FA 50%, #eff6ff 100%)",
      }}
    >
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #1D9E75 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, #378ADD 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
        {/* Text */}
        <div className="flex-1 text-center lg:text-left">
          <div className="fade-in inline-flex items-center gap-2 bg-white border border-[#1D9E75]/20 text-[#1D9E75] text-sm font-semibold px-4 py-2 rounded-full mb-6 shadow-sm">
            <span className="w-2 h-2 bg-[#1D9E75] rounded-full animate-pulse" />
            Now in early access
          </div>

          <h1 className="fade-in fade-in-delay-1 font-heading font-extrabold text-5xl sm:text-6xl lg:text-7xl text-gray-900 leading-[1.05] tracking-tight mb-6">
            Money for two, <span className="text-[#1D9E75]">done right.</span>
          </h1>

          <p className="fade-in fade-in-delay-2 text-lg sm:text-xl text-gray-500 leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0">
            TwoWallet gives couples a shared financial layer without giving up
            independence. Split expenses fairly, save toward goals together, and
            never argue about money again.
          </p>

          <div className="fade-in fade-in-delay-3 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <a
              href="#waitlist"
              className="inline-flex items-center justify-center gap-2 bg-[#1D9E75] text-white font-semibold px-8 h-12 rounded-xl hover:bg-[#189060] transition-all hover:shadow-lg hover:shadow-[#1D9E75]/25 hover:-translate-y-0.5"
            >
              Get Early Access
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
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
          <div className="relative w-64 h-[520px] bg-gray-900 rounded-[2.5rem] shadow-2xl p-1.5 ring-2 ring-gray-800">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-b-xl z-10" />
            <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-black">
              <img
                src="/assets/twowallet.webp"
                alt="App UI"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
