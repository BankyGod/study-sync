import { cn } from '@/utils/cn'

export function Input({ label, error, hint, className, id, ...props }) {
  const inputId = id || props.name

  return (
    <div className="space-y-1">
      {label ? (
        <label htmlFor={inputId} className="block text-xs font-semibold text-soft">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={cn(
          'h-9 w-full rounded-md border bg-surface px-2.5 text-[13px] text-ink placeholder:text-muted/70 transition',
          'focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100',
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
            : 'border-border hover:border-border-heavy',
          className,
        )}
        {...props}
      />
      {error ? (
        <p className="text-[11px] font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-muted">{hint}</p>
      ) : null}
    </div>
  )
}
