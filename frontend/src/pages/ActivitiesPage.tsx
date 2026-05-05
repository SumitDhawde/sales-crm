import React, { useEffect, useState, useCallback } from 'react'
import { api } from '../lib/api'
import { Activity, ActivityType, Lead } from '../types'
import { Spinner, PageHeader, EmptyState, ConfirmDialog, ErrorMsg } from '../components/ui'
import { Plus, Trash2, Phone, Users, FileText, BellRing, Calendar } from 'lucide-react'

const TYPES: ActivityType[] = ['call', 'meeting', 'note', 'follow-up']

const TYPE_ICONS: Record<ActivityType, React.ReactNode> = {
  call: <Phone size={14} />,
  meeting: <Users size={14} />,
  note: <FileText size={14} />,
  'follow-up': <BellRing size={14} />,
}

const TYPE_COLORS: Record<ActivityType, string> = {
  call: '#3b82f6',
  meeting: '#8b5cf6',
  note: '#f59e0b',
  'follow-up': '#10b981',
}

interface ActivityForm {
  leadId: string; type: ActivityType; title: string; description: string; date: string
}
const DEFAULT_FORM: ActivityForm = {
  leadId: '', type: 'call', title: '', description: '', date: new Date().toISOString().split('T')[0]
}

function ActivityModal({ leads, onSave, onClose }: {
  leads: Lead[]
  onSave: (f: ActivityForm) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState<ActivityForm>(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof ActivityForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try { await onSave(form); onClose() }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box animate-in">
        <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--text-primary)' }}>Log Activity</h2>
        {error && <ErrorMsg message={error} />}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label block mb-1">Lead</label>
            <select className="input-field" value={form.leadId} onChange={set('leadId')} required>
              <option value="">Select a lead…</option>
              {leads.map(l => <option key={l.id} value={l.id}>{l.name} — {l.company}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label block mb-1">Type</label>
              <select className="input-field" value={form.type} onChange={set('type')}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label block mb-1">Date</label>
              <input type="date" className="input-field" value={form.date} onChange={set('date')} required />
            </div>
          </div>
          <div>
            <label className="label block mb-1">Title</label>
            <input className="input-field" value={form.title} onChange={set('title')} placeholder="Discovery call with CEO" required />
          </div>
          <div>
            <label className="label block mb-1">Description</label>
            <textarea className="input-field" rows={3} value={form.description} onChange={set('description')} placeholder="What happened?" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Log Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Activity | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [actRes, leadsRes] = await Promise.all([
        api.get<{ success: boolean; data: Activity[] }>('/activities'),
        api.get<{ success: boolean; data: Lead[] }>('/leads?limit=100'),
      ])
      setActivities(actRes.data ?? [])
      setLeads(leadsRes.data ?? [])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async (form: ActivityForm) => { await api.post('/activities', form); await load() }
  const handleDelete = async () => {
    if (!deleteTarget) return
    await api.delete(`/activities/${deleteTarget.id}`)
    setDeleteTarget(null)
    await load()
  }

  const leadName = (id: string) => leads.find(l => l.id === id)?.name ?? 'Unknown'

  return (
    <div>
      <PageHeader
        title="Activities"
        subtitle={`${activities.length} logged activities`}
        action={
          <button className="btn-primary" onClick={() => setModal(true)}>
            <Plus size={16} /> Log Activity
          </button>
        }
      />

      {loading ? <Spinner /> : activities.length === 0 ? (
        <div className="card">
          <EmptyState message="No activities yet. Log your first one!" />
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map(act => (
            <div key={act.id} className="card p-4 flex gap-4 animate-in">
              {/* Icon */}
              <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: `${TYPE_COLORS[act.type]}20`, color: TYPE_COLORS[act.type] }}>
                {TYPE_ICONS[act.type]}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{act.title}</span>
                  <span className="badge text-xs px-2 py-0.5 rounded-full capitalize"
                    style={{ background: `${TYPE_COLORS[act.type]}20`, color: TYPE_COLORS[act.type] }}>
                    {act.type}
                  </span>
                </div>
                <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Lead: <span className="font-medium">{leadName(act.leadId)}</span>
                </div>
                {act.description && (
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{act.description}</p>
                )}
                <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <Calendar size={11} />
                  {new Date(act.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0">
                <button onClick={() => setDeleteTarget(act)} className="btn-danger py-1 px-2">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && <ActivityModal leads={leads} onSave={handleCreate} onClose={() => setModal(false)} />}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Activity"
          message={`Delete "${deleteTarget.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
