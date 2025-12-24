import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { useTheme } from '../hooks/useTheme'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const { theme } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Sign in failed')
      }

      setAuth(data.user, data.token)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: 'var(--background-light)' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg text-white" style={{ backgroundColor: 'var(--primary)' }}>
          <span className="material-symbols-outlined text-2xl">support_agent</span>
        </div>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Support Desk</h2>
      </div>

      {/* Card */}
      <div className="py-10 px-6 shadow-card rounded-xl w-full max-w-[480px] sm:px-10 border" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border-color)' }}>
        <div className="mb-8 text-center">
          <h1 className="text-[28px] font-bold pb-2" style={{ color: 'var(--text-primary)' }}>Welcome back</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Enter your credentials to access the portal.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error-text)' }}>
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Work Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'var(--text-tertiary)' }}>
                <span className="material-symbols-outlined text-[20px]">mail</span>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="block w-full rounded-lg border-0 py-3 pl-10 ring-1 ring-inset focus:ring-2 focus:ring-inset text-sm"
                style={{
                  backgroundColor: 'var(--input-background)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-color)',
                  '--tw-ring-color': 'var(--border-color)',
                  '--tw-ring-inset': 'inset'
                } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Password</label>
              <a href="#" className="text-sm font-semibold hover:opacity-80" style={{ color: 'var(--primary)' }}>
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'var(--text-tertiary)' }}>
                <span className="material-symbols-outlined text-[20px]">lock</span>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="block w-full rounded-lg border-0 py-3 pl-10 pr-10 ring-1 ring-inset focus:ring-2 focus:ring-inset text-sm"
                style={{
                  backgroundColor: 'var(--input-background)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-color)',
                  '--tw-ring-color': 'var(--border-color)',
                  '--tw-ring-inset': 'inset'
                } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-lg px-3 py-3 text-sm font-bold text-white shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50"
            style={{
              backgroundColor: 'var(--primary)',
              '--tw-ring-color': 'var(--primary)'
            } as React.CSSProperties}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <a href="#" className="font-semibold hover:opacity-80" style={{ color: 'var(--primary)' }}>
            Contact Admin
          </a>
        </p>
      </div>

      {/* Footer */}
      <p className="mt-8 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
        © 2024 Support Desk Inc. All rights reserved.
      </p>
    </div>
  )
}
