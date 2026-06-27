import { Clock } from 'lucide-react'
import { MAX_AVAILABILITY_SLOTS } from '@/utils/onboarding'
import { AvailabilityLegend, AvailabilitySlotGrid } from '@/components/profile/AvailabilitySlotGrid'

export function AvailabilityStep({ value, onChange }) {
  const selectedCount = value.length

  return (
    <article className="rounded-2xl border border-slate-200 bg-white px-4 py-8 shadow-sm sm:px-10 sm:py-10">
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
        {selectedCount} / {MAX_AVAILABILITY_SLOTS} slots selected
      </p>

      <div className="mt-6">
        <AvailabilitySlotGrid value={value} onChange={onChange} />
      </div>

      <div className="mt-5 flex justify-center">
        <AvailabilityLegend />
      </div>
    </article>
  )
}
