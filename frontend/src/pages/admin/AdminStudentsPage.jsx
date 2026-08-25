import { useEffect, useState } from 'react'
import { Card } from '@/components/common/Card'
import { Input } from '@/components/common/Input'
import { Spinner } from '@/components/common/Spinner'
import { PageHeader, PageShell } from '@/components/layout/PageShell'
import {
  fetchAdminCohorts,
  fetchAdminStudents,
  getAdminErrorMessage,
} from '@/services/adminService'

function getStudentName(student) {
  const fullName = [student.firstName, student.lastName].filter(Boolean).join(' ')
  return student.name ?? student.fullName ?? (fullName || student.email || 'Student')
}

function getOnboardingLabel(student) {
  if (student.onboardingComplete || student.profileComplete) return 'Complete'
  if (student.onboardingStatus) return String(student.onboardingStatus)
  return 'Pending'
}

function getGroupLabel(student) {
  return (
    student.groupName ??
    student.group?.name ??
    student.group?.title ??
    student.assignedGroupName ??
    student.groupId ??
    'Unassigned'
  )
}

export function AdminStudentsPage() {
  const [students, setStudents] = useState([])
  const [cohorts, setCohorts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [cohortId, setCohortId] = useState('')
  const [courseCode, setCourseCode] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(null)

  useEffect(() => {
    fetchAdminCohorts()
      .then(setCohorts)
      .catch(() => setCohorts([]))
  }, [])

  useEffect(() => {
    let cancelled = false
    const timer = window.setTimeout(async () => {
      setIsLoading(true)
      setError('')
      try {
        const result = await fetchAdminStudents({
          cohortId: cohortId || undefined,
          courseCode: courseCode.trim() || undefined,
          page,
        })
        if (!cancelled) {
          setStudents(result.students)
          setTotal(result.total)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(getAdminErrorMessage(loadError, 'Unable to load students.'))
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }, 200)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [cohortId, courseCode, page])

  return (
    <PageShell className="space-y-5">
      <PageHeader
        eyebrow="Instructor"
        title="Students"
        description="GET /api/admin/students?cohortId=&courseCode=&page="
      />

      <Card title="Filters">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="block text-xs font-semibold text-soft">Cohort</span>
            <select
              className="h-9 w-full rounded-md border border-border bg-surface px-2.5 text-[13px]"
              value={cohortId}
              onChange={(event) => {
                setPage(1)
                setCohortId(event.target.value)
              }}
            >
              <option value="">All cohorts</option>
              {cohorts.map((cohort) => (
                <option key={cohort.id} value={cohort.id}>
                  {cohort.name ?? cohort.id}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Course code"
            placeholder="e.g. computer-science-401"
            value={courseCode}
            onChange={(event) => {
              setPage(1)
              setCourseCode(event.target.value)
            }}
          />
        </div>
      </Card>

      <Card
        title="Directory"
        description={typeof total === 'number' ? `${total} total` : `${students.length} loaded`}
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="text-[12px] font-semibold text-brand-700 disabled:opacity-40"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <span className="text-[11px] text-muted">Page {page}</span>
            <button
              type="button"
              className="text-[12px] font-semibold text-brand-700 disabled:opacity-40"
              disabled={isLoading || (typeof total === 'number' && page * 20 >= total)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        }
      >
        {isLoading ? (
          <div className="flex min-h-[120px] items-center justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <p className="text-[12px] text-red-600">{error}</p>
        ) : students.length === 0 ? (
          <p className="text-[12px] text-muted">No students found for these filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="py-2 font-medium">Name</th>
                  <th className="py-2 font-medium">Email</th>
                  <th className="py-2 font-medium">Onboarding</th>
                  <th className="py-2 font-medium">Group</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr
                    key={student.id ?? student.userId ?? student.email}
                    className="border-b border-border/60"
                  >
                    <td className="py-2.5 font-medium text-ink">{getStudentName(student)}</td>
                    <td className="py-2.5 text-muted">{student.email ?? '—'}</td>
                    <td className="py-2.5 text-muted">{getOnboardingLabel(student)}</td>
                    <td className="py-2.5 text-muted">{getGroupLabel(student)}</td>
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
