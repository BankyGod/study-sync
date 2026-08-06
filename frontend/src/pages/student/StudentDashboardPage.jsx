import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Users } from 'lucide-react'
import { PodCard } from '@/components/dashboard/PodCard'
import { UpcomingDeadlines } from '@/components/dashboard/UpcomingDeadlines'
import { CompleteStudyPreferencesBanner } from '@/components/onboarding/CompleteStudyPreferencesBanner'
import { Spinner } from '@/components/common/Spinner'
import { useAuth } from '@/hooks/useAuth'
import { fetchUserGroups, getUserGroupsErrorMessage } from '@/services/usersService'
import { fetchMyReliability } from '@/services/reliabilityService'
import {
  isOnboardingProfileSaved,
  loadOnboardingProfile,
} from '@/services/onboardingProfileService'
import { ROUTES } from '@/utils/constants'
import { buildWorkspacePath } from '@/utils/workspace'
import { cn } from '@/utils/cn'

export function StudentDashboardPage() {
  const { user } = useAuth()
  const [groups, setGroups] = useState([])
  const [reliability, setReliability] = useState(null)
  const [hasSavedProfile, setHasSavedProfile] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const firstName = useMemo(() => user?.name?.split(' ')[0] ?? 'there', [user?.name])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError('')
      try {
        const [nextGroups, reliabilityData, onboardingProfile] = await Promise.all([
          fetchUserGroups(),
          fetchMyReliability().catch(() => null),
          loadOnboardingProfile().catch(() => null),
        ])
        if (!cancelled) {
          setGroups(nextGroups)
          setReliability(reliabilityData)
          setHasSavedProfile(isOnboardingProfileSaved(onboardingProfile))
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(getUserGroupsErrorMessage(loadError))
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  const reliabilityText =
    reliability?.score != null
      ? `${reliability.score}% · ${reliability.label || 'Reliability'}`
      : `Reliability building · ${reliability?.tasksScored ?? 0}/3 tasks`

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {!hasSavedProfile ? (
        <CompleteStudyPreferencesBanner
          returnTo={ROUTES.FIND_GROUPS}
          className="mb-8"
          description="Finish learning style, availability, courses, and preferences before searching for a pod."
        />
      ) : null}

      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div className="min-w-0 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Dashboard</p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl lg:text-4xl">
            Hello, {firstName}
          </h1>
          <p className="mt-2 text-sm text-muted sm:text-base">
            {groups.length > 0
              ? `${groups.length} active study pod${groups.length === 1 ? '' : 's'} ready when you are.`
              : 'Find classmates in your courses and start a study pod.'}
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <p className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-muted">
            {reliabilityText}
          </p>
          <Link
            to={ROUTES.FIND_GROUPS}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-surface transition hover:bg-brand-700 sm:flex-none"
          >
            <Plus className="h-4 w-4" />
            Join pod
          </Link>
        </div>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <section>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-ink">Your pods</h2>
            <span className="text-xs text-muted">{groups.length} total</span>
          </div>

          {error ? (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          ) : null}

          {isLoading ? (
            <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-border bg-surface">
              <Spinner size="lg" />
            </div>
          ) : groups.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-surface px-6 py-10">
              <Users className="h-6 w-6 text-brand-600" />
              <p className="mt-4 font-display text-lg font-semibold text-ink">No pods yet</p>
              <p className="mt-1 max-w-md text-sm text-muted">
                Complete study preferences, then search for classmates enrolled in your courses.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {!hasSavedProfile ? (
                  <Link
                    to={ROUTES.ONBOARDING}
                    state={{ returnTo: ROUTES.FIND_GROUPS }}
                    className="inline-flex rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-surface"
                  >
                    Complete setup
                  </Link>
                ) : null}
                <Link
                  to={ROUTES.FIND_GROUPS}
                  className={cn(
                    'inline-flex rounded-lg px-4 py-2.5 text-sm font-semibold',
                    hasSavedProfile
                      ? 'bg-brand-600 text-surface'
                      : 'border border-border bg-page text-ink',
                  )}
                >
                  Find a study group
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border bg-surface">
              {groups.map((pod) => (
                <PodCard
                  key={pod.id ?? pod.groupId}
                  to={buildWorkspacePath(pod.groupId)}
                  title={pod.title}
                  members={pod.members}
                  progress={pod.progress}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-8 lg:border-l lg:border-border lg:pl-8">
          <UpcomingDeadlines deadlines={[]} />
        </aside>
      </div>
    </div>
  )
}
