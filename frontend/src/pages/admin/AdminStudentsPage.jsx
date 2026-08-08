import { useEffect, useState } from 'react'
import { Card } from '@/components/common/Card'
import { Input } from '@/components/common/Input'
import { Spinner } from '@/components/common/Spinner'
import { fetchAdminStudents, getAdminErrorMessage } from '@/services/adminService'

function getStudentName(student) {
  const fullName = [student.firstName, student.lastName].filter(Boolean).join(' ')
  return student.name ?? student.fullName ?? (fullName || student.email || 'Student')
}

export function AdminStudentsPage() {
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [cohortId, setCohortId] = useState('')
  const [courseCode, setCourseCode] = useState('')
  const [total, setTotal] = useState(null)

  useEffect(() => {
    let cancelled = false
    const timer = window.setTimeout(async () => {
      setIsLoading(true)
      setError('')
      try {
        const params = {}
        if (cohortId.trim()) params.cohortId = cohortId.trim()
        if (courseCode.trim()) params.courseCode = courseCode.trim()
        const result = await fetchAdminStudents(params)
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
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [cohortId, courseCode])

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold text-ink">Students</h1>
        <p className="mt-1 text-sm text-muted">
          Onboarding status and group assignments across the platform.
        </p>
      </header>

      <Card title="Filters">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Cohort ID"
            placeholder="Optional UUID"
            value={cohortId}
            onChange={(event) => setCohortId(event.target.value)}
          />
          <Input
            label="Course code"
            placeholder="e.g. computer-science-401"
            value={courseCode}
            onChange={(event) => setCourseCode(event.target.value)}
          />
        </div>
      </Card>

      <Card
        title="Directory"
        description={typeof total === 'number' ? `${total} total` : undefined}
      >
        {isLoading ? (
          <div className="flex min-h-[140px] items-center justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : students.length === 0 ? (
          <p className="text-sm text-muted">No students found for these filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
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
                    <td className="py-3 font-medium text-ink">{getStudentName(student)}</td>
                    <td className="py-3 text-muted">{student.email ?? '—'}</td>
                    <td className="py-3 text-muted">
                      {student.onboardingComplete || student.profileComplete
                        ? 'Complete'
                        : student.onboardingStatus ?? 'Pending'}
                    </td>
                    <td className="py-3 text-muted">
                      {student.groupName ??
                        student.group?.name ??
                        student.groupId ??
                        'Unassigned'}
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
