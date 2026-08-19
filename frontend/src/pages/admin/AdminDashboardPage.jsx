import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, GraduationCap, Play, UserRound, Users } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Spinner } from '@/components/common/Spinner'
import { PageHeader, PageShell, StatTile } from '@/components/layout/PageShell'
import {
  fetchAdminDashboard,
  getAdminErrorMessage,
  getDashboardStats,
  runAdminMatching,
} from '@/services/adminService'
import { ROUTES } from '@/utils/constants'

export function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isMatching, setIsMatching] = useState(false)
  const [matchMessage, setMatchMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      setError('')
      try {
        const data = await fetchAdminDashboard()
        if (!cancelled) setDashboard(data)
      } catch (loadError) {
        if (!cancelled) setError(getAdminErrorMessage(loadError, 'Unable to load admin dashboard.'))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleRunMatching = async () => {
    setIsMatching(true)
    setMatchMessage('')
    try {
      const result = await runAdminMatching()
      setMatchMessage(
        result?.jobId
          ? `Matching job ${result.jobId} started (${result.status ?? 'running'}).`
          : 'Matching run started.',
      )
      const refreshed = await fetchAdminDashboard()
      setDashboard(refreshed)
    } catch (runError) {
      setMatchMessage(getAdminErrorMessage(runError, 'Unable to run matching.'))
    } finally {
      setIsMatching(false)
    }
  }

  const stats = getDashboardStats(dashboard)

  const quickActions = [
    {
      title: 'Cohorts',
      description: 'Create cohorts and manage student data.',
      icon: GraduationCap,
      to: ROUTES.ADMIN_COHORTS,
      label: 'Manage',
    },
    {
      title: 'Group Matching',
      description: 'Run the heuristic matching engine.',
      icon: Play,
      action: handleRunMatching,
      loading: isMatching,
      label: isMatching ? 'Running…' : 'Run Now',
    },
    {
      title: 'Teams',
      description: 'View clustered groups and member health.',
      icon: Users,
      to: ROUTES.ADMIN_GROUPS,
      label: 'View Teams',
    },
    {
      title: 'Students',
      description: 'Browse onboarding status and assignments.',
      icon: UserRound,
      to: ROUTES.ADMIN_STUDENTS,
      label: 'View Students',
    },
  ]

  return (
    <PageShell>
      <PageHeader
        eyebrow="Instructor Portal"
        title="Overview"
        description="Monitor pod health, manage cohorts, and run group matching."
      />

      {/* Stats */}
      <div className="mt-8">
        {isLoading ? (
          <div className="flex min-h-[160px] items-center justify-center rounded-2xl border border-border bg-surface">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <StatTile key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>
        )}
      </div>

      {matchMessage ? (
        <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50 px-5 py-3 text-sm font-medium text-brand-800">
          {matchMessage}
        </div>
      ) : null}

      {/* Quick actions */}
      <div className="mt-8 space-y-3">
        <h2 className="text-base font-bold text-ink">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {quickActions.map(({ title, description, icon: Icon, to, label, action, loading }) => (
            <div
              key={title}
              className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 shadow-xs transition hover:shadow-sm"
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white"
                style={{ background: 'linear-gradient(135deg, #7c6af4, #6c4de8)' }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{title}</p>
                <p className="mt-0.5 text-sm text-muted">{description}</p>
              </div>
              {to ? (
                <Link to={to}>
                  <Button variant="outline" size="sm">
                    {label}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              ) : (
                <Button size="sm" onClick={action} disabled={loading}>
                  {label}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
