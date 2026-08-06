import { cn } from '@/utils/cn'

const iconStyles = {
  blue: 'bg-brand-50 text-brand-600',
  green: 'bg-brand-50 text-brand-600',
  amber: 'bg-brand-50 text-brand-600',
}

export function QuickStatCard({ icon: Icon, value, label, accent = 'blue' }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', iconStyles[accent])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="mt-1 text-sm text-slate-500">{label}</p>
      </div>
    </div>
  )
}
