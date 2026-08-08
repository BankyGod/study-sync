import { useEffect, useState } from 'react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Input } from '@/components/common/Input'
import { Spinner } from '@/components/common/Spinner'
import {
  createAdminCohort,
  fetchAdminCohorts,
  getAdminErrorMessage,
  runAdminMatching,
  seedAdminCohort,
} from '@/services/adminService'

export function CohortManagementPage() {
  const [cohorts, setCohorts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [name, setName] = useState('')
  const [selectedCohortId, setSelectedCohortId] = useState('')
  const [studentCount, setStudentCount] = useState(50)
  const [courseSubject, setCourseSubject] = useState('Computer Science')
  const [courseNumber, setCourseNumber] = useState('401')
  const [groupSize, setGroupSize] = useState(4)

  const loadCohorts = async () => {
    setIsLoading(true)
    setError('')
    try {
      const list = await fetchAdminCohorts()
      setCohorts(list)
      if (!selectedCohortId && list[0]?.id) {
        setSelectedCohortId(list[0].id)
      }
    } catch (loadError) {
      setError(getAdminErrorMessage(loadError, 'Unable to load cohorts.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCohorts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCreate = async (event) => {
    event.preventDefault()
    if (!name.trim()) return
    setIsSaving(true)
    setMessage('')
    try {
      const cohort = await createAdminCohort({
        name: name.trim(),
        targetGroupSize: Number(groupSize),
      })
      setName('')
      setMessage(`Created cohort “${cohort?.name ?? name.trim()}”.`)
      await loadCohorts()
      if (cohort?.id) setSelectedCohortId(cohort.id)
    } catch (saveError) {
      setMessage(getAdminErrorMessage(saveError, 'Unable to create cohort.'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleSeed = async () => {
    if (!selectedCohortId) {
      setMessage('Select a cohort before seeding.')
      return
    }
    setIsSaving(true)
    setMessage('')
    try {
      await seedAdminCohort({
        cohortId: selectedCohortId,
        studentCount: Number(studentCount),
        courses: [{ subject: courseSubject.trim(), courseNumber: courseNumber.trim() }],
      })
      setMessage('Seed request submitted.')
      await loadCohorts()
    } catch (seedError) {
      setMessage(getAdminErrorMessage(seedError, 'Unable to seed cohort data.'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleRunMatching = async () => {
    if (!selectedCohortId) {
      setMessage('Select a cohort before running matching.')
      return
    }
    setIsSaving(true)
    setMessage('')
    try {
      const courseCode = `${courseSubject.trim().toLowerCase().replace(/\s+/g, '-')}-${courseNumber.trim()}`
      const result = await runAdminMatching({
        cohortId: selectedCohortId,
        courseCode,
      })
      setMessage(
        result?.jobId
          ? `Matching job ${result.jobId} started.`
          : 'Matching run started for this cohort.',
      )
    } catch (matchError) {
      setMessage(getAdminErrorMessage(matchError, 'Unable to run matching.'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold text-ink">Cohort management</h1>
        <p className="mt-1 text-sm text-muted">
          Create cohorts, seed staging data, and run batch matching.
        </p>
      </header>

      {message && (
        <p className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink">
          {message}
        </p>
      )}

      <Card title="Create cohort" description="Register a new cohort for matching.">
        <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <Input
            label="Cohort name"
            placeholder="CS 400 — Fall 2026"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            label="Target group size (N)"
            type="number"
            min={2}
            max={10}
            value={groupSize}
            onChange={(event) => setGroupSize(event.target.value)}
          />
          <Button type="submit" disabled={isSaving || !name.trim()}>
            {isSaving ? 'Saving…' : 'Create'}
          </Button>
        </form>
      </Card>

      <Card title="Seed & match" description="Generate demo students then run matching for a cohort.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink">Cohort</span>
            <select
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              value={selectedCohortId}
              onChange={(event) => setSelectedCohortId(event.target.value)}
            >
              <option value="">Select cohort</option>
              {cohorts.map((cohort) => (
                <option key={cohort.id} value={cohort.id}>
                  {cohort.name ?? cohort.id}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Student count"
            type="number"
            min={1}
            max={500}
            value={studentCount}
            onChange={(event) => setStudentCount(event.target.value)}
          />
          <Input
            label="Course subject"
            value={courseSubject}
            onChange={(event) => setCourseSubject(event.target.value)}
          />
          <Input
            label="Course number"
            value={courseNumber}
            onChange={(event) => setCourseNumber(event.target.value)}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={handleSeed} disabled={isSaving}>
            Seed data
          </Button>
          <Button onClick={handleRunMatching} disabled={isSaving}>
            Run matching
          </Button>
        </div>
      </Card>

      <Card title="Active cohorts">
        {isLoading ? (
          <div className="flex min-h-[120px] items-center justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : cohorts.length === 0 ? (
          <p className="text-sm text-muted">No cohorts yet. Create one to begin.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="py-2 font-medium">Name</th>
                  <th className="py-2 font-medium">Students</th>
                  <th className="py-2 font-medium">Groups</th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map((cohort) => (
                  <tr key={cohort.id} className="border-b border-border/60">
                    <td className="py-3 font-medium text-ink">{cohort.name ?? cohort.id}</td>
                    <td className="py-3 text-muted">
                      {cohort.studentCount ?? cohort.students ?? '—'}
                    </td>
                    <td className="py-3 text-muted">
                      {cohort.groupCount ?? cohort.groups ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
