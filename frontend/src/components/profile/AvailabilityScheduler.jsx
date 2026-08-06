import { MAX_AVAILABILITY_SLOTS } from '@/utils/onboarding'
import { AvailabilityLegend, AvailabilitySlotGrid } from '@/components/profile/AvailabilitySlotGrid'

export function AvailabilityScheduler({ value = [], onChange, readOnly = false }) {
  const selectedCount = value.length

  return (
    <section>
      <header className="mb-4">
        <h2 className="font-display text-lg font-semibold text-ink">Availability</h2>
        <p className="mt-1 text-sm text-muted">
          Choose up to {MAX_AVAILABILITY_SLOTS} slots when you can join study sessions.
        </p>
        <p className="mt-2 text-xs font-medium text-muted">
          {selectedCount} / {MAX_AVAILABILITY_SLOTS} slots selected
        </p>
      </header>

      <AvailabilitySlotGrid value={value} onChange={onChange} readOnly={readOnly} />
      <AvailabilityLegend />
    </section>
  )
}
