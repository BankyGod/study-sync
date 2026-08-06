import { MAX_AVAILABILITY_SLOTS } from '@/utils/onboarding'
import { AvailabilityLegend, AvailabilitySlotGrid } from '@/components/profile/AvailabilitySlotGrid'

export function AvailabilityStep({ value, onChange }) {
  const selectedCount = value.length

  return (
    <article>
      <header className="border-b border-border pb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          When are you available?
        </h1>
        <p className="mt-2 text-sm text-muted">
          Choose up to {MAX_AVAILABILITY_SLOTS} days and times that work for you.
        </p>
        <p className="mt-3 text-xs font-medium text-muted">
          {selectedCount} / {MAX_AVAILABILITY_SLOTS} slots selected
        </p>
      </header>

      <div className="mt-6">
        <AvailabilitySlotGrid value={value} onChange={onChange} />
      </div>

      <div className="mt-5">
        <AvailabilityLegend />
      </div>
    </article>
  )
}
