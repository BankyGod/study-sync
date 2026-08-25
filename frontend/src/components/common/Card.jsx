import { cn } from '@/utils/cn'

export function Card({
  children,
  className,
  title,
  description,
  action,
  variant = 'default',
}) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-lg border border-border bg-surface',
        variant === 'default' && 'shadow-xs',
        className,
      )}
    >
      {(title || description || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2.5">
          <div className="min-w-0">
            {title ? <h2 className="text-[13px] font-semibold text-ink">{title}</h2> : null}
            {description ? <p className="mt-0.5 text-[11px] text-muted">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      )}
      <div
        className={cn(
          'space-y-3',
          title || description || action ? 'px-3 py-3' : 'p-3',
        )}
      >
        {children}
      </div>
    </section>
  )
}
