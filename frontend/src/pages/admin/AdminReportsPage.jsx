import { useEffect, useMemo, useState } from 'react'
import { Download, Printer } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Spinner } from '@/components/common/Spinner'
import { PageHeader, PageShell, StatTile } from '@/components/layout/PageShell'
import {
  downloadCsv,
  fetchAdminReportBundle,
  getAdminErrorMessage,
} from '@/services/adminService'
import { useAuth } from '@/hooks/useAuth'
import { hasPermission, PERMISSIONS } from '@/utils/staffPermissions'

export function AdminReportsPage() {
  const { user } = useAuth()
  const canPrint = hasPermission(user, PERMISSIONS.PRINT_REPORTS)
  const [report, setReport] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      setError('')
      try {
        const data = await fetchAdminReportBundle()
        if (!cancelled) setReport(data)
      } catch (loadError) {
        if (!cancelled) {
          setError(getAdminErrorMessage(loadError, 'Unable to load reports.'))
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

  const generatedLabel = useMemo(() => {
    if (!report?.generatedAt) return ''
    try {
      return new Date(report.generatedAt).toLocaleString()
    } catch {
      return report.generatedAt
    }
  }, [report?.generatedAt])

  const handlePrint = () => {
    window.print()
  }

  const handleExportCsv = () => {
    if (!report) return
    downloadCsv(
      `studysync-groups-${new Date().toISOString().slice(0, 10)}.csv`,
      (report.groups ?? []).map((group) => ({
        title: group.title,
        course: group.course,
        cohort: group.cohortName ?? '',
        members: group.memberCount,
        leader: group.leader?.name ?? 'Unassigned',
        progress: `${group.progress ?? 0}%`,
      })),
    )
  }

  if (!hasPermission(user, PERMISSIONS.VIEW_REPORTS)) {
    return (
      <PageShell>
        <p className="text-[13px] text-muted">You do not have permission to view reports.</p>
      </PageShell>
    )
  }

  return (
    <PageShell className="space-y-5">
      <div className="print:hidden">
        <PageHeader
          eyebrow="Instructor"
          title="Reports"
          description="Printable summaries of cohorts, pods, leaders, and student counts."
          actions={
            <div className="flex flex-wrap gap-2">
              {canPrint ? (
                <Button type="button" size="sm" variant="secondary" onClick={handlePrint}>
                  <Printer className="h-3.5 w-3.5" />
                  Print
                </Button>
              ) : null}
              <Button type="button" size="sm" onClick={handleExportCsv} disabled={!report}>
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </Button>
            </div>
          }
        />
      </div>

      <div className="hidden print:block">
        <h1 className="text-xl font-bold text-ink">StudySync Admin Report</h1>
        <p className="mt-1 text-sm text-muted">Generated {generatedLabel}</p>
      </div>

      {isLoading ? (
        <div className="dash-card flex min-h-[140px] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
          {error}
        </p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 print:grid-cols-3">
            <StatTile label="Students" value={report.summary.students ?? 0} />
            <StatTile label="Pods" value={report.summary.pods ?? 0} />
            <StatTile label="Cohorts" value={report.summary.cohorts ?? 0} />
            <StatTile label="Matched seats" value={report.summary.matched ?? 0} />
            <StatTile label="Pods w/o leader" value={report.summary.podsWithoutLeader ?? 0} />
            <StatTile label="Avg progress" value={`${report.summary.avgProgress ?? 0}%`} />
          </div>

          <Card title="Study pods" description={`${report.groups?.length ?? 0} groups`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[40rem] text-left text-[12px]">
                <thead>
                  <tr className="border-b border-border text-muted">
                    <th className="py-2 pr-3 font-semibold">Pod</th>
                    <th className="py-2 pr-3 font-semibold">Course</th>
                    <th className="py-2 pr-3 font-semibold">Leader</th>
                    <th className="py-2 pr-3 font-semibold">Members</th>
                    <th className="py-2 font-semibold">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {(report.groups ?? []).map((group) => (
                    <tr key={group.id} className="border-b border-border/70">
                      <td className="py-2 pr-3 font-medium text-ink">{group.title}</td>
                      <td className="py-2 pr-3 text-muted">{group.course || '—'}</td>
                      <td className="py-2 pr-3 text-ink">{group.leader?.name ?? 'Unassigned'}</td>
                      <td className="py-2 pr-3 text-muted">{group.memberCount}</td>
                      <td className="py-2 text-ink">{group.progress ?? 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Students" description={`${report.students?.length ?? 0} directory rows`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[32rem] text-left text-[12px]">
                <thead>
                  <tr className="border-b border-border text-muted">
                    <th className="py-2 pr-3 font-semibold">Name</th>
                    <th className="py-2 pr-3 font-semibold">Email</th>
                    <th className="py-2 font-semibold">Student ID</th>
                  </tr>
                </thead>
                <tbody>
                  {(report.students ?? []).slice(0, 200).map((student) => {
                    const name =
                      student.name ??
                      student.fullName ??
                      [student.firstName, student.lastName].filter(Boolean).join(' ') ??
                      'Student'
                    return (
                      <tr key={student.id ?? student.email} className="border-b border-border/70">
                        <td className="py-2 pr-3 font-medium text-ink">{name}</td>
                        <td className="py-2 pr-3 text-muted">{student.email ?? '—'}</td>
                        <td className="py-2 text-muted">
                          {student.studentId ?? student.schoolId ?? '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <p className="print:hidden text-[11px] text-muted">
            Source: {report.source === 'api' ? 'GET /api/admin/reports' : 'composed from admin APIs'} ·{' '}
            {generatedLabel}
          </p>
        </>
      )}
    </PageShell>
  )
}
