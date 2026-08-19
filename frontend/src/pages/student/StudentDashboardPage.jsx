import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Plus, Users } from 'lucide-react'
import { PodCard } from '@/components/dashboard/PodCard'
import { UpcomingDeadlines } from '@/components/dashboard/UpcomingDeadlines'
import { CompleteStudyPreferencesBanner } from '@/components/onboarding/CompleteStudyPreferencesBanner'
import { Button } from '@/components/common/Button'
import { Spinner } from '@/components/common/Spinner'
import { PageHeader, PageShell } from '@/components/layout/PageShell'
import { useAuth } from '@/hooks/useAuth'
import { fetchUserGroups, getUserGroupsErrorMessage } from '@/services/usersService'
import { fetchMyReliability } from '@/services/reliabilityService'
import {
  isOnboardingProfileSaved,
  loadOnboardingProfile,
} from '@/services/onboardingProfileService'
import { ROUTES } from '@/utils/constants'
import { buildWorkspacePath } from '@/utils/workspace'

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
        if (!cancelled) setError(getUserGroupsErrorMessage(loadError))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const reliabilityScore = reliability?.score != null
    ? reliability.score
    : null

  return (
    <PageShell>
      {!hasSavedProfile ? (
        <CompleteStudyPreferencesBanner
          returnTo={ROUTES.FIND_GROUPS}
          className="mb-8"
          description="Finish learning style, availability, courses, and preferences before searching for a pod."
        />
      ) : null}

      <PageHeader
        eyebrow={`Welcome back`}
        title={`Hello, ${firstName} 👋`}
        description={
          groups.length > 0
            ? `You have ${groups.length} active study pod${groups.length === 1 ? '' : 's'}.`
            : 'Find classmates in your courses and start collaborating.'
        }
        actions={
          <Button asChild size="md">
            <Link to={ROUTES.FIND_GROUPS}>
              <Plus className="h-4 w-4" />
              Join a Pod
            </Link>
          </Button>
        }
      />

      {/* Stats row */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="stat-tile">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">Study Pods</p>
          <p className="mt-3 font-display text-3xl font-bold text-ink">{groups.length}</p>
          <p className="mt-1 text-xs text-soft">Active groups</p>
        </div>
        <div className="stat-tile">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">Reliability</p>
          <p className="mt-3 font-display text-3xl font-bold text-ink">
            {reliabilityScore != null ? `${reliabilityScore}%` : '—'}
          </p>
          <p className="mt-1 text-xs text-soft">
            {reliabilityScore != null ? 'Score' : `${reliability?.tasksScored ?? 0}/3 tasks rated`}
          </p>
        </div>
        <div className="stat-tile col-span-2 sm:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">Status</p>
          <p className="mt-3 font-display text-3xl font-bold text-emerald-600">Active</p>
          <p className="mt-1 text-xs text-soft">Account standing</p>
        </div>
      </div>

      {/* Main grid */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_17rem] lg:gap-10">
        {/* Pods section */}
        <section className="min-w-0 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white">
                <BookOpen className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-ink">Your Study Pods</h2>
            </div>
            <span className="badge-brand">{groups.length} total</span>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-border bg-surface">
              <Spinner size="lg" />
            </div>
          ) : groups.length === 0 ? (
            <div className="empty-state">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
                <Users className="h-7 w-7 text-brand-600" />
              </div>
              <p className="mt-4 font-display text-lg font-bold text-ink">No pods yet</p>
              <p className="mx-auto mt-2 max-w-xs text-sm text-muted">
                Complete your study preferences, then search for classmates in your courses.
              </p>
              <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
                {!hasSavedProfile ? (
                  <Button asChild size="sm">
                    <Link to={ROUTES.ONBOARDING} state={{ returnTo: ROUTES.FIND_GROUPS }}>
                      Complete setup
                    </Link>
                  </Button>
                ) : null}
                <Button asChild variant={hasSavedProfile ? 'primary' : 'secondary'} size="sm">
                  <Link to={ROUTES.FIND_GROUPS}>Find a study group</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
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

        {/* Sidebar */}
        <aside className="min-w-0">
          <UpcomingDeadlines deadlines={[]} />
        </aside>
      </div>
    </PageShell>
  )
}
