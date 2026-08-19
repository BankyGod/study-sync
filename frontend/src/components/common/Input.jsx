import { cn } from '@/utils/cn'

export function Input({ label, error, hint, className, id, ...props }) {
  const inputId = id || props.name

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-ink">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full rounded-xl border bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted/60 transition-all',
          'focus:border-brand-400 focus:outline-none focus:ring-[3px] focus:ring-brand-100',
          error
            ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
            : 'border-border hover:border-border-heavy',
          className,
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  )
}
