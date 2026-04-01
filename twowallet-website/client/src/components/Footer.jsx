import React from 'react';

const links = {
  Product: ['Features', 'Pricing', 'Money Date', 'Security'],
  Company: ['About', 'Blog', 'Careers', 'Press'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <a href="#" className="flex items-center gap-2 font-heading font-bold text-xl text-[#1D9E75] mb-4">
              <span className="w-8 h-8 bg-[#1D9E75] rounded-xl flex items-center justify-center text-white text-sm font-bold">
                2W
              </span>
              TwoWallet
            </a>
            <p className="text-sm leading-relaxed mb-6">
              The smart way for couples to manage money together — independence and partnership, in balance.
            </p>
            {/* App store badges */}
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-3 bg-gray-800 hover:bg-gray-700 transition-colors rounded-xl px-4 py-2.5 cursor-pointer">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div>
                  <p className="text-gray-400 text-[10px] leading-none">Download on the</p>
                  <p className="text-white text-sm font-semibold leading-tight">App Store</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-3 bg-gray-800 hover:bg-gray-700 transition-colors rounded-xl px-4 py-2.5 cursor-pointer">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3.18 23.76c.3.17.65.19.98.06l12.76-6.7-2.81-2.81-10.93 9.45zM20.6 10.37l-2.94-1.55-3.14 3.14 3.14 3.14 2.97-1.57c.84-.45.84-1.71-.03-2.16zM1.98.54C1.7.87 1.54 1.36 1.54 1.97v20.06c0 .61.16 1.1.45 1.43l.08.07 11.23-11.23v-.27L2.06.47l-.08.07zM16.24 6.34L3.18.24c-.33-.13-.68-.11-.98.06l10.93 9.45 3.11-3.11v-.3z" />
                </svg>
                <div>
                  <p className="text-gray-400 text-[10px] leading-none">Get it on</p>
                  <p className="text-white text-sm font-semibold leading-tight">Google Play</p>
                </div>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-heading font-semibold text-white text-sm mb-5">{category}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} TwoWallet. All rights reserved.
          </p>
          <p className="text-sm text-gray-500">
            Made with{' '}
            <span className="text-[#1D9E75]">♥</span>
            {' '}by{' '}
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              SoftServe Lab
            </a>
            {' '}in Sydney
          </p>
        </div>
      </div>
    </footer>
  );
}
