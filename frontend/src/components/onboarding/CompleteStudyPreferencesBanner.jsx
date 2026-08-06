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
        'flex flex-col gap-4 rounded-lg border border-ochre/30 bg-ochre-soft/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5',
        className,
      )}
      role="status"
    >
      <div className="flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-ochre">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
        </div>
      </div>
      <Link
        to={ROUTES.ONBOARDING}
        state={{ returnTo }}
        className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-surface transition hover:bg-brand-700 sm:w-auto"
      >
        Complete setup
      </Link>
    </div>
  )
}
