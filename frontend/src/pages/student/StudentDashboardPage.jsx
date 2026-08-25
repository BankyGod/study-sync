import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Plus,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { PodCard } from '@/components/dashboard/PodCard'
import { UpcomingDeadlines } from '@/components/dashboard/UpcomingDeadlines'
import { CircularProgress } from '@/components/dashboard/CircularProgress'
import { CompleteStudyPreferencesBanner } from '@/components/onboarding/CompleteStudyPreferencesBanner'
import { Button } from '@/components/common/Button'
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

function KpiCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="dash-kpi dash-in">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="font-display text-2xl font-semibold tracking-tight text-ink">{value}</p>
      {hint ? <p className="text-[11px] text-muted">{hint}</p> : null}
    </div>
  )
}

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
    return () => {
      cancelled = true
    }
  }, [])

  const memberCount = useMemo(
    () => groups.reduce((sum, g) => sum + (g.members?.length ?? 0), 0),
    [groups],
  )

  const avgProgress = useMemo(() => {
    if (!groups.length) return 0
    const total = groups.reduce((sum, g) => sum + (Number(g.progress) || 0), 0)
    return Math.round(total / groups.length)
  }, [groups])

  const reliabilityScore = reliability?.score != null ? reliability.score : null
  const reliabilityHint =
    reliabilityScore != null
      ? 'Task reliability score'
      : `${reliability?.tasksScored ?? 0}/3 tasks scored`

  return (
    <div className="ss-shell space-y-5">
      {!hasSavedProfile ? (
        <CompleteStudyPreferencesBanner
          returnTo={ROUTES.FIND_GROUPS}
          description="Finish preferences before searching for a pod."
        />
      ) : null}

      {/* Welcome banner */}
      <section className="dash-in relative overflow-hidden rounded-2xl bg-rail text-white shadow-md">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-500/20 blur-2xl" />
        <div className="absolute -bottom-16 right-20 h-44 w-44 rounded-full bg-brand-400/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
              Dashboard
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Welcome back, {firstName}
            </h1>
            <p className="mt-1.5 max-w-md text-[13px] text-white/65">
              {groups.length > 0
                ? `You have ${groups.length} active study pod${groups.length === 1 ? '' : 's'} ready.`
                : 'Find classmates by course and start collaborating in a shared workspace.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" className="bg-brand-500 hover:bg-brand-400">
              <Link to={ROUTES.FIND_GROUPS}>
                <Plus className="h-3.5 w-3.5" />
                Join pod
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="border-white/15 bg-white/10 text-white hover:bg-white/15"
            >
              <Link to={ROUTES.WORKSPACE_LIST}>
                Open workspace
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Active pods" value={groups.length} hint="Study groups" icon={BookOpen} />
        <KpiCard label="Teammates" value={memberCount} hint="Across your pods" icon={Users} />
        <KpiCard label="Avg progress" value={`${avgProgress}%`} hint="Task completion" icon={Search} />
        <KpiCard
          label="Reliability"
          value={reliabilityScore != null ? `${reliabilityScore}%` : '—'}
          hint={reliabilityHint}
          icon={ShieldCheck}
        />
      </div>

      {/* Main bento */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_17.5rem]">
        <section className="dash-in-2 min-w-0 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[14px] font-semibold text-ink">Your study pods</h2>
            <Link
              to={ROUTES.FIND_GROUPS}
              className="text-[12px] font-semibold text-brand-700 hover:text-brand-800"
            >
              Find more
            </Link>
          </div>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
              {error}
            </p>
          ) : null}

          {isLoading ? (
            <div className="dash-card flex min-h-[220px] items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : groups.length === 0 ? (
            <div className="ss-empty">
              <Users className="mx-auto h-6 w-6 text-brand-700" />
              <p className="mt-2 text-[14px] font-semibold text-ink">No pods yet</p>
              <p className="mx-auto mt-1 max-w-sm text-[12px] text-muted">
                Complete study preferences, then search by course to join a group.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {!hasSavedProfile ? (
                  <Button asChild size="sm">
                    <Link to={ROUTES.ONBOARDING} state={{ returnTo: ROUTES.FIND_GROUPS }}>
                      Complete setup
                    </Link>
                  </Button>
                ) : null}
                <Button asChild variant={hasSavedProfile ? 'primary' : 'secondary'} size="sm">
                  <Link to={ROUTES.FIND_GROUPS}>Find a group</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {groups.map((pod, index) => (
                <PodCard
                  key={pod.id ?? pod.groupId}
                  to={buildWorkspacePath(pod.groupId)}
                  title={pod.title}
                  members={pod.members}
                  progress={pod.progress}
                  index={index}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="dash-in-3 flex min-w-0 flex-col gap-3">
          <div className="dash-card flex flex-col items-center p-4 text-center">
            <p className="mb-2 w-full text-left text-[13px] font-semibold text-ink">Reliability</p>
            <CircularProgress
              value={reliabilityScore}
              size={88}
              strokeWidth={8}
              label={reliabilityHint}
            />
          </div>

          <UpcomingDeadlines deadlines={[]} />

          <div className="dash-card space-y-2 p-4">
            <p className="text-[13px] font-semibold text-ink">Quick actions</p>
            <Link
              to={ROUTES.FIND_GROUPS}
              className="flex items-center justify-between rounded-lg bg-page px-3 py-2.5 text-[12px] font-semibold text-ink transition hover:bg-brand-50"
            >
              Find a study group
              <ArrowRight className="h-3.5 w-3.5 text-muted" />
            </Link>
            <Link
              to={ROUTES.PROFILE}
              className="flex items-center justify-between rounded-lg bg-page px-3 py-2.5 text-[12px] font-semibold text-ink transition hover:bg-brand-50"
            >
              Edit preferences
              <ArrowRight className="h-3.5 w-3.5 text-muted" />
            </Link>
            <Link
              to={ROUTES.WORKSPACE_LIST}
              className="flex items-center justify-between rounded-lg bg-page px-3 py-2.5 text-[12px] font-semibold text-ink transition hover:bg-brand-50"
            >
              Open workspaces
              <ArrowRight className="h-3.5 w-3.5 text-muted" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
