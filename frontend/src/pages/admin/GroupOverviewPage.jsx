import { useEffect, useState } from 'react'
import { Crown } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Spinner } from '@/components/common/Spinner'
import { PageHeader, PageShell } from '@/components/layout/PageShell'
import {
  assignAdminGroupLeader,
  fetchAdminCohorts,
  fetchAdminGroups,
  getAdminErrorMessage,
} from '@/services/adminService'
import { useAuth } from '@/hooks/useAuth'
import { getGroupLeader, normalizeGroupMembers } from '@/utils/groupMembers'
import { hasPermission, PERMISSIONS } from '@/utils/staffPermissions'

function getMembers(group) {
  return normalizeGroupMembers(group.members ?? group.students ?? group.users ?? [], group)
}

function getMemberName(member) {
  return member.name ?? member.fullName ?? member.email ?? 'Student'
}

export function GroupOverviewPage() {
  const { user } = useAuth()
  const canAssignLeaders = hasPermission(user, PERMISSIONS.ASSIGN_LEADERS)
  const [groups, setGroups] = useState([])
  const [cohorts, setCohorts] = useState([])
  const [cohortId, setCohortId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [busyGroupId, setBusyGroupId] = useState(null)

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

  const handleAssignLeader = async (group, memberId) => {
    const groupId = group.id ?? group.groupId
    if (!groupId || !memberId) return
    setBusyGroupId(groupId)
    setActionError('')
    try {
      await assignAdminGroupLeader(groupId, memberId)
      setGroups((current) =>
        current.map((item) => {
          if (String(item.id ?? item.groupId) !== String(groupId)) return item
          const members = normalizeGroupMembers(
            (item.members ?? item.students ?? item.users ?? []).map((member) => ({
              ...member,
              role: String(member.id ?? member.userId) === String(memberId) ? 'leader' : 'member',
              isLeader: String(member.id ?? member.userId) === String(memberId),
            })),
            { ...item, leaderId: memberId },
          )
          return {
            ...item,
            leaderId: memberId,
            members,
            students: item.students ? members : item.students,
            users: item.users ? members : item.users,
          }
        }),
      )
    } catch (assignError) {
      setActionError(
        getAdminErrorMessage(
          assignError,
          'Unable to assign leader. Backend may need PUT /api/admin/groups/:id/leader.',
        ),
      )
    } finally {
      setBusyGroupId(null)
    }
  }

  return (
    <PageShell className="space-y-5">
      <PageHeader
        eyebrow="Instructor"
        title="Groups"
        description="Manage pods, membership, and group leaders."
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

      {actionError ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
          {actionError}
        </p>
      ) : null}

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
            const leader = getGroupLeader(members)
            const title = group.name ?? group.title ?? `Pod ${String(group.id).slice(0, 8)}`
            const memberCount = members.length || group.memberCount || 0
            const course =
              group.courseCode ??
              group.course?.code ??
              [group.subject, group.courseNumber].filter(Boolean).join(' ')
            const groupId = group.id ?? group.groupId

            return (
              <Card
                key={groupId}
                title={title}
                description={[
                  `${memberCount} member${memberCount === 1 ? '' : 's'}`,
                  course || null,
                  group.cohortName ?? null,
                  leader ? `Leader: ${leader.name}` : 'No leader assigned',
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
                        key={member.id ?? `${getMemberName(member)}-${index}`}
                        className="flex flex-wrap items-center justify-between gap-3 py-2 text-[13px]"
                      >
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 font-medium text-ink">
                            {getMemberName(member)}
                            {member.isLeader ? (
                              <span className="inline-flex items-center gap-0.5 rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
                                <Crown className="h-3 w-3" />
                                Leader
                              </span>
                            ) : null}
                          </p>
                          <p className="text-[11px] text-muted">{member.email ?? ''}</p>
                        </div>
                        {canAssignLeaders && !member.isLeader ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            disabled={busyGroupId === groupId}
                            onClick={() => handleAssignLeader(group, member.id)}
                          >
                            Make leader
                          </Button>
                        ) : null}
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
