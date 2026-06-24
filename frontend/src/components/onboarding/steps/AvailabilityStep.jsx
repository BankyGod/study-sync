import { Check, Clock } from 'lucide-react'
import { cn } from '@/utils/cn'
import {
  AVAILABILITY_DAYS,
  AVAILABILITY_TIMES,
  MAX_AVAILABILITY_SLOTS,
} from '@/utils/onboarding'

function slotKey(day, time) {
  return `${day}-${time}`
}

export function AvailabilityStep({ value, onChange }) {
  const selected = new Set(value)

  const toggleSlot = (day, time) => {
    const key = slotKey(day, time)
    const next = new Set(selected)

    if (next.has(key)) {
      next.delete(key)
    } else if (next.size < MAX_AVAILABILITY_SLOTS) {
      next.add(key)
    }

    onChange([...next])
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-teal-600">
        <Clock className="h-7 w-7" />
      </div>

      <h1 className="mt-6 text-center text-2xl font-bold text-slate-900 sm:text-3xl">
        When Are You Available?
      </h1>
      <p className="mx-auto mt-3 max-w-md text-center text-sm text-slate-500 sm:text-base">
        Choose up to {MAX_AVAILABILITY_SLOTS} days and times that work for you.
      </p>

      <p className="mt-4 text-center text-xs font-medium text-slate-400">
        {selected.size} / {MAX_AVAILABILITY_SLOTS} slots selected
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse">
          <thead>
            <tr>
              <th className="pb-3 pr-2 text-left text-xs font-medium text-slate-400" />
              {AVAILABILITY_DAYS.map((day) => (
                <th key={day} className="pb-3 text-center text-xs font-semibold text-slate-700">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AVAILABILITY_TIMES.map((time) => (
              <tr key={time}>
                <td className="py-1.5 pr-2 text-xs font-medium text-slate-500">{time}</td>
                {AVAILABILITY_DAYS.map((day) => {
                  const key = slotKey(day, time)
                  const isSelected = selected.has(key)
                  const isDisabled = !isSelected && selected.size >= MAX_AVAILABILITY_SLOTS

                  return (
                    <td key={key} className="p-1">
                      <button
                        type="button"
                        onClick={() => toggleSlot(day, time)}
                        disabled={isDisabled}
                        aria-label={`${day} ${time} ${isSelected ? 'available' : 'unavailable'}`}
                        className={cn(
                          'flex h-10 w-full items-center justify-center rounded-lg border transition sm:h-11',
                          isSelected && 'border-teal-500 bg-teal-500 text-white',
                          !isSelected &&
                            !isDisabled &&
                            'border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50/50',
                          isDisabled && 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-60',
                        )}
                      >
                        {isSelected && <Check className="h-4 w-4" strokeWidth={3} />}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex items-center justify-center gap-6 text-xs text-slate-500">
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 rounded bg-teal-500" />
          Available
        </span>
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 rounded border border-slate-200 bg-white" />
          Unavailable
        </span>
      </div>
    </article>
  )
}
