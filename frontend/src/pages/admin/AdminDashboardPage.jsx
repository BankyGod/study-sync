import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Spinner } from '@/components/common/Spinner'
import apiClient from '@/api/client'
import { endpoints } from '@/api/endpoints'
import { getApiErrorMessage } from '@/utils/apiErrors'
import { ROUTES } from '@/utils/constants'

export function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isMatching, setIsMatching] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError('')
      try {
        const { data } = await apiClient.get(endpoints.admin.dashboard)
        if (!cancelled) setDashboard(data)
      } catch (loadError) {
        if (!cancelled) {
          setError(getApiErrorMessage(loadError, 'Unable to load admin dashboard.'))
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
    try {
      await apiClient.post(endpoints.admin.runMatching)
      window.alert('Matching run started.')
    } catch (runError) {
      window.alert(getApiErrorMessage(runError, 'Unable to run matching.'))
    } finally {
      setIsMatching(false)
    }
  }

  const overview = dashboard?.overview ?? dashboard?.totals ?? dashboard ?? {}
  const stats = [
    { label: 'Students', value: overview.students ?? overview.studentCount ?? '—' },
    { label: 'Pods', value: overview.groups ?? overview.pods ?? overview.groupCount ?? '—' },
    { label: 'Active sessions', value: overview.activeSessions ?? overview.sessions ?? '—' },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
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
        <div className="grid gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border bg-surface px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{stat.label}</p>
              <p className="mt-2 font-display text-2xl font-semibold text-ink">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Cohorts" description="Configure and seed student data.">
          <Link to={ROUTES.ADMIN_COHORTS} className="mt-2 inline-block">
            <Button variant="secondary">Manage cohorts</Button>
          </Link>
        </Card>
        <Card title="Group matching" description="Run the heuristic matching engine.">
          <Button className="mt-2" onClick={handleRunMatching} disabled={isMatching}>
            {isMatching ? 'Running…' : 'Run matching'}
          </Button>
        </Card>
        <Card title="Teams" description="View all clustered groups and reliability flags.">
          <Link to={ROUTES.ADMIN_GROUPS} className="mt-2 inline-block">
            <Button variant="secondary">View teams</Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}
