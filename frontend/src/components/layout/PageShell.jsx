import { cn } from '@/utils/cn'

export function PageShell({ children, className, narrow = false }) {
  return (
    <div className={cn('ss-shell', narrow && 'max-w-3xl', className)}>{children}</div>
  )
}

export function PageHeader({ eyebrow, title, description, actions, className }) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-3', className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-xl text-[13px] leading-snug text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-1.5">{actions}</div> : null}
    </div>
  )
}

export function PageSection({ title, description, action, children, className }) {
  return (
    <section className={cn('space-y-2.5', className)}>
      {(title || description || action) && (
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            {title ? <h2 className="text-[13px] font-semibold text-ink">{title}</h2> : null}
            {description ? <p className="text-[11px] text-muted">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      )}
      {children}
    </section>
  )
}

export function SurfacePanel({ children, className }) {
  return <div className={cn('ss-panel', className)}>{children}</div>
}

export function StatTile({ label, value, icon, trend, className }) {
  return (
    <div className={cn('dash-kpi', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
        {icon ? <span className="text-brand-700">{icon}</span> : null}
      </div>
      <p className="font-display text-2xl font-semibold tabular-nums tracking-tight text-ink">
        {value ?? '—'}
      </p>
      {trend ? <p className="text-[11px] text-muted">{trend}</p> : null}
    </div>
  )
}
