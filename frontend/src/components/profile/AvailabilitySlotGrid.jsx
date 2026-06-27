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

function SlotButton({ day, time, isAvailable, isDisabled, onToggle, size = 'md' }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isDisabled}
      aria-label={`${day} ${time} ${isAvailable ? 'available' : 'unavailable'}`}
      aria-pressed={isAvailable}
      className={cn(
        'flex items-center justify-center rounded-lg border font-medium transition',
        size === 'sm' ? 'min-h-11 px-3 py-2.5 text-xs' : 'h-11 w-full text-sm',
        isAvailable
          ? 'border-teal-500 bg-teal-500 text-white'
          : 'border-slate-200 bg-white hover:border-slate-300',
        isDisabled && !isAvailable && 'cursor-not-allowed opacity-60',
      )}
    >
      {isAvailable ? <Check className="h-4 w-4" strokeWidth={3} /> : time}
    </button>
  )
}

export function AvailabilitySlotGrid({ value = [], onChange, readOnly = false }) {
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

  const getSlotState = (day, time) => {
    const isAvailable = selected.has(slotKey(day, time))
    const isDisabled = readOnly || (!isAvailable && selected.size >= MAX_AVAILABILITY_SLOTS)
    return { isAvailable, isDisabled }
  }

  return (
    <>
      {/* Mobile: one day at a time, full-width time chips — no horizontal scroll */}
      <div className="space-y-4 lg:hidden">
        {AVAILABILITY_DAYS.map((day) => (
          <div
            key={day}
            className="rounded-xl border border-slate-100 bg-slate-50/80 p-3"
          >
            <p className="mb-3 text-sm font-semibold text-slate-800">{day}</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {AVAILABILITY_TIMES.map((time) => {
                const { isAvailable, isDisabled } = getSlotState(day, time)
                return (
                  <SlotButton
                    key={slotKey(day, time)}
                    day={day}
                    time={time}
                    isAvailable={isAvailable}
                    isDisabled={isDisabled}
                    size="sm"
                    onToggle={() => toggleSlot(day, time)}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: compact week grid */}
      <div className="hidden lg:block">
        <table className="w-full border-collapse">
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
                  const { isAvailable, isDisabled } = getSlotState(day, time)
                  return (
                    <td key={slotKey(day, time)} className="p-1">
                      <SlotButton
                        day={day}
                        time={time}
                        isAvailable={isAvailable}
                        isDisabled={isDisabled}
                        onToggle={() => toggleSlot(day, time)}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function AvailabilityLegend() {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
      <span className="flex items-center gap-2">
        <span className="h-4 w-4 rounded bg-teal-500" />
        Available
      </span>
      <span className="flex items-center gap-2">
        <span className="h-4 w-4 rounded border border-slate-200 bg-white" />
        Unavailable
      </span>
    </div>
  )
}
