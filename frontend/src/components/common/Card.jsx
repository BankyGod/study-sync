import { cn } from '@/utils/cn'

export function Card({ children, className, title, description, action }) {
  return (
    <section className={cn('rounded-xl border border-slate-200 bg-white p-5 shadow-sm', className)}>
      {(title || description || action) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}
