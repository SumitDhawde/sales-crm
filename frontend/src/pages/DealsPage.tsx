import React, { useEffect, useState, useCallback } from 'react'
import { api } from '../lib/api'
import { Deal, DealStage, Lead } from '../types'
import { Spinner, PageHeader, EmptyState, StageBadge, ConfirmDialog, ErrorMsg } from '../components/ui'
import { Plus, Pencil, Trash2, DollarSign } from 'lucide-react'

const STAGES: DealStage[] = ['prospect', 'negotiation', 'won', 'lost']

interface DealForm {
  leadId: string; title: string; value: number
  stage: DealStage; expectedCloseDate: string; notes: string
}

const DEFAULT_FORM: DealForm = {
  leadId: '', title: '', value: 0,
  stage: 'prospect', expectedCloseDate: '', notes: ''
}

function DealModal({
  initial, leads, onSave, onClose,
}: {
  initial?: Deal
  leads: Lead[]
  onSave: (data: DealForm) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState<DealForm>(
    initial
      ? { leadId: initial.leadId, title: initial.title, value: initial.value, stage: initial.stage, expectedCloseDate: initial.expectedCloseDate, notes: initial.notes }
      : DEFAULT_FORM
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof DealForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: k === 'value' ? Number(e.target.value) : e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try { await onSave(form); onClose() }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box animate-in">
        <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--text-primary)' }}>
          {initial ? 'Edit Deal' : 'New Deal'}
        </h2>
        {error && <ErrorMsg message={error} />}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label block mb-1">Lead</label>
            <select className="input-field" value={form.leadId} onChange={set('leadId')} required>
              <option value="">Select a lead…</option>
              {leads.map(l => <option key={l.id} value={l.id}>{l.name} — {l.company}</option>)}
            </select>
          </div>
          <div>
            <label className="label block mb-1">Deal Title</label>
            <input className="input-field" value={form.title} onChange={set('title')} placeholder="Enterprise License" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label block mb-1">Value ($)</label>
              <input type="number" min="0" className="input-field" value={form.value} onChange={set('value')} required />
            </div>
            <div>
              <label className="label block mb-1">Stage</label>
              <select className="input-field" value={form.stage} onChange={set('stage')}>
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label block mb-1">Expected Close Date</label>
            <input type="date" className="input-field" value={form.expectedCloseDate} onChange={set('expectedCloseDate')} required />
          </div>
          <div>
            <label className="label block mb-1">Notes</label>
            <textarea className="input-field" rows={3} value={form.notes} onChange={set('notes')} placeholder="Deal notes…" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Pipeline Kanban column
function KanbanColumn({ stage, deals, onEdit, onDelete }: {
  stage: DealStage
  deals: Deal[]
  onEdit: (d: Deal) => void
  onDelete: (d: Deal) => void
}) {
  const total = deals.reduce((s, d) => s + d.value, 0)
  const fmt = (n: number) => `$${n.toLocaleString()}`

  return (
    <div className="flex flex-col min-w-[240px] flex-1">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <StageBadge stage={stage} />
          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            {deals.length}
          </span>
        </div>
        <span className="text-xs font-mono font-bold" style={{ color: 'var(--text-secondary)' }}>
          {fmt(total)}
        </span>
      </div>
      <div className="space-y-2 flex-1">
        {deals.length === 0 && (
          <div className="rounded-lg p-4 text-center text-xs"
            style={{ border: '1px dashed var(--border-default)', color: 'var(--text-muted)' }}>
            No deals
          </div>
        )}
        {deals.map(deal => (
          <div key={deal.id} className="card p-3 hover:shadow-md transition-shadow">
            <div className="font-semibold text-sm mb-1 leading-tight" style={{ color: 'var(--text-primary)' }}>
              {deal.title}
            </div>
            <div className="flex items-center gap-1 mb-2">
              <DollarSign size={12} style={{ color: '#10b981' }} />
              <span className="text-sm font-bold" style={{ color: '#10b981' }}>
                {fmt(deal.value)}
              </span>
            </div>
            <div className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              Close: {new Date(deal.expectedCloseDate).toLocaleDateString()}
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => onEdit(deal)} className="btn-secondary py-1 px-2 text-xs flex-1 justify-center">
                <Pencil size={11} />
              </button>
              <button onClick={() => onDelete(deal)} className="btn-danger py-1 px-2 text-xs flex-1 justify-center">
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'create' | Deal | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Deal | null>(null)
  const [view, setView] = useState<'pipeline' | 'table'>('pipeline')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [dealsRes, leadsRes] = await Promise.all([
        api.get<{ success: boolean; data: Deal[] }>('/deals'),
        api.get<{ success: boolean; data: Lead[] }>('/leads?limit=100'),
      ])
      setDeals(dealsRes.data ?? [])
      setLeads(leadsRes.data ?? [])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async (form: DealForm) => { await api.post('/deals', form); await load() }
  const handleUpdate = async (id: string, form: DealForm) => { await api.put(`/deals/${id}`, form); await load() }
  const handleDelete = async () => {
    if (!deleteTarget) return
    await api.delete(`/deals/${deleteTarget.id}`)
    setDeleteTarget(null)
    await load()
  }

  const byStage = (stage: DealStage) => deals.filter(d => d.stage === stage)
  const fmt = (n: number) => `$${n.toLocaleString()}`

  return (
    <div>
      <PageHeader
        title="Deals"
        subtitle={`${deals.length} deals — ${fmt(deals.reduce((s, d) => s + d.value, 0))} total value`}
        action={
          <div className="flex gap-2">
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-default)' }}>
              {(['pipeline', 'table'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className="px-3 py-1.5 text-sm font-medium capitalize transition-all"
                  style={{
                    background: view === v ? 'var(--color-primary-600)' : 'var(--bg-surface)',
                    color: view === v ? 'white' : 'var(--text-secondary)',
                  }}>
                  {v}
                </button>
              ))}
            </div>
            <button className="btn-primary" onClick={() => setModal('create')}>
              <Plus size={16} /> New Deal
            </button>
          </div>
        }
      />

      {loading ? <Spinner /> : (
        <>
          {/* Pipeline view */}
          {view === 'pipeline' && (
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {STAGES.map(stage => (
                  <KanbanColumn
                    key={stage}
                    stage={stage}
                    deals={byStage(stage)}
                    onEdit={setModal}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Table view */}
          {view === 'table' && (
            <div className="card">
              {deals.length === 0 ? <EmptyState message="No deals yet. Create your first deal!" /> : (
                <>
                  {/* Mobile */}
                  <div className="block sm:hidden divide-y" style={{ borderColor: 'var(--border-muted)' }}>
                    {deals.map(deal => (
                      <div key={deal.id} className="p-4">
                        <div className="flex items-start justify-between mb-1">
                          <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{deal.title}</div>
                          <StageBadge stage={deal.stage} />
                        </div>
                        <div className="font-bold text-sm mb-2" style={{ color: '#10b981' }}>{fmt(deal.value)}</div>
                        <div className="flex gap-2">
                          <button onClick={() => setModal(deal)} className="btn-secondary text-xs py-1 px-2.5"><Pencil size={12} /></button>
                          <button onClick={() => setDeleteTarget(deal)} className="btn-danger text-xs py-1 px-2.5"><Trash2 size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop */}
                  <div className="hidden sm:block table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Title</th><th>Value</th><th>Stage</th>
                          <th>Close Date</th><th>Notes</th><th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {deals.map(deal => (
                          <tr key={deal.id}>
                            <td><div className="font-medium" style={{ color: 'var(--text-primary)' }}>{deal.title}</div></td>
                            <td><span className="font-bold" style={{ color: '#10b981', fontFamily: 'var(--font-mono)' }}>{fmt(deal.value)}</span></td>
                            <td><StageBadge stage={deal.stage} /></td>
                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                              {new Date(deal.expectedCloseDate).toLocaleDateString()}
                            </td>
                            <td style={{ color: 'var(--text-muted)', maxWidth: '200px' }}>
                              <div className="truncate text-sm">{deal.notes}</div>
                            </td>
                            <td>
                              <div className="flex gap-1.5">
                                <button onClick={() => setModal(deal)} className="btn-secondary py-1 px-2"><Pencil size={13} /></button>
                                <button onClick={() => setDeleteTarget(deal)} className="btn-danger py-1 px-2"><Trash2 size={13} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}

      {modal === 'create' && (
        <DealModal leads={leads} onSave={handleCreate} onClose={() => setModal(null)} />
      )}
      {modal && modal !== 'create' && (
        <DealModal
          initial={modal as Deal}
          leads={leads}
          onSave={form => handleUpdate((modal as Deal).id, form)}
          onClose={() => setModal(null)}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Deal"
          message={`Delete "${deleteTarget.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
