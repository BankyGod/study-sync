import { forwardRef, useState } from 'react'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { cn } from '@/utils/cn'

export const AuthField = forwardRef(function AuthField(
  {
    label,
    error,
    className,
    id,
    type = 'text',
    leadingIcon,
    trailing,
    ...props
  },
  ref,
) {
  const inputId = id || props.name

  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={inputId} className="block text-[13px] font-semibold text-soft">
          {label}
        </label>
      ) : null}
      <div className="relative">
        {leadingIcon ? (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted">
            {leadingIcon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            'h-12 w-full rounded-xl border bg-white text-[15px] text-ink placeholder:text-muted/60 transition',
            'focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
              : 'border-[#d8dde3] hover:border-[#c5cbd3]',
            leadingIcon ? 'pl-11' : 'pl-3.5',
            trailing ? 'pr-11' : 'pr-3.5',
            className,
          )}
          {...props}
        />
        {trailing ? (
          <span className="absolute inset-y-0 right-2 flex items-center">{trailing}</span>
        ) : null}
      </div>
      {error ? <p className="text-[12px] font-medium text-red-600">{error}</p> : null}
    </div>
  )
})

export const AuthEmailField = forwardRef(function AuthEmailField(props, ref) {
  return (
    <AuthField
      ref={ref}
      type="email"
      leadingIcon={<Mail className="h-4 w-4" strokeWidth={1.75} />}
      {...props}
    />
  )
})

export const AuthPasswordField = forwardRef(function AuthPasswordField(
  { label = 'Password', ...props },
  ref,
) {
  const [visible, setVisible] = useState(false)

  return (
    <AuthField
      ref={ref}
      label={label}
      leadingIcon={<Lock className="h-4 w-4" strokeWidth={1.75} />}
      trailing={
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-page hover:text-ink"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <Eye className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>
      }
      {...props}
      type={visible ? 'text' : 'password'}
    />
  )
})
