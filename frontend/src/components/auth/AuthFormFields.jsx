import { cn } from '@/utils/cn'

export function AuthSelect({ label, error, className, id, children, ...props }) {
  const selectId = id || props.name

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-semibold text-ink">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink outline-none transition',
          'focus:border-brand-400 focus:ring-[3px] focus:ring-brand-100',
          'hover:border-border-heavy',
          error && 'border-red-300 focus:border-red-400 focus:ring-red-100',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}

export function AuthSection({ title, children }) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-surface/80 p-5">
      <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}
