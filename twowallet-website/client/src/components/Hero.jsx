import React, { useEffect, useRef } from "react";
import twowalletImg from "../assets/twowallet.webp";

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
            Now available on iOS &amp; Android
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
            {/* Android - Open Testing */}
            <a
              href="https://play.google.com/store/apps/details?id=com.twowallet.twowallet"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#1D9E75] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#158A65] transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                <path d="M3.18 23.76c.33.18.7.22 1.05.12l12.76-7.37-2.72-2.72-11.09 9.97zM.47 1.31C.17 1.67 0 2.19 0 2.87v18.26c0 .68.17 1.2.48 1.56l.08.08 10.23-10.23v-.24L.55 1.23l-.08.08zM20.13 10.4l-2.9-1.67-3.06 3.06 3.06 3.06 2.92-1.68c.83-.48.83-1.27-.02-1.77zM4.23.12L16.99 7.49l-2.72 2.72L4.23.12z"/>
              </svg>
              Download for Android
            </a>

            {/* iOS - App Store */}
            <a
              href="https://apps.apple.com/au/app/twowallet/id6761992651"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Download for iOS
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
                src={twowalletImg}
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
