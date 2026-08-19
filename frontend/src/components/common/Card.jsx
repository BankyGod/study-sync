import { cn } from '@/utils/cn'

export function Card({ children, className, title, description, action, variant = 'default' }) {
  const base =
    variant === 'flat'
      ? 'rounded-2xl border border-border bg-surface'
      : 'card'

  return (
    <section className={cn(base, className)}>
      {(title || description || action) && (
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
          <div className="min-w-0">
            {title ? (
              <h2 className="font-semibold text-ink">{title}</h2>
            ) : null}
            {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      )}
      <div className={cn('space-y-4', !title && !description && !action ? 'p-5 sm:p-6' : 'px-5 py-4 sm:px-6')}>
        {children}
      </div>
    </section>
  )
}
