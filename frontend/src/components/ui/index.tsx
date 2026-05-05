import React from 'react'
import { Loader2 } from 'lucide-react'

/* ── Spinner ─────────────────────────────────────────────── */
export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 size={size} className="animate-spin" style={{ color: 'var(--color-primary-500)' }} />
    </div>
  )
}

/* ── Page header ──────────────────────────────────────────── */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6 pt-2 lg:pt-0">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0 mt-1">{action}</div>}
    </div>
  )
}

/* ── Empty state ──────────────────────────────────────────── */
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{message}</p>
    </div>
  )
}

/* ── Error message ────────────────────────────────────────── */
export function ErrorMsg({ message }: { message: string }) {
  return (
    <div className="rounded-lg px-4 py-3 text-sm mb-4"
      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
      {message}
    </div>
  )
}

/* ── Confirm dialog ───────────────────────────────────────── */
export function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-box max-w-sm animate-in">
        <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary">Cancel</button>
          <button onClick={onConfirm} className="btn-danger">Delete</button>
        </div>
      </div>
    </div>
  )
}

/* ── Badge ────────────────────────────────────────────────── */
export function StatusBadge({ status }: { status: string }) {
  const cls = `badge status-${status}`
  return <span className={cls}>{status}</span>
}

export function StageBadge({ stage }: { stage: string }) {
  const cls = `badge stage-${stage}`
  return <span className={cls}>{stage}</span>
}
