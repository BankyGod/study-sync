export function StudySyncLogo({ className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="grid grid-cols-2 gap-0.5">
        <span className="h-2.5 w-2.5 rounded-sm bg-sky-500" />
        <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
        <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-sm bg-violet-600" />
      </div>
      <span className="text-lg font-bold tracking-tight text-slate-900">StudySync</span>
    </div>
  )
}
