import { useEffect, useState } from 'react'
import { Card } from '@/components/common/Card'
import { Input } from '@/components/common/Input'
import { Spinner } from '@/components/common/Spinner'
import { PageHeader, PageShell } from '@/components/layout/PageShell'
import { fetchAdminStudents, getAdminErrorMessage } from '@/services/adminService'

function getStudentName(student) {
  const fullName = [student.firstName, student.lastName].filter(Boolean).join(' ')
  return student.name ?? student.fullName ?? (fullName || student.email || 'Student')
}

function getOnboardingLabel(student) {
  if (student.onboardingCompleted || student.onboardingComplete || student.profileComplete) {
    return 'Complete'
  }
  if (student.onboardingStatus) return String(student.onboardingStatus)
  return 'Pending'
}

function getGroupLabel(student) {
  if (Array.isArray(student.groups) && student.groups.length > 0) {
    return student.groups.map((g) => g.title || g.groupId || g.id).join(', ')
  }
  return (
    student.groupName ??
    student.group?.name ??
    student.group?.title ??
    student.assignedGroupName ??
    (student.matched ? 'Matched' : 'Unassigned')
  )
}

function StudentAvatar({ student }) {
  const name = getStudentName(student)
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
  const [src, setSrc] = useState(() => student.avatarUrl || null)

  useEffect(() => {
    setSrc(student.avatarUrl || null)
  }, [student.avatarUrl])

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="h-8 w-8 rounded-full bg-brand-50 object-cover ring-1 ring-border"
        onError={() => setSrc(null)}
      />
    )
  }

  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-[11px] font-semibold text-brand-700">
      {initials || '?'}
    </span>
  )
}

export function AdminStudentsPage() {
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(null)
  const [hiddenDemoCount, setHiddenDemoCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    const timer = window.setTimeout(async () => {
      setIsLoading(true)
      setError('')
      try {
        const result = await fetchAdminStudents({
          q: q.trim() || undefined,
          page,
          limit: 20,
        })
        if (!cancelled) {
          setStudents(result.students)
          setTotal(result.total)
          setHiddenDemoCount(result.filteredDemoCount ?? 0)
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
  }, [q, page])

  return (
    <PageShell className="space-y-5">
      <PageHeader
        eyebrow="Instructor"
        title="Students"
        description="Real registered students only — seed/demo accounts are hidden."
      />

      <Card title="Search">
        <Input
          label="Name, email, or student ID"
          placeholder="Search students…"
          value={q}
          onChange={(event) => {
            setPage(1)
            setQ(event.target.value)
          }}
        />
      </Card>

      {hiddenDemoCount > 0 ? (
        <p className="rounded-xl border border-border bg-surface px-3 py-2 text-[12px] text-muted">
          Hidden {hiddenDemoCount} seed/demo account{hiddenDemoCount === 1 ? '' : 's'} on this
          page (@studysync.local).
        </p>
      ) : null}

      <Card
        title="Directory"
        description={typeof total === 'number' ? `${total} real students` : `${students.length} loaded`}
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
          <p className="text-[12px] text-muted">
            No real students found. Seed/demo accounts are excluded from this directory.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="py-2 font-medium">Student</th>
                  <th className="py-2 font-medium">Email</th>
                  <th className="py-2 font-medium">Onboarding</th>
                  <th className="py-2 font-medium">Pods</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr
                    key={student.id ?? student.userId ?? student.email}
                    className="border-b border-border/60"
                  >
                    <td className="py-2.5">
                      <div className="flex items-center gap-2.5">
                        <StudentAvatar student={student} />
                        <span className="font-medium text-ink">{getStudentName(student)}</span>
                      </div>
                    </td>
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
