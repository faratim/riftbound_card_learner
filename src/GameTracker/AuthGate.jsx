import { useState } from 'react'
import { useSession, sendMagicLink } from '../lib/auth'

export default function AuthGate({ children, onBack }) {
  const session = useSession()

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-gray-400">Loading…</div>
      </div>
    )
  }

  if (!session) return <MagicLinkForm onBack={onBack} />

  return children
}

function MagicLinkForm({ onBack }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!email) return
    setSubmitting(true)
    setErr(null)
    const { error } = await sendMagicLink(email)
    setSubmitting(false)
    if (error) setErr(error.message)
    else setSent(true)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col">
      {onBack && (
        <button
          onClick={onBack}
          className="self-start px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm mb-8"
        >
          ← Back
        </button>
      )}

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-center mb-2" style={{ color: '#e9c349' }}>
            Game Tracker
          </h1>
          <p className="text-gray-400 text-sm text-center mb-8">
            Sign in to save your games
          </p>

          {sent ? (
            <div className="bg-gray-800 border border-yellow-700/40 rounded-lg p-5 text-center">
              <p className="text-yellow-200 font-medium mb-1">Check your email</p>
              <p className="text-gray-400 text-sm">
                We sent a magic link to <span className="text-gray-200">{email}</span>.
                Click it to sign in.
              </p>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="mt-4 text-xs text-gray-500 hover:text-gray-300 underline"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-yellow-600"
                required
              />
              <button
                type="submit"
                disabled={submitting || !email}
                className="w-full py-3 rounded-lg font-medium disabled:opacity-50"
                style={{
                  background: 'linear-gradient(180deg, #e9c349 0%, #c69f2f 100%)',
                  color: '#1a1a1a',
                }}
              >
                {submitting ? 'Sending…' : 'Send magic link'}
              </button>
              {err && (
                <p className="text-red-400 text-sm text-center">{err}</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
