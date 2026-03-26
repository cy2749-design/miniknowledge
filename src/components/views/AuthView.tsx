import { useState } from 'react'
import { Loader2, BookOpen } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Props {
  onAuth: () => void
  t: (key: string) => string
}

type Mode = 'login' | 'signup'

export default function AuthView({ onAuth, t }: Props) {
  const [mode, setMode] = useState<Mode>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toEmail(u: string) {
    return u.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_') + '@mkuser.app'
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const u = username.trim()
    if (!u || u.length < 2) { setError(t('auth.username_short')); return }
    if (password.length < 6) { setError(t('auth.password_short')); return }
    if (!supabase) { onAuth(); return }
    setLoading(true)
    const email = toEmail(u)
    try {
      if (mode === 'signup') {
        const { error: err } = await supabase.auth.signUp({ email, password, options: { data: { username: u } } })
        if (err) throw err
        onAuth()
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) throw err
        onAuth()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg.includes('Invalid') ? t('auth.invalid') : msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
            <BookOpen size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm tracking-tight">MiniKnowledge</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            {mode === 'login' ? t('auth.login_title') : t('auth.signup_title')}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {mode === 'login' ? t('auth.login_sub') : t('auth.signup_sub')}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              autoComplete="username"
              placeholder={t('auth.username')}
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
            />
            <input
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              placeholder={t('auth.password')}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
            />

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl btn-primary disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {mode === 'login' ? t('auth.login_btn') : t('auth.signup_btn')}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError('') }}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
            >
              {mode === 'login' ? t('auth.no_account') : t('auth.has_account')}
            </button>
          </div>

          <div className="mt-4 border-t border-gray-100 pt-4">
            <button
              onClick={onAuth}
              className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              {t('auth.skip')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
