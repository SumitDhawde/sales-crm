import React, { useEffect, useState, useCallback } from 'react'
import { api } from '../lib/api'
import { Lead, LeadStatus, PaginationMeta } from '../types'
import { Spinner, PageHeader, EmptyState, StatusBadge, ConfirmDialog, ErrorMsg } from '../components/ui'
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Search, Phone, Mail, Building2 } from 'lucide-react'

const STATUSES: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal', 'converted', 'lost']
const SOURCES = ['LinkedIn', 'Cold Email', 'Referral', 'Website', 'Trade Show', 'Other']

interface LeadForm {
  name: string; email: string; phone: string; company: string
  status: LeadStatus; source: string; notes: string
}

const DEFAULT_FORM: LeadForm = {
  name: '', email: '', phone: '', company: '',
  status: 'new', source: 'Website', notes: ''
}

function LeadModal({
  initial, onSave, onClose,
}: {
  initial?: Lead
  onSave: (data: LeadForm) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState<LeadForm>(
    initial
      ? { name: initial.name, email: initial.email, phone: initial.phone, company: initial.company, status: initial.status, source: initial.source, notes: initial.notes }
      : DEFAULT_FORM
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof LeadForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError('')
    try { await onSave(form); onClose() }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box animate-in">
        <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--text-primary)' }}>
          {initial ? 'Edit Lead' : 'New Lead'}
        </h2>
        {error && <ErrorMsg message={error} />}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label block mb-1">Full Name</label>
              <input className="input-field" value={form.name} onChange={set('name')} placeholder="Jane Smith" required />
            </div>
            <div>
              <label className="label block mb-1">Company</label>
              <input className="input-field" value={form.company} onChange={set('company')} placeholder="Acme Corp" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label block mb-1">Email</label>
              <input type="email" className="input-field" value={form.email} onChange={set('email')} placeholder="jane@acme.com" required />
            </div>
            <div>
              <label className="label block mb-1">Phone</label>
              <input className="input-field" value={form.phone} onChange={set('phone')} placeholder="+1-555-0100" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label block mb-1">Status</label>
              <select className="input-field" value={form.status} onChange={set('status')}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label block mb-1">Source</label>
              <select className="input-field" value={form.source} onChange={set('source')}>
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label block mb-1">Notes</label>
            <textarea className="input-field" rows={3} value={form.notes} onChange={set('notes')} placeholder="Additional notes…" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'create' | Lead | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<{ success: boolean; data: Lead[]; pagination: PaginationMeta }>(
        `/leads?page=${page}&limit=10`
      )
      setLeads(res.data ?? [])
      setPagination(res.pagination ?? null)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { load() }, [load])

  const handleCreate = async (form: LeadForm) => {
    await api.post('/leads', form)
    await load()
  }

  const handleUpdate = async (id: string, form: LeadForm) => {
    await api.put(`/leads/${id}`, form)
    await load()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await api.delete(`/leads/${deleteTarget.id}`)
    setDeleteTarget(null)
    await load()
  }

  const filtered = search
    ? leads.filter(l =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase())
    )
    : leads

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle={`${pagination?.total ?? 0} total leads`}
        action={
          <button className="btn-primary" onClick={() => setModal('create')}>
            <Plus size={16} /> New Lead
          </button>
        }
      />

      {/* Search */}
      <div className="card mb-4 p-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            className="input-field pl-9"
            placeholder="Search leads by name, company or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? <Spinner /> : filtered.length === 0 ? (
          <EmptyState message="No leads found. Create your first lead!" />
        ) : (
          <>
            {/* Mobile cards */}
            <div className="block sm:hidden divide-y" style={{ borderColor: 'var(--border-muted)' }}>
              {filtered.map(lead => (
                <div key={lead.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{lead.name}</div>
                      <div className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        <Building2 size={11} /> {lead.company}
                      </div>
                    </div>
                    <StatusBadge status={lead.status} />
                  </div>
                  <div className="text-xs space-y-0.5 mb-3" style={{ color: 'var(--text-muted)' }}>
                    <div className="flex items-center gap-1"><Mail size={11} />{lead.email}</div>
                    <div className="flex items-center gap-1"><Phone size={11} />{lead.phone}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setModal(lead)} className="btn-secondary text-xs py-1 px-2.5"><Pencil size={12} /> Edit</button>
                    <button onClick={() => setDeleteTarget(lead)} className="btn-danger text-xs py-1 px-2.5"><Trash2 size={12} /> Delete</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Company</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Source</th>
                    <th>Updated</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(lead => (
                    <tr key={lead.id}>
                      <td>
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{lead.name}</div>
                      </td>
                      <td>
                        <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          <Building2 size={13} />{lead.company}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{lead.email}</td>
                      <td style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{lead.phone}</td>
                      <td><StatusBadge status={lead.status} /></td>
                      <td style={{ color: 'var(--text-muted)' }}>{lead.source}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {new Date(lead.updatedAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="flex gap-1.5">
                          <button onClick={() => setModal(lead)} className="btn-secondary py-1 px-2"><Pencil size={13} /></button>
                          <button onClick={() => setDeleteTarget(lead)} className="btn-danger py-1 px-2"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--border-default)' }}>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Page {pagination.page} of {pagination.pages}
                </span>
                <div className="flex gap-2">
                  <button
                    className="btn-secondary py-1 px-2.5"
                    onClick={() => setPage(p => p - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    className="btn-secondary py-1 px-2.5"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page === pagination.pages}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {modal === 'create' && (
        <LeadModal onSave={handleCreate} onClose={() => setModal(null)} />
      )}
      {modal && modal !== 'create' && (
        <LeadModal
          initial={modal as Lead}
          onSave={form => handleUpdate((modal as Lead).id, form)}
          onClose={() => setModal(null)}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Lead"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
