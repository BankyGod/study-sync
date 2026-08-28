import { cn } from '@/utils/cn'

export function AuthSelect({ label, error, className, id, children, size = 'default', ...props }) {
  const selectId = id || props.name
  const isLarge = size === 'lg'

  return (
    <div className="space-y-1.5">
      {label ? (
        <label
          htmlFor={selectId}
          className={cn(
            'block font-semibold text-soft',
            isLarge ? 'text-sm' : 'text-xs',
          )}
        >
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        className={cn(
          'w-full border border-border bg-surface text-ink outline-none transition',
          'focus:border-brand-600 focus:ring-2 focus:ring-brand-100',
          'hover:border-border-heavy',
          error && 'border-red-300 focus:border-red-500 focus:ring-red-100',
          isLarge ? 'h-11 rounded-xl px-3.5 text-sm' : 'h-9 rounded-md px-2.5 text-[13px]',
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

export function AuthSection({ title, children, size = 'default' }) {
  const isLarge = size === 'lg'

  return (
    <section
      className={cn(
        'border border-border bg-page/50',
        isLarge ? 'space-y-4 rounded-2xl p-4 sm:p-5' : 'space-y-3 rounded-lg p-3',
      )}
    >
      <h2
        className={cn(
          'font-semibold uppercase tracking-[0.14em] text-muted',
          isLarge ? 'text-xs' : 'text-[10px]',
        )}
      >
        {title}
      </h2>
      <div className={cn(isLarge ? 'space-y-4' : 'space-y-3')}>{children}</div>
    </section>
  )
}
