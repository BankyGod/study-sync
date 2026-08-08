import { useEffect, useState } from 'react'
import { Card } from '@/components/common/Card'
import { Spinner } from '@/components/common/Spinner'
import { ReliabilityScore } from '@/components/reliability/ReliabilityScore'
import { fetchAdminGroups, getAdminErrorMessage } from '@/services/adminService'

function getMembers(group) {
  return group.members ?? group.students ?? group.users ?? []
}

function getMemberName(member) {
  const fullName = [member.firstName, member.lastName].filter(Boolean).join(' ')
  return member.name ?? member.fullName ?? (fullName || member.email || 'Student')
}

function getReliability(member) {
  const score =
    member.reliability ??
    member.reliabilityScore ??
    member.score ??
    member.profile?.reliabilityScore
  return typeof score === 'number' ? score : null
}

export function GroupOverviewPage() {
  const [groups, setGroups] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError('')
      try {
        const { groups: list } = await fetchAdminGroups()
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
  }, [])

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold text-ink">Team overview</h1>
        <p className="mt-1 text-sm text-muted">
          All clustered teams with reliability flags for at-risk participants.
        </p>
      </header>

      {isLoading ? (
        <div className="flex min-h-[180px] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : groups.length === 0 ? (
        <p className="text-sm text-muted">No groups yet. Run matching from Cohorts to create pods.</p>
      ) : (
        groups.map((group) => {
          const members = getMembers(group)
          const title = group.name ?? group.title ?? `Pod ${String(group.id).slice(0, 8)}`
          return (
            <Card
              key={group.id}
              title={title}
              description={`${members.length || group.memberCount || 0} members${
                group.courseCode ? ` · ${group.courseCode}` : ''
              }`}
            >
              {members.length === 0 ? (
                <p className="text-sm text-muted">
                  {group.memberCount
                    ? `${group.memberCount} members (detail not included in list response).`
                    : 'No member details returned for this group.'}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted">
                        <th className="py-2 font-medium">Student</th>
                        <th className="py-2 font-medium">Reliability</th>
                        <th className="py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member, index) => {
                        const reliability = getReliability(member)
                        const flagged =
                          member.flagged ||
                          (typeof reliability === 'number' && reliability < 50)
                        return (
                          <tr
                            key={member.id ?? member.userId ?? `${getMemberName(member)}-${index}`}
                            className="border-b border-border/60"
                          >
                            <td className="py-3 font-medium text-ink">{getMemberName(member)}</td>
                            <td className="py-3">
                              {typeof reliability === 'number' ? (
                                <ReliabilityScore score={reliability} size="sm" showLabel={false} />
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                            <td className="py-3">
                              {flagged ? (
                                <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                                  Low reliability
                                </span>
                              ) : (
                                <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                                  On track
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )
        })
      )}
    </div>
  )
}
