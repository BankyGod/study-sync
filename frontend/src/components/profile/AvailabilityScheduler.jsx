import { MAX_AVAILABILITY_SLOTS } from '@/utils/onboarding'
import { AvailabilityLegend, AvailabilitySlotGrid } from '@/components/profile/AvailabilitySlotGrid'

export function AvailabilityScheduler({ value = [], onChange, readOnly = false }) {
  const selectedCount = value.length

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
      <header className="mb-5">
        <h2 className="text-base font-bold text-slate-900">Availability Scheduler</h2>
        <p className="mt-1 text-sm text-slate-500">
          Choose up to {MAX_AVAILABILITY_SLOTS} slots when you are available for study sessions.
        </p>
        <p className="mt-2 text-xs font-medium text-slate-400">
          {selectedCount} / {MAX_AVAILABILITY_SLOTS} slots selected
        </p>
      </header>

      <AvailabilitySlotGrid value={value} onChange={onChange} readOnly={readOnly} />
      <AvailabilityLegend />
    </section>
  )
}
