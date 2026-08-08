import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Spinner } from '@/components/common/Spinner'
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
        if (!cancelled) {
          setError(getAdminErrorMessage(loadError, 'Unable to load admin dashboard.'))
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
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

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold text-ink">Instructor overview</h1>
        <p className="mt-1 text-sm text-muted">
          Manage cohorts, run matching, and monitor pod health.
        </p>
      </header>

      {isLoading ? (
        <div className="flex min-h-[180px] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border bg-surface px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{stat.label}</p>
              <p className="mt-2 font-display text-2xl font-semibold text-ink">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {matchMessage && (
        <p className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink">
          {matchMessage}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Cohorts" description="Create cohorts and seed student data.">
          <Link to={ROUTES.ADMIN_COHORTS} className="mt-2 inline-block">
            <Button variant="secondary">Manage cohorts</Button>
          </Link>
        </Card>
        <Card title="Group matching" description="Run the heuristic matching engine.">
          <Button className="mt-2" onClick={handleRunMatching} disabled={isMatching}>
            {isMatching ? 'Running…' : 'Run matching'}
          </Button>
        </Card>
        <Card title="Teams" description="View clustered groups and member health.">
          <Link to={ROUTES.ADMIN_GROUPS} className="mt-2 inline-block">
            <Button variant="secondary">View teams</Button>
          </Link>
        </Card>
        <Card title="Students" description="Browse onboarding status and assignments.">
          <Link to={ROUTES.ADMIN_STUDENTS} className="mt-2 inline-block">
            <Button variant="secondary">View students</Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}
