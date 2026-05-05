import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Zap, Sun, Moon, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@crm.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = (preset: { email: string; password: string }) => {
    setEmail(preset.email)
    setPassword(preset.password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--bg-base)' }}>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggle}
        className="absolute top-4 right-4 p-2 rounded-lg transition-all"
        style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="w-full max-w-md animate-in">
        {/* Card */}
        <div className="card p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>SalesCRM</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Revenue Platform</div>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Welcome back</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Sign in to your account to continue</p>

          {error && (
            <div className="rounded-lg px-4 py-3 text-sm mb-4"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label block mb-1.5">Email</label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>
            <div>
              <label className="label block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-10"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="btn-primary w-full justify-center py-2.5 text-base"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Quick logins */}
          <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-default)' }}>
            <p className="text-xs mb-3 text-center" style={{ color: 'var(--text-muted)' }}>DEMO ACCOUNTS</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Admin', email: 'admin@crm.com', password: 'admin123' },
                { label: 'Sarah', email: 'sarah@crm.com', password: 'sales123' },
                { label: 'Mark', email: 'mark@crm.com', password: 'sales123' },
              ].map(p => (
                <button
                  key={p.label}
                  onClick={() => quickLogin(p)}
                  className="text-xs py-1.5 px-2 rounded-md font-medium transition-all"
                  style={{
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
