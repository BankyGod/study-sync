import { useEffect, useState } from 'react'
import { Card } from '@/components/common/Card'
import { Spinner } from '@/components/common/Spinner'
import { PageHeader, PageShell } from '@/components/layout/PageShell'
import {
  fetchAdminCohorts,
  fetchAdminGroups,
  getAdminErrorMessage,
} from '@/services/adminService'

function getMembers(group) {
  return group.members ?? group.students ?? group.users ?? []
}

function getMemberName(member) {
  const fullName = [member.firstName, member.lastName].filter(Boolean).join(' ')
  return member.name ?? member.fullName ?? (fullName || member.email || 'Student')
}

export function GroupOverviewPage() {
  const [groups, setGroups] = useState([])
  const [cohorts, setCohorts] = useState([])
  const [cohortId, setCohortId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAdminCohorts()
      .then(setCohorts)
      .catch(() => setCohorts([]))
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError('')
      try {
        const params = {}
        if (cohortId) params.cohortId = cohortId
        const { groups: list } = await fetchAdminGroups(params)
        if (!cancelled) setGroups(list)
      } catch (loadError) {
        if (!cancelled) {
          setError(getAdminErrorMessage(loadError, 'Unable to load study groups.'))
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [cohortId])

  return (
    <PageShell className="space-y-5">
      <PageHeader
        eyebrow="Instructor"
        title="Groups"
        description="GET /api/admin/groups — matched study pods"
      />

      <Card title="Filter">
        <label className="block max-w-sm space-y-1">
          <span className="block text-xs font-semibold text-soft">Cohort</span>
          <select
            className="h-9 w-full rounded-md border border-border bg-surface px-2.5 text-[13px]"
            value={cohortId}
            onChange={(event) => setCohortId(event.target.value)}
          >
            <option value="">All cohorts</option>
            {cohorts.map((cohort) => (
              <option key={cohort.id} value={cohort.id}>
                {cohort.name ?? cohort.id}
              </option>
            ))}
          </select>
        </label>
      </Card>

      {isLoading ? (
        <div className="dash-card flex min-h-[140px] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
          {error}
        </p>
      ) : groups.length === 0 ? (
        <p className="text-[13px] text-muted">
          No groups yet. Create a cohort and run matching from Cohorts.
        </p>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => {
            const members = getMembers(group)
            const title = group.name ?? group.title ?? `Pod ${String(group.id).slice(0, 8)}`
            const memberCount = members.length || group.memberCount || 0
            const course =
              group.courseCode ??
              group.course?.code ??
              [group.subject, group.courseNumber].filter(Boolean).join(' ')

            return (
              <Card
                key={group.id}
                title={title}
                description={[
                  `${memberCount} member${memberCount === 1 ? '' : 's'}`,
                  course || null,
                  group.cohortName ?? null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              >
                {members.length === 0 ? (
                  <p className="text-[12px] text-muted">
                    {group.memberCount
                      ? `${group.memberCount} members (names not included in list response).`
                      : 'No member details in this response.'}
                  </p>
                ) : (
                  <ul className="divide-y divide-border">
                    {members.map((member, index) => (
                      <li
                        key={member.id ?? member.userId ?? `${getMemberName(member)}-${index}`}
                        className="flex items-center justify-between gap-3 py-2 text-[13px]"
                      >
                        <span className="font-medium text-ink">{getMemberName(member)}</span>
                        <span className="text-[11px] text-muted">{member.email ?? ''}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
