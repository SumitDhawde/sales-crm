import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '../types'
import { api } from '../lib/api'

interface AuthCtx {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('crm_token')
    if (!token) { setLoading(false); return }

    api.get<{ success: boolean; user: User }>('/auth/me')
      .then(r => setUser(r.user))
      .catch(() => localStorage.removeItem('crm_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const r = await api.post<{ success: boolean; token: string; user: User }>(
      '/auth/login',
      { email, password }
    )
    localStorage.setItem('crm_token', r.token)
    setUser(r.user)
  }

  const logout = () => {
    localStorage.removeItem('crm_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
