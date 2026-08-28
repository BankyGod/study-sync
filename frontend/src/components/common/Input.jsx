import { cn } from '@/utils/cn'

const inputSizes = {
  default: {
    field: 'h-9 rounded-md px-2.5 text-[13px]',
    label: 'text-xs',
  },
  lg: {
    field: 'h-11 rounded-xl px-3.5 text-sm',
    label: 'text-sm',
  },
}

export function Input({ label, error, hint, className, id, size = 'default', ...props }) {
  const inputId = id || props.name
  const sizeStyles = inputSizes[size] ?? inputSizes.default

  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={inputId} className={cn('block font-semibold text-soft', sizeStyles.label)}>
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={cn(
          'w-full border bg-surface text-ink placeholder:text-muted/70 transition',
          'focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100',
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
            : 'border-border hover:border-border-heavy',
          sizeStyles.field,
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
