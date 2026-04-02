import React, { useState } from 'react'
import { Link } from 'react-router-dom'

function SuccessState({ email }) {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-heading font-bold text-2xl text-gray-900 mb-3">
            Account deletion scheduled
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed max-w-md mx-auto">
            Your account has been scheduled for deletion. All data associated with{' '}
            <span className="font-medium text-gray-900">{email}</span> will be permanently removed within 30 days.
          </p>
          <Link
            to="/"
            className="inline-block mt-8 text-sm text-[#1D9E75] hover:underline"
          >
            Return to home
          </Link>
        </div>
      </main>
    </div>
  )
}

export default function DeleteAccount() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, reason }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Deletion failed')
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) return <SuccessState email={email} />

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
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
          <p className="text-sm text-red-600 font-semibold uppercase tracking-wider mb-3">
            Account
          </p>
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-gray-900 mb-4">
            Delete Account
          </h1>
          <p className="text-gray-500 text-sm">
            Permanently remove your TwoWallet account and all associated data.
          </p>
        </div>

        {/* Warning banner */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-8 flex items-start gap-4">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-red-800 text-sm mb-1">
              This action is permanent and cannot be undone
            </p>
            <p className="text-red-700 text-sm leading-relaxed">
              Deleting your account will permanently remove all your financial data, transaction history, partner connections, and account information. This cannot be reversed.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-12">
          <form onSubmit={handleDelete} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your account password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for leaving{' '}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <select
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white"
              >
                <option value="">Select a reason...</option>
                <option value="no_longer_need">No longer need it</option>
                <option value="privacy_concerns">Privacy concerns</option>
                <option value="switching">Switching to another app</option>
                <option value="technical_issues">Technical issues</option>
                <option value="other">Other</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-colors"
            >
              {loading ? 'Deleting account...' : 'Permanently delete my account'}
            </button>
          </form>
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
  )
}
