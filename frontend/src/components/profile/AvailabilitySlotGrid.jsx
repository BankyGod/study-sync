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
        size === 'sm' ? 'min-h-11 px-2 py-2.5 text-xs' : 'h-11 w-full text-sm',
        isAvailable
          ? 'border-brand-600 bg-brand-600 text-surface'
          : 'border-border bg-surface text-ink hover:border-brand-300',
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
      <div className="space-y-3 lg:hidden">
        {AVAILABILITY_DAYS.map((day) => (
          <div key={day} className="rounded-lg border border-border bg-surface p-3">
            <p className="mb-2.5 text-sm font-semibold text-ink">{day}</p>
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

      <div className="hidden lg:block">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="pb-3 pr-3 text-left text-xs font-medium text-muted" />
              {AVAILABILITY_DAYS.map((day) => (
                <th key={day} className="pb-3 text-center text-xs font-semibold text-ink">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AVAILABILITY_TIMES.map((time) => (
              <tr key={time}>
                <td className="py-2 pr-3 text-xs font-medium text-muted">{time}</td>
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
    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted">
      <span className="flex items-center gap-2">
        <span className="h-4 w-4 rounded bg-brand-600" />
        Available
      </span>
      <span className="flex items-center gap-2">
        <span className="h-4 w-4 rounded border border-border bg-surface" />
        Unavailable
      </span>
    </div>
  )
}
