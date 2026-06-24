import { useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const SLOTS = ['Morning', 'Afternoon', 'Evening', 'Night']

const initialSelected = new Set([
  'Monday-Morning',
  'Monday-Evening',
  'Tuesday-Evening',
  'Wednesday-Morning',
  'Wednesday-Evening',
  'Thursday-Morning',
  'Friday-Evening',
])

function slotKey(day, slot) {
  return `${day}-${slot}`
}

export function AvailabilityScheduler() {
  const [selected, setSelected] = useState(initialSelected)

  const toggleSlot = (day, slot) => {
    const key = slotKey(day, slot)
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <header className="mb-5">
        <h2 className="text-base font-bold text-slate-900">Availability Scheduler</h2>
        <p className="mt-1 text-sm text-slate-500">
          Click on the slots to select when you are available for study sessions.
        </p>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse">
          <thead>
            <tr>
              <th className="pb-3 pr-3 text-left text-xs font-medium text-slate-400" />
              {DAYS.map((day) => (
                <th key={day} className="pb-3 text-center text-xs font-semibold text-slate-700">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SLOTS.map((slot) => (
              <tr key={slot}>
                <td className="py-2 pr-3 text-xs font-medium text-slate-500">{slot}</td>
                {DAYS.map((day) => {
                  const key = slotKey(day, slot)
                  const isAvailable = selected.has(key)

                  return (
                    <td key={key} className="p-1">
                      <button
                        type="button"
                        onClick={() => toggleSlot(day, slot)}
                        aria-label={`${day} ${slot} ${isAvailable ? 'available' : 'unavailable'}`}
                        className={cn(
                          'flex h-11 w-full items-center justify-center rounded-lg border transition',
                          isAvailable
                            ? 'border-teal-500 bg-teal-500 text-white'
                            : 'border-slate-200 bg-white hover:border-slate-300',
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
