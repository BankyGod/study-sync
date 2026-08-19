import { cn } from '@/utils/cn'

export function PageShell({ children, className, narrow = false }) {
  return (
    <div className={cn(narrow ? 'page-shell-narrow' : 'page-shell', className)}>
      {children}
    </div>
  )
}

export function PageHeader({ eyebrow, title, description, actions, className }) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted">{eyebrow}</p>
        ) : null}
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-soft">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}

export function PageSection({ title, description, action, children, className }) {
  return (
    <section className={cn('space-y-4', className)}>
      {(title || description || action) && (
        <div className="flex items-center justify-between gap-3">
          <div>
            {title ? (
              <h2 className="text-base font-semibold text-ink">{title}</h2>
            ) : null}
            {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      )}
      {children}
    </section>
  )
}

export function SurfacePanel({ children, className }) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border bg-surface shadow-xs', className)}>
      {children}
    </div>
  )
}

export function StatTile({ label, value, icon, trend, className }) {
  return (
    <div className={cn('stat-tile', className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">{label}</p>
        {icon ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-display text-3xl font-bold tracking-tight text-ink">{value ?? '—'}</p>
      {trend ? <p className="mt-1 text-xs text-muted">{trend}</p> : null}
    </div>
  )
}
