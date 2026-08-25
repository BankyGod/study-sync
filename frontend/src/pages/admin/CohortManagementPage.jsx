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
  runAdminMatching,
  seedAdminCohort,
} from '@/services/adminService'

function courseCodeFrom(subject, number) {
  return `${subject.trim().toLowerCase().replace(/\s+/g, '-')}-${number.trim()}`
}

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
      if (!selectedCohortId && list[0]?.id) setSelectedCohortId(list[0].id)
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
        targetGroupSize: Number(groupSize) || undefined,
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
      const result = await seedAdminCohort({
        cohortId: selectedCohortId,
        studentCount: Number(studentCount),
        courses: [{ subject: courseSubject.trim(), courseNumber: courseNumber.trim() }],
      })
      setMessage(
        result?.message ||
          `Seed submitted (${studentCount} students for ${courseSubject} ${courseNumber}).`,
      )
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
      const result = await runAdminMatching({
        cohortId: selectedCohortId,
        courseCode: courseCodeFrom(courseSubject, courseNumber),
      })
      const parts = [
        result?.jobId ? `Job ${result.jobId}` : 'Matching started',
        result?.status ? `(${result.status})` : null,
        result?.groupsCreated != null ? `${result.groupsCreated} groups` : null,
        result?.studentsMatched != null ? `${result.studentsMatched} students` : null,
      ].filter(Boolean)
      setMessage(parts.join(' · '))
      await loadCohorts()
    } catch (matchError) {
      setMessage(getAdminErrorMessage(matchError, 'Unable to run matching.'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PageShell className="space-y-5">
      <PageHeader
        eyebrow="Instructor"
        title="Cohorts"
        description="POST /admin/cohorts · seed · matching/run"
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
            label="Group size"
            type="number"
            min={2}
            max={10}
            value={groupSize}
            onChange={(event) => setGroupSize(event.target.value)}
          />
          <Button type="submit" size="sm" disabled={isSaving || !name.trim()}>
            {isSaving ? 'Saving…' : 'Create'}
          </Button>
        </form>
      </Card>

      <Card title="Seed & match" description="POST /api/admin/seed · POST /api/admin/matching/run">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block space-y-1">
            <span className="block text-xs font-semibold text-soft">Cohort</span>
            <select
              className="h-9 w-full rounded-md border border-border bg-surface px-2.5 text-[13px]"
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
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={handleSeed} disabled={isSaving}>
            Seed data
          </Button>
          <Button size="sm" onClick={handleRunMatching} disabled={isSaving}>
            Run matching
          </Button>
        </div>
      </Card>

      <Card title="Active cohorts" description="GET /api/admin/cohorts">
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
                  <th className="py-2 font-medium">Students</th>
                  <th className="py-2 font-medium">Groups</th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map((cohort) => (
                  <tr key={cohort.id} className="border-b border-border/60">
                    <td className="py-2.5 font-medium text-ink">{cohort.name ?? cohort.id}</td>
                    <td className="py-2.5 text-muted">
                      {cohort.studentCount ?? cohort.students ?? '—'}
                    </td>
                    <td className="py-2.5 text-muted">
                      {cohort.groupCount ?? cohort.groups ?? '—'}
                    </td>
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
