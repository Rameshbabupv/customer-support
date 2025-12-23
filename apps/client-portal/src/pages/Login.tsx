import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

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
    <div className="bg-background-light min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-white">
          <span className="material-symbols-outlined text-2xl">support_agent</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Support Desk</h2>
      </div>

      {/* Card */}
      <div className="bg-white py-10 px-6 shadow-card rounded-xl w-full max-w-[480px] sm:px-10 border border-slate-200">
        <div className="mb-8 text-center">
          <h1 className="text-[28px] font-bold text-slate-900 pb-2">Welcome back</h1>
          <p className="text-slate-500">Enter your credentials to access the portal.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Work Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <span className="material-symbols-outlined text-[20px]">mail</span>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="block w-full rounded-lg border-0 py-3 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary bg-slate-50 text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <a href="#" className="text-sm font-semibold text-primary hover:text-blue-500">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <span className="material-symbols-outlined text-[20px]">lock</span>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="block w-full rounded-lg border-0 py-3 pl-10 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary bg-slate-50 text-sm"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-lg bg-primary px-3 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <a href="#" className="font-semibold text-primary hover:text-blue-500">
            Contact Admin
          </a>
        </p>
      </div>

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-slate-400">
        © 2024 Support Desk Inc. All rights reserved.
      </p>
    </div>
  )
}
