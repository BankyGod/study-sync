export function ReliabilityScore({ score = 0, size = 'md', showLabel = true }) {
  const normalized = Math.max(0, Math.min(100, score))
  const color =
    normalized >= 80 ? 'text-emerald-600' : normalized >= 50 ? 'text-amber-600' : 'text-red-600'
  const ring =
    normalized >= 80 ? 'border-emerald-200' : normalized >= 50 ? 'border-amber-200' : 'border-red-200'

  const dimensions = size === 'lg' ? 'h-20 w-20 text-lg' : 'h-14 w-14 text-sm'

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`flex items-center justify-center rounded-full border-4 bg-white font-bold ${dimensions} ${ring} ${color}`}
      >
        {normalized}%
      </div>
      {showLabel && <span className="text-xs font-medium text-slate-500">Reliability</span>}
    </div>
  )
}
