import { Link } from 'react-router-dom'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { ROUTES } from '@/utils/constants'

export function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Instructor overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage cohorts, run matching, and monitor team reliability.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Cohorts" description="Configure and seed student data.">
          <Link to={ROUTES.ADMIN_COHORTS} className="mt-2 inline-block">
            <Button variant="secondary">Manage cohorts</Button>
          </Link>
        </Card>
        <Card title="Group matching" description="Run the heuristic matching engine.">
          <Button className="mt-2">Run matching</Button>
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
