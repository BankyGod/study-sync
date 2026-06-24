import { Check } from 'lucide-react'
import {
  AVAILABILITY_DAYS,
  AVAILABILITY_TIMES,
  MAX_AVAILABILITY_SLOTS,
} from '@/utils/onboarding'
import { cn } from '@/utils/cn'

function slotKey(day, time) {
  return `${day}-${time}`
}

export function AvailabilityScheduler({ value = [], onChange, readOnly = false }) {
  const selected = new Set(value)

  const toggleSlot = (day, time) => {
    if (readOnly || !onChange) return

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
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <header className="mb-5">
        <h2 className="text-base font-bold text-slate-900">Availability Scheduler</h2>
        <p className="mt-1 text-sm text-slate-500">
          Choose up to {MAX_AVAILABILITY_SLOTS} slots when you are available for study sessions.
        </p>
        <p className="mt-2 text-xs font-medium text-slate-400">
          {selected.size} / {MAX_AVAILABILITY_SLOTS} slots selected
        </p>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse">
          <thead>
            <tr>
              <th className="pb-3 pr-3 text-left text-xs font-medium text-slate-400" />
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
                <td className="py-2 pr-3 text-xs font-medium text-slate-500">{time}</td>
                {AVAILABILITY_DAYS.map((day) => {
                  const key = slotKey(day, time)
                  const isAvailable = selected.has(key)
                  const isDisabled =
                    readOnly || (!isAvailable && selected.size >= MAX_AVAILABILITY_SLOTS)

                  return (
                    <td key={key} className="p-1">
                      <button
                        type="button"
                        onClick={() => toggleSlot(day, time)}
                        disabled={isDisabled}
                        aria-label={`${day} ${time} ${isAvailable ? 'available' : 'unavailable'}`}
                        className={cn(
                          'flex h-11 w-full items-center justify-center rounded-lg border transition',
                          isAvailable
                            ? 'border-teal-500 bg-teal-500 text-white'
                            : 'border-slate-200 bg-white hover:border-slate-300',
                          isDisabled && !isAvailable && 'cursor-not-allowed opacity-60',
                        )}
                      >
                        {isAvailable && <Check className="h-4 w-4" strokeWidth={3} />}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 rounded bg-teal-500" />
          Available
        </span>
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 rounded border border-slate-200 bg-white" />
          Unavailable
        </span>
      </div>
    </section>
  )
}
