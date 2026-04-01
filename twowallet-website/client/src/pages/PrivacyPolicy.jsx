import React from "react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Simple top bar */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-heading font-bold text-xl text-[#1D9E75]"
          >
            <span className="w-8 h-8 bg-[#1D9E75] rounded-xl flex items-center justify-center text-white text-sm font-bold">
              2W
            </span>
            TwoWallet
          </Link>
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
          >
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <p className="text-sm text-[#1D9E75] font-semibold uppercase tracking-wider mb-3">
            Legal
          </p>
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-sm">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-AU", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-12 prose prose-gray max-w-none">
          {/* ── Paste your Privacy Policy content here ── */}
          <div className="space-y-8 text-gray-600 leading-relaxed">
            <section>
              <h2 className="font-heading font-bold text-xl text-gray-900 mb-3">
                1. About Us
              </h2>
              <p className="text-sm leading-relaxed">
                TwoWallet is operated by SoftServe Lab, based in Sydney,
                Australia. We are committed to protecting your privacy in
                accordance with the Australian Privacy Act 1988 and the
                Australian Privacy Principles (APPs).
              </p>
            </section>

            <hr className="border-gray-100" />

            <section>
              <h2 className="font-heading font-bold text-xl text-gray-900 mb-3">
                2. Information We Collect
              </h2>
              <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
                <li>Name and email address</li>
                <li>Financial transaction data you enter or import</li>
                <li>
                  Bank account information via Basiq (read-only, via Consumer
                  Data Right)
                </li>
                <li>Device information and app usage analytics</li>
                <li>Subscription and payment information via RevenueCat</li>
              </ul>
            </section>

            <hr className="border-gray-100" />

            <section>
              <h2 className="font-heading font-bold text-xl text-gray-900 mb-3">
                3. How We Use Your Information
              </h2>
              <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
                <li>
                  To provide the TwoWallet service to you and your partner
                </li>
                <li>
                  To generate AI-powered Money Date insights via Anthropic
                  Claude API
                </li>
                <li>To process subscription payments via RevenueCat</li>
                <li>
                  To improve the app using anonymised analytics via PostHog
                </li>
                <li>To sync bank transactions via Basiq CDR</li>
              </ul>
            </section>

            <hr className="border-gray-100" />

            <section>
              <h2 className="font-heading font-bold text-xl text-gray-900 mb-3">
                4. Data Sharing &amp; Disclosure
              </h2>
              <p className="text-sm leading-relaxed mb-3">
                We share data with these third-party services only as necessary
                to provide the service:
              </p>
              <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
                <li>
                  <strong>Supabase</strong> — database and authentication,
                  hosted in Sydney, Australia
                </li>
                <li>
                  <strong>Anthropic</strong> — AI insights (transaction
                  summaries only, no identifying information)
                </li>
                <li>
                  <strong>Basiq</strong> — Australian bank connections via CDR
                </li>
                <li>
                  <strong>RevenueCat</strong> — subscription management
                </li>
                <li>
                  <strong>PostHog</strong> — anonymised usage analytics (no
                  financial data shared)
                </li>
              </ul>
              <p className="text-sm leading-relaxed mt-3 font-medium text-gray-900">
                We never sell your data to third parties.
              </p>
            </section>

            <hr className="border-gray-100" />

            <section>
              <h2 className="font-heading font-bold text-xl text-gray-900 mb-3">
                5. Data Retention
              </h2>
              <p className="text-sm leading-relaxed">
                Your data is stored on Supabase infrastructure in Sydney,
                Australia (ap-southeast-2 region). We apply Row Level Security
                to ensure only you and your partner can access your household
                data. We retain your data for as long as your account is active.
                When you delete your account, all personal data is permanently
                deleted within 30 days.
              </p>
            </section>

            <hr className="border-gray-100" />

            <section>
              <h2 className="font-heading font-bold text-xl text-gray-900 mb-3">
                6. Your Rights
              </h2>
              <p className="text-sm leading-relaxed mb-3">
                Under Australian Privacy Law you have the right to:
              </p>
              <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Opt out of analytics tracking</li>
              </ul>
              <p className="text-sm leading-relaxed mt-3">
                To exercise these rights contact us at{" "}
                <a
                  href="mailto:privacy@softservelab.com"
                  className="text-green-600 underline"
                >
                  privacy@softservelab.com
                </a>
              </p>
            </section>

            <hr className="border-gray-100" />

            <section>
              <h2 className="font-heading font-bold text-xl text-gray-900 mb-3">
                7. Security
              </h2>
              <p className="text-sm leading-relaxed">
                We use industry-standard encryption in transit (TLS) and at
                rest. Access to your data is protected by Row Level Security
                policies in our database. TwoWallet is not intended for users
                under 18 years of age.
              </p>
            </section>

            <hr className="border-gray-100" />

            <section>
              <h2 className="font-heading font-bold text-xl text-gray-900 mb-3">
                8. Contact Us
              </h2>
              <p className="text-sm leading-relaxed">
                SoftServe Lab
                <br />
                Sydney, Australia
                <br />
                <a
                  href="mailto:privacy@softservelab.com"
                  className="text-green-600 underline"
                >
                  privacy@softservelab.com
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
          <span>
            © {new Date().getFullYear()} TwoWallet · SoftServe Lab, Sydney
          </span>
          <Link to="/terms" className="hover:text-gray-600 transition-colors">
            Terms of Service →
          </Link>
        </div>
      </main>
    </div>
  );
}
