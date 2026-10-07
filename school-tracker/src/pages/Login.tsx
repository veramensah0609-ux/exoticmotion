import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMsg(null)
    setBusy(true)
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMsg('Account created. You can sign in now.')
        setMode('signin')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 bg-gradient-to-b from-indigo-600/10 to-transparent">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-indigo-600/30">
            S
          </div>
          <h1 className="text-2xl font-bold tracking-tight">School Tracker</h1>
          <p className="text-sm opacity-60 mt-1">Deadlines, grades, and study planning in one place.</p>
        </div>

        <form onSubmit={submit} className="space-y-3 bg-white/60 dark:bg-white/5 backdrop-blur rounded-2xl p-5 border border-black/5 dark:border-white/10">
          <div>
            <label className="text-xs font-medium opacity-60">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-black/30 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-xs font-medium opacity-60">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-black/30 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          {msg && <p className="text-xs text-emerald-500">{msg}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-indigo-600 text-white font-medium py-2.5 text-sm hover:bg-indigo-500 transition disabled:opacity-50"
          >
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          onClick={() => setMode((m) => (m === 'signin' ? 'signup' : 'signin'))}
          className="mt-4 w-full text-center text-xs opacity-60 hover:opacity-100"
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}
