import { useEffect, useState } from 'react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Input } from '@/components/common/Input'
import { Spinner } from '@/components/common/Spinner'
import { PageHeader, PageShell } from '@/components/layout/PageShell'
import {
  createAdminCohort,
  fetchAdminCohorts,
  getAdminErrorMessage,
} from '@/services/adminService'

export function CohortManagementPage() {
  const [cohorts, setCohorts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [name, setName] = useState('')
  const [term, setTerm] = useState('')

  const loadCohorts = async () => {
    setIsLoading(true)
    setError('')
    try {
      const list = await fetchAdminCohorts()
      setCohorts(list)
    } catch (loadError) {
      setError(getAdminErrorMessage(loadError, 'Unable to load cohorts.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCohorts()
  }, [])

  const handleCreate = async (event) => {
    event.preventDefault()
    if (!name.trim()) return
    setIsSaving(true)
    setMessage('')
    try {
      const cohort = await createAdminCohort({
        name: name.trim(),
        term: term.trim() || undefined,
      })
      setName('')
      setTerm('')
      setMessage(`Created cohort “${cohort?.name ?? name.trim()}”.`)
      await loadCohorts()
    } catch (saveError) {
      setMessage(getAdminErrorMessage(saveError, 'Unable to create cohort.'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PageShell className="space-y-5">
      <PageHeader
        eyebrow="Instructor"
        title="Cohorts"
        description="Live data from GET/POST /api/admin/cohorts"
      />

      {message ? (
        <p className="rounded-xl border border-border bg-surface px-3 py-2 text-[12px] text-ink shadow-sm">
          {message}
        </p>
      ) : null}

      <Card title="Create cohort" description="POST /api/admin/cohorts">
        <form
          onSubmit={handleCreate}
          className="grid gap-3 sm:grid-cols-[1fr_8rem_auto] sm:items-end"
        >
          <Input
            label="Cohort name"
            placeholder="CS 400 — Fall 2026"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            label="Term"
            placeholder="2026"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
          />
          <Button type="submit" size="sm" disabled={isSaving || !name.trim()}>
            {isSaving ? 'Saving…' : 'Create'}
          </Button>
        </form>
      </Card>

      <Card title="Active cohorts" description="GET /api/admin/cohorts — real student & pod counts">
        {isLoading ? (
          <div className="flex min-h-[100px] items-center justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <p className="text-[12px] text-red-600">{error}</p>
        ) : cohorts.length === 0 ? (
          <p className="text-[12px] text-muted">No cohorts yet. Create one to begin.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="py-2 font-medium">Name</th>
                  <th className="py-2 font-medium">Term</th>
                  <th className="py-2 font-medium">Students</th>
                  <th className="py-2 font-medium">Pods</th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map((cohort) => (
                  <tr key={cohort.id} className="border-b border-border/60">
                    <td className="py-2.5 font-medium text-ink">{cohort.name ?? cohort.id}</td>
                    <td className="py-2.5 text-muted">{cohort.term ?? '—'}</td>
                    <td className="py-2.5 text-muted">{cohort.studentCount ?? 0}</td>
                    <td className="py-2.5 text-muted">{cohort.podCount ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageShell>
  )
}
