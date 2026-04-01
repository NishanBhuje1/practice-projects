import React, { useState } from 'react';
import { useFadeIn } from './useFadeIn.js';

export default function Waitlist() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error | duplicate
  const [message, setMessage] = useState('');

  const ref = useFadeIn();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.status === 409) {
        setStatus('duplicate');
        setMessage("You're already on the list. We'll be in touch!");
      } else if (data.success) {
        setStatus('success');
        setMessage(data.message || "You're on the list!");
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.message || 'Something went wrong. Try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Could not connect to server. Please try again later.');
    }
  };

  return (
    <section
      id="waitlist"
      ref={ref}
      className="py-24 px-4 sm:px-6 lg:px-8 bg-white"
    >
      <div className="max-w-2xl mx-auto text-center">
        <div className="fade-in inline-flex items-center justify-center w-16 h-16 bg-[#1D9E75]/10 rounded-2xl mb-6">
          <svg className="w-8 h-8 text-[#1D9E75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h2 className="fade-in fade-in-delay-1 font-heading font-extrabold text-4xl sm:text-5xl text-gray-900 mb-4">
          Be first in the door
        </h2>
        <p className="fade-in fade-in-delay-2 text-gray-500 text-lg mb-10">
          TwoWallet is in early access. Join the waitlist and we'll let you know
          the moment a spot opens up — plus early access pricing.
        </p>

        {status === 'success' || status === 'duplicate' ? (
          <div className="fade-in visible bg-[#1D9E75]/10 border border-[#1D9E75]/20 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1D9E75] rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-heading font-bold text-gray-900 text-lg">You're on the list!</p>
              <p className="text-gray-600 text-sm">{message}</p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="fade-in fade-in-delay-3 flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="flex-1 h-12 px-5 rounded-xl border border-gray-200 bg-[#F8F9FA] text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/40 focus:border-[#1D9E75] transition-all"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="h-12 px-7 bg-[#1D9E75] text-white font-semibold rounded-xl text-sm hover:bg-[#189060] transition-all hover:shadow-lg hover:shadow-[#1D9E75]/25 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {status === 'loading' ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Joining...
                </span>
              ) : (
                'Join Waitlist'
              )}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="mt-3 text-red-500 text-sm">{message}</p>
        )}

        <p className="fade-in mt-5 text-xs text-gray-400">
          No spam, ever. Unsubscribe at any time. By signing up you agree to our{' '}
          <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>.
        </p>

        {/* Social proof */}
        <div className="fade-in mt-10 flex items-center justify-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#1D9E75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Bank-grade security
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-300" />
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#1D9E75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Privacy first
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-300" />
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#1D9E75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Made for couples
          </div>
        </div>
      </div>
    </section>
  );
}
