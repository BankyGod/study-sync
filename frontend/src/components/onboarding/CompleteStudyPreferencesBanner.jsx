import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { ROUTES } from '@/utils/constants'
import { cn } from '@/utils/cn'

export function CompleteStudyPreferencesBanner({
  returnTo = ROUTES.FIND_GROUPS,
  className,
  title = 'Complete study preferences',
  description = 'Finish learning style, availability, courses, and preferences before searching.',
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
      role="status"
    >
      <div className="flex min-w-0 gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface text-amber-800">
          <GraduationCap className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-ink">{title}</p>
          <p className="mt-0.5 text-[12px] leading-snug text-muted">{description}</p>
        </div>
      </div>
      <Button asChild size="sm" className="w-full shrink-0 sm:w-auto">
        <Link to={ROUTES.ONBOARDING} state={{ returnTo }}>
          Complete setup
        </Link>
      </Button>
    </div>
  )
}
