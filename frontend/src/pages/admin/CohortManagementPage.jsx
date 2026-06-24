import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Upload } from 'lucide-react'

export function CohortManagementPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Cohort management</h1>
        <p className="mt-1 text-sm text-slate-500">
          Seed anonymized JSON/CSV datasets and configure group size (N).
        </p>
      </header>

      <Card title="Import seed data" description="Upload anonymized student records for matching.">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary">
            <Upload className="h-4 w-4" />
            Upload CSV / JSON
          </Button>
          <label className="text-sm text-slate-600">
            Group size (N):
            <input
              type="number"
              min="2"
              max="10"
              defaultValue="4"
              className="ml-2 w-16 rounded-lg border border-slate-200 px-2 py-1"
            />
          </label>
        </div>
      </Card>

      <Card title="Active cohorts">
        <p className="text-sm text-slate-500">No cohorts loaded yet. Import seed data to begin.</p>
      </Card>
    </div>
  )
}
