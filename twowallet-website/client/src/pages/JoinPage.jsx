import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function JoinPage() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');

  useEffect(() => {
    if (code) {
      // Try to open the app via deep link
      window.location.href = `twowallet://invite/${code}`;

      // Fallback after 2 seconds if app not installed
      setTimeout(() => {
        // Stay on this page showing download buttons
      }, 2000);
    }
  }, [code]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        {/* Logo */}
        <div className="w-20 h-20 bg-[#1D9E75] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-3xl font-bold">2W</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          You've been invited! 💰
        </h1>
        <p className="text-gray-500 mb-8">
          Your partner wants to manage money together on TwoWallet.
        </p>

        {/* If app is installed it will open automatically */}
        <p className="text-sm text-gray-400 mb-6">
          Opening TwoWallet app...
        </p>

        {/* Download buttons if app not installed */}
        <div className="space-y-3">
          <a
            href="https://play.google.com/store/apps/details?id=com.twowallet.twowallet"
            className="block w-full py-3 px-6 bg-[#1D9E75] text-white rounded-xl font-semibold text-center"
          >
            📱 Download on Android
          </a>
          <a
            href="https://apps.apple.com/app/twowallet/id6761992651"
            className="block w-full py-3 px-6 border-2 border-[#1D9E75] text-[#1D9E75] rounded-xl font-semibold text-center"
          >
            🍎 Download on iPhone
          </a>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Already have the app? It should open automatically.
        </p>

        <Link to="/" className="block mt-4 text-sm text-gray-400 hover:text-gray-600">
          Learn more about TwoWallet →
        </Link>
      </div>
    </div>
  );
}
