import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, GraduationCap, UserRound, Users } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Spinner } from '@/components/common/Spinner'
import { PageShell, StatTile } from '@/components/layout/PageShell'
import { fetchAdminOverview, getAdminErrorMessage } from '@/services/adminService'
import { ROUTES } from '@/utils/constants'

export function AdminDashboardPage() {
  const [stats, setStats] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      setError('')
      try {
        const overview = await fetchAdminOverview()
        if (!cancelled) setStats(overview.stats)
      } catch (loadError) {
        if (!cancelled) {
          setError(getAdminErrorMessage(loadError, 'Unable to load admin overview.'))
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

  const actions = [
    {
      title: 'Cohorts',
      description: 'Create cohorts, seed data, run matching.',
      icon: GraduationCap,
      to: ROUTES.ADMIN_COHORTS,
    },
    {
      title: 'Groups',
      description: 'Browse matched study pods.',
      icon: Users,
      to: ROUTES.ADMIN_GROUPS,
    },
    {
      title: 'Students',
      description: 'Onboarding status and assignments.',
      icon: UserRound,
      to: ROUTES.ADMIN_STUDENTS,
    },
  ]

  return (
    <PageShell className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl bg-rail p-5 text-white shadow-md sm:p-6">
        <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-brand-500/20 blur-2xl" />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
            Instructor portal
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Overview
          </h1>
          <p className="mt-1.5 max-w-lg text-[13px] text-white/65">
            Live counts from cohorts, groups, and students. Matching runs from Cohorts.
          </p>
        </div>
      </section>

      {isLoading ? (
        <div className="dash-card flex min-h-[120px] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
          {error}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatTile key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {actions.map(({ title, description, icon: Icon, to }) => (
          <div key={title} className="dash-card flex flex-col gap-3 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-ink">{title}</p>
                <p className="text-[11px] text-muted">{description}</p>
              </div>
            </div>
            <Button asChild variant="secondary" size="sm" className="w-full sm:w-auto">
              <Link to={to}>
                Open
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </PageShell>
  )
}
