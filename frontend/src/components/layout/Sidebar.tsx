import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, TrendingUp, Activity, Shield,
  LogOut, Sun, Moon, Menu, X, ChevronRight, Zap
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

interface NavItem {
  to: string
  icon: React.ReactNode
  label: string
  adminOnly?: boolean
}

const NAV: NavItem[] = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/leads', icon: <Users size={18} />, label: 'Leads' },
  { to: '/deals', icon: <TrendingUp size={18} />, label: 'Deals' },
  { to: '/activities', icon: <Activity size={18} />, label: 'Activities' },
  { to: '/admin', icon: <Shield size={18} />, label: 'Admin', adminOnly: true },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const items = NAV.filter(n => !n.adminOnly || user?.role === 'admin')

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Zap size={16} className="text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-sm leading-tight">SalesCRM</div>
          <div className="text-xs" style={{ color: 'var(--sidebar-text)' }}>Revenue Platform</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <div className="text-xs font-700 px-2 py-2 uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.4)', letterSpacing: '0.1em' }}>
          Menu
        </div>
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
            onClick={() => setMobileOpen(false)}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t space-y-1" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {/* User */}
        <div className="px-3 py-2.5 rounded-lg mb-1" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="text-white text-sm font-semibold truncate">{user?.name}</div>
          <div className="text-xs capitalize" style={{ color: 'var(--sidebar-text)' }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 mb-0.5" />
            {user?.role}
          </div>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="sidebar-nav-item w-full"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="sidebar-nav-item w-full text-red-400 hover:text-red-300"
          style={{ color: '#f87171' }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="fixed top-3 left-3 z-50 lg:hidden p-2 rounded-lg"
        style={{ background: 'var(--sidebar-bg)', color: 'white' }}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="mobile-overlay lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`sidebar fixed inset-y-0 left-0 z-40 w-56 transition-transform duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="sidebar hidden lg:flex flex-col w-56 fixed inset-y-0 left-0 z-20">
        <SidebarContent />
      </aside>
    </>
  )
}
