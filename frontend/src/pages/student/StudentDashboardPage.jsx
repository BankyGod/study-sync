import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Users, CheckCircle2, Clock } from 'lucide-react'
import { CircularProgress } from '@/components/dashboard/CircularProgress'
import { PodCard } from '@/components/dashboard/PodCard'
import { QuickStatCard } from '@/components/dashboard/QuickStatCard'
import { UpcomingDeadlines } from '@/components/dashboard/UpcomingDeadlines'
import { Spinner } from '@/components/common/Spinner'
import { useAuth } from '@/hooks/useAuth'
import { fetchUserGroups, getUserGroupsErrorMessage } from '@/services/usersService'
import { fetchMyReliability } from '@/services/reliabilityService'
import { ROUTES } from '@/utils/constants'
import { buildWorkspacePath } from '@/utils/workspace'

const deadlines = []

export function StudentDashboardPage() {
  const { user } = useAuth()
  const [groups, setGroups] = useState([])
  const [reliability, setReliability] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const firstName = useMemo(() => user?.name?.split(' ')[0] ?? 'there', [user?.name])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError('')
      try {
        const [nextGroups, reliabilityData] = await Promise.all([
          fetchUserGroups(),
          fetchMyReliability().catch(() => null),
        ])
        if (!cancelled) {
          setGroups(nextGroups)
          setReliability(reliabilityData)
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

  const reliabilityLabel =
    reliability?.score != null
      ? reliability.label || 'Reliability'
      : reliability?.tasksScored != null
        ? `Reliability (${reliability.tasksScored}/3 tasks)`
        : 'Reliability'

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 pb-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_300px] lg:gap-8">
        <div className="space-y-6 sm:space-y-8">
          <section className="flex flex-wrap items-center justify-between gap-4 sm:gap-6">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Hello, {firstName}! <span aria-hidden="true">👋</span>
              </h1>
              <p className="mt-2 text-slate-500">
                Ready to tackle your study goals for today, {firstName}?
              </p>
            </div>
            <CircularProgress
              value={reliability?.score ?? null}
              label={reliabilityLabel}
            />
          </section>

          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-900">Your Active Pods</h2>
              <Link
                to={ROUTES.FIND_GROUPS}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
              >
                <Plus className="h-4 w-4" />
                Join New Pod
              </Link>
            </div>

            {error && (
              <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            )}

            {isLoading ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : groups.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
                <p className="text-sm font-medium text-slate-700">No study pods yet</p>
                <p className="mt-1 text-sm text-slate-500">
                  Complete onboarding and find a group to get started.
                </p>
                <Link
                  to={ROUTES.FIND_GROUPS}
                  className="mt-4 inline-flex rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Find a Study Group
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {groups.map((pod) => (
                  <PodCard
                    key={pod.id ?? pod.groupId}
                    to={buildWorkspacePath(pod.groupId)}
                    title={pod.title}
                    members={pod.members}
                    progress={pod.progress}
                    accent={pod.accent}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="grid gap-4 sm:grid-cols-3">
            <QuickStatCard icon={Users} value={String(groups.length)} label="Active Pods" accent="purple" />
            <QuickStatCard icon={CheckCircle2} value="—" label="Tasks Completed" accent="green" />
            <QuickStatCard icon={Clock} value="—" label="Study Time" accent="amber" />
          </section>
        </div>

        <div className="hidden lg:block">
          <UpcomingDeadlines deadlines={deadlines} />
        </div>
      </div>
    </div>
  )
}
