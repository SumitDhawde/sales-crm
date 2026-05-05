import React, { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Lead, AdminDashboardStats } from '../types'
import { Spinner, PageHeader, StatusBadge } from '../components/ui'
import { Shield, Users, TrendingUp, DollarSign, Target } from 'lucide-react'

interface AdminUser {
  id: string; name: string; email: string; role: string; createdAt: string
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [allLeads, setAllLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'users' | 'leads'>('overview')

  useEffect(() => {
    Promise.all([
      api.get<{ success: boolean; data: AdminDashboardStats }>('/admin/stats'),
      api.get<{ success: boolean; data: AdminUser[] }>('/admin/users'),
      api.get<{ success: boolean; data: Lead[] }>('/admin/leads'),
    ]).then(([s, u, l]) => {
      setStats(s.data!)
      setUsers(u.data ?? [])
      setAllLeads(l.data ?? [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const fmt = (n: number) => `$${n.toLocaleString()}`

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader
        title="Admin Panel"
        subtitle="System-wide overview and user management"
        action={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            <Shield size={14} />
            <span className="text-sm font-semibold">Admin Only</span>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-elevated)' }}>
        {(['overview', 'users', 'leads'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all"
            style={{
              background: tab === t ? 'var(--bg-surface)' : 'transparent',
              color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: tab === t ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: <Users size={18} style={{ color: '#3b82f6' }} />, accent: 'blue' },
              { label: 'Total Leads', value: stats.totalLeads, icon: <Target size={18} style={{ color: '#8b5cf6' }} />, accent: 'purple' },
              { label: 'Revenue Won', value: fmt(stats.totalRevenue), icon: <DollarSign size={18} style={{ color: '#10b981' }} />, accent: 'green' },
              { label: 'Pipeline', value: fmt(stats.pipeline), icon: <TrendingUp size={18} style={{ color: '#f59e0b' }} />, accent: 'amber' },
            ].map(s => (
              <div key={s.label} className={`card stat-card-accent stat-card-${s.accent} p-5`}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: 'var(--bg-elevated)' }}>
                  {s.icon}
                </div>
                <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
                <div className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Lead status breakdown */}
          <div className="card p-5">
            <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Lead Status Breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(stats.leadsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: 'var(--bg-elevated)' }}>
                  <StatusBadge status={status} />
                  <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deal stage breakdown */}
          <div className="card p-5">
            <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Deal Stage Breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(stats.dealsByStage).map(([stage, count]) => (
                <div key={stage} className="p-3 rounded-lg text-center"
                  style={{ background: 'var(--bg-elevated)' }}>
                  <div className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{count}</div>
                  <div className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{stage}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="card">
          {/* Mobile */}
          <div className="block sm:hidden divide-y" style={{ borderColor: 'var(--border-muted)' }}>
            {users.map(u => (
              <div key={u.id} className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{u.name}</div>
                  <span className={`badge ${u.role === 'admin' ? 'status-qualified' : 'status-new'}`}>{u.role}</span>
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</div>
              </div>
            ))}
          </div>
          {/* Desktop */}
          <div className="hidden sm:block table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Role</th><th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td><div className="font-medium" style={{ color: 'var(--text-primary)' }}>{u.name}</div></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'status-qualified' : 'status-new'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Leads */}
      {tab === 'leads' && (
        <div className="card">
          <div className="hidden sm:block table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Company</th><th>Email</th><th>Status</th><th>Source</th><th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {allLeads.map(lead => (
                  <tr key={lead.id}>
                    <td><div className="font-medium" style={{ color: 'var(--text-primary)' }}>{lead.name}</div></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{lead.company}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{lead.email}</td>
                    <td><StatusBadge status={lead.status} /></td>
                    <td style={{ color: 'var(--text-muted)' }}>{lead.source}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(lead.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="block sm:hidden divide-y" style={{ borderColor: 'var(--border-muted)' }}>
            {allLeads.map(lead => (
              <div key={lead.id} className="p-4">
                <div className="flex justify-between mb-1">
                  <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{lead.name}</div>
                  <StatusBadge status={lead.status} />
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{lead.company} · {lead.email}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
