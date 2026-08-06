import { cn } from '@/utils/cn'

export function Card({ children, className, title, description, action }) {
  return (
    <section className={cn('border-b border-border pb-6', className)}>
      {(title || description || action) && (
        <header className="mb-4 flex items-start justify-between gap-5">
          <div>
            {title ? (
              <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
            ) : null}
            {description ? <p className="mt-1.5 text-sm text-muted">{description}</p> : null}
          </div>
          {action ? <div className="flex-shrink-0">{action}</div> : null}
        </header>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  )
}
