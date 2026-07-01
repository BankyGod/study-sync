import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { ROUTES } from '@/utils/constants'
import { cn } from '@/utils/cn'

export function CompleteStudyPreferencesBanner({
  returnTo = ROUTES.FIND_GROUPS,
  className,
  title = 'Complete your study preferences',
  description = 'You skipped setup during signup. Finish your learning style, availability, courses, and study preferences before searching for a pod.',
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 sm:px-5 sm:py-5',
        className,
      )}
      role="status"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-950">{title}</p>
            <p className="mt-1 text-sm leading-relaxed text-amber-900/80">{description}</p>
          </div>
        </div>
        <Link
          to={ROUTES.ONBOARDING}
          state={{ returnTo }}
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
        >
          Complete setup
        </Link>
      </div>
    </div>
  )
}
