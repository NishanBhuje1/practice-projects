import React from 'react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Simple top bar */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-heading font-bold text-xl text-[#1D9E75]">
            <span className="w-8 h-8 bg-[#1D9E75] rounded-xl flex items-center justify-center text-white text-sm font-bold">
              2W
            </span>
            TwoWallet
          </Link>
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <p className="text-sm text-[#1D9E75] font-semibold uppercase tracking-wider mb-3">Legal</p>
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-400 text-sm">Last updated: {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-12">
          {/* ── Paste your Terms of Service content here ── */}
          <div className="space-y-8 text-gray-600 leading-relaxed">

  <section>
    <h2 className="font-heading font-bold text-xl text-gray-900 mb-3">1. Acceptance of Terms</h2>
    <p className="text-sm leading-relaxed">
      By using TwoWallet you agree to these Terms of Service. If you do not agree, do not use the app. These terms are governed by the laws of New South Wales, Australia.
    </p>
  </section>

  <hr className="border-gray-100" />

  <section>
    <h2 className="font-heading font-bold text-xl text-gray-900 mb-3">2. Description of Service</h2>
    <p className="text-sm leading-relaxed">
      TwoWallet is a personal finance management app for couples provided by SoftServe Lab, Sydney, Australia. The app is intended for personal, non-commercial use only. TwoWallet is a financial management tool — we do not provide financial, legal, or tax advice. Always consult a qualified financial adviser for financial decisions.
    </p>
  </section>

  <hr className="border-gray-100" />

  <section>
    <h2 className="font-heading font-bold text-xl text-gray-900 mb-3">3. User Accounts</h2>
    <p className="text-sm leading-relaxed mb-3">
      You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials. You must be 18 or older to use TwoWallet.
    </p>
    <p className="text-sm leading-relaxed">
      Bank connections are provided via Basiq under Australia's Consumer Data Right framework. TwoWallet has read-only access to your transaction data. We cannot move money or make payments on your behalf.
    </p>
  </section>

  <hr className="border-gray-100" />

  <section>
    <h2 className="font-heading font-bold text-xl text-gray-900 mb-3">4. Acceptable Use</h2>
    <p className="text-sm leading-relaxed mb-3">You agree not to:</p>
    <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
      <li>Use the app for any unlawful purpose</li>
      <li>Attempt to reverse engineer or hack the app</li>
      <li>Share your account with anyone outside your household</li>
      <li>Use the app to process business or commercial transactions</li>
    </ul>
  </section>

  <hr className="border-gray-100" />

  <section>
    <h2 className="font-heading font-bold text-xl text-gray-900 mb-3">5. Payments &amp; Billing</h2>
    <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
      <li>Free tier is available with limited features</li>
      <li>Together plan: $12/month or $99/year (AUD)</li>
      <li>Together+ plan: $18/month or $149/year (AUD)</li>
      <li>One subscription covers both partners in a household</li>
      <li>30-day free trial available on first subscription</li>
      <li>Subscriptions auto-renew unless cancelled before the renewal date</li>
      <li>Refunds are handled in accordance with Apple App Store and Google Play Store policies</li>
      <li>Prices include GST where applicable</li>
    </ul>
  </section>

  <hr className="border-gray-100" />

  <section>
    <h2 className="font-heading font-bold text-xl text-gray-900 mb-3">6. Intellectual Property</h2>
    <p className="text-sm leading-relaxed">
      All content, design, and code in TwoWallet is owned by SoftServe Lab. You may not copy, reproduce, or redistribute any part of the app without written permission.
    </p>
  </section>

  <hr className="border-gray-100" />

  <section>
    <h2 className="font-heading font-bold text-xl text-gray-900 mb-3">7. Disclaimers &amp; Limitation of Liability</h2>
    <p className="text-sm leading-relaxed mb-3">
      TwoWallet is provided "as is" without warranty of any kind. We do not guarantee uninterrupted or error-free service.
    </p>
    <p className="text-sm leading-relaxed">
      To the maximum extent permitted by Australian law, SoftServe Lab is not liable for any indirect, incidental, or consequential damages arising from your use of TwoWallet. Our total liability is limited to the amount you paid for the service in the last 12 months.
    </p>
  </section>

  <hr className="border-gray-100" />

  <section>
    <h2 className="font-heading font-bold text-xl text-gray-900 mb-3">8. Termination</h2>
    <p className="text-sm leading-relaxed">
      We may suspend or terminate your account if you breach these terms. You may delete your account at any time from within the app. Upon deletion, all personal data is permanently removed within 30 days.
    </p>
  </section>

  <hr className="border-gray-100" />

  <section>
    <h2 className="font-heading font-bold text-xl text-gray-900 mb-3">9. Governing Law</h2>
    <p className="text-sm leading-relaxed">
      These terms are governed by the laws of New South Wales, Australia. Any disputes will be subject to the exclusive jurisdiction of the courts of New South Wales.
    </p>
  </section>

  <hr className="border-gray-100" />

  <section>
    <h2 className="font-heading font-bold text-xl text-gray-900 mb-3">10. Contact Us</h2>
    <p className="text-sm leading-relaxed">
      SoftServe Lab<br />
      Sydney, Australia<br />
      <a href="mailto:legal@softservelab.com" className="text-green-600 underline">
        legal@softservelab.com
      </a>
    </p>
    <p className="text-sm leading-relaxed mt-3 text-gray-400 italic">
      Last updated: April 1, 2026
    </p>
  </section>

</div>
        </div>

        {/* Footer note */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span>© {new Date().getFullYear()} TwoWallet · SoftServe Lab, Sydney</span>
          <Link to="/privacy" className="hover:text-gray-600 transition-colors">
            Privacy Policy →
          </Link>
        </div>
      </main>
    </div>
  );
}
