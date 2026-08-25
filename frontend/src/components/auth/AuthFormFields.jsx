import { cn } from '@/utils/cn'

export function AuthSelect({ label, error, className, id, children, ...props }) {
  const selectId = id || props.name

  return (
    <div className="space-y-1">
      {label ? (
        <label htmlFor={selectId} className="block text-xs font-semibold text-soft">
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        className={cn(
          'h-9 w-full rounded-md border border-border bg-surface px-2.5 text-[13px] text-ink outline-none transition',
          'focus:border-brand-600 focus:ring-2 focus:ring-brand-100',
          'hover:border-border-heavy',
          error && 'border-red-300 focus:border-red-500 focus:ring-red-100',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="text-[11px] font-medium text-red-600">{error}</p> : null}
    </div>
  )
}

export function AuthSection({ title, children }) {
  return (
    <section className="space-y-3 rounded-lg border border-border bg-page/50 p-3">
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}
