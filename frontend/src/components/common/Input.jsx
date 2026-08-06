import { cn } from '@/utils/cn'

export function Input({ label, error, className, id, ...props }) {
  const inputId = id || props.name

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          className={cn(
            'w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-red-400',
            className,
          )}
          {...props}
        />
        {error && (
          <p className="absolute bottom-0 left-0 right-0 -bottom-2 text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
