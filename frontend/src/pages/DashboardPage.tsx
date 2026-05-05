import React, { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { DashboardStats, AdminDashboardStats } from '../types'
import { useAuth } from '../context/AuthContext'
import { Spinner, PageHeader } from '../components/ui'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { TrendingUp, Users, DollarSign, Target, Activity } from 'lucide-react'

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']

function StatCard({
  label, value, sub, icon, accent,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  accent: string
}) {
  return (
    <div className={`card stat-card-accent stat-card-${accent} p-5 animate-in`}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--bg-elevated)' }}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{value}</div>
      <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</div>
      {sub && <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const endpoint = user?.role === 'admin' ? '/admin/stats' : '/leads'
    if (user?.role === 'admin') {
      api.get<{ success: boolean; data: AdminDashboardStats }>('/admin/stats')
        .then(r => setStats(r.data!))
        .catch(console.error)
        .finally(() => setLoading(false))
    } else {
      // Build approximate stats from lead/deal data for sales users
      Promise.all([
        api.get<{ success: boolean; data: unknown[]; pagination: { total: number } }>('/leads?limit=1'),
        api.get<{ success: boolean; data: unknown[]; pagination?: { total: number } }>('/deals?limit=100'),
      ]).then(([leadsRes, dealsRes]) => {
        const dealsData = (dealsRes.data ?? []) as Array<{ stage: string; value: number }>
        const totalRevenue = dealsData
          .filter(d => d.stage === 'won')
          .reduce((s, d) => s + d.value, 0)
        const pipeline = dealsData
          .filter(d => d.stage !== 'won' && d.stage !== 'lost')
          .reduce((s, d) => s + d.value, 0)
        setStats({
          totalLeads: leadsRes.pagination?.total ?? 0,
          totalDeals: dealsData.length,
          totalRevenue,
          pipeline,
          leadsByStatus: {} as DashboardStats['leadsByStatus'],
          dealsByStage: {} as DashboardStats['dealsByStage'],
        })
      }).catch(console.error).finally(() => setLoading(false))
    }
  }, [user])

  if (loading) return <Spinner />

  const leadStatusData = stats?.leadsByStatus
    ? Object.entries(stats.leadsByStatus).map(([name, value]) => ({ name, value }))
    : []

  const dealStageData = stats?.dealsByStage
    ? Object.entries(stats.dealsByStage).map(([name, value]) => ({ name, value }))
    : []

  const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]} 👋`}
        subtitle="Here's what's happening with your pipeline today"
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Leads"
          value={String(stats?.totalLeads ?? 0)}
          icon={<Users size={20} style={{ color: '#3b82f6' }} />}
          accent="blue"
        />
        <StatCard
          label="Total Deals"
          value={String(stats?.totalDeals ?? 0)}
          icon={<Target size={20} style={{ color: '#8b5cf6' }} />}
          accent="purple"
        />
        <StatCard
          label="Revenue Won"
          value={fmt(stats?.totalRevenue ?? 0)}
          icon={<DollarSign size={20} style={{ color: '#10b981' }} />}
          accent="green"
        />
        <StatCard
          label="Pipeline"
          value={fmt(stats?.pipeline ?? 0)}
          icon={<TrendingUp size={20} style={{ color: '#f59e0b' }} />}
          accent="amber"
        />
      </div>

      {/* Admin-only user count */}
      {user?.role === 'admin' && (stats as AdminDashboardStats)?.totalUsers && (
        <div className="card p-4 mb-6 flex items-center gap-3">
          <Activity size={18} style={{ color: '#3b82f6' }} />
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>
              {(stats as AdminDashboardStats).totalUsers}
            </strong> total users —{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {(stats as AdminDashboardStats).salesUsers}
            </strong> sales reps active
          </span>
        </div>
      )}

      {/* Charts */}
      {(leadStatusData.length > 0 || dealStageData.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leads by status */}
          {leadStatusData.length > 0 && (
            <div className="card p-5">
              <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Leads by Status
              </h2>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={leadStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {leadStatusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '0.5rem',
                      color: 'var(--text-primary)',
                      fontSize: '0.8125rem',
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Deals by stage */}
          {dealStageData.length > 0 && (
            <div className="card p-5">
              <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Deals by Stage
              </h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={dealStageData} barSize={36}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '0.5rem',
                      color: 'var(--text-primary)',
                      fontSize: '0.8125rem',
                    }}
                    cursor={{ fill: 'rgba(59,130,246,0.08)' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {dealStageData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
