import { useEffect, useState } from 'react'
import { Card } from '@/components/common/Card'
import { Spinner } from '@/components/common/Spinner'
import { PageHeader, PageShell, StatTile } from '@/components/layout/PageShell'
import { fetchAdminTaskProgress, getAdminErrorMessage } from '@/services/adminService'
import { useAuth } from '@/hooks/useAuth'
import { hasPermission, PERMISSIONS } from '@/utils/staffPermissions'
import { cn } from '@/utils/cn'

export function AdminTaskProgressPage() {
  const { user } = useAuth()
  const [payload, setPayload] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      setError('')
      try {
        const data = await fetchAdminTaskProgress()
        if (!cancelled) setPayload(data)
      } catch (loadError) {
        if (!cancelled) {
          setError(getAdminErrorMessage(loadError, 'Unable to load task progress.'))
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

  if (!hasPermission(user, PERMISSIONS.VIEW_TASK_PROGRESS)) {
    return (
      <PageShell>
        <p className="text-[13px] text-muted">You do not have permission to view task progress.</p>
      </PageShell>
    )
  }

  const items = payload?.items ?? []
  const summary = payload?.summary ?? {}

  return (
    <PageShell className="space-y-5">
      <PageHeader
        eyebrow="Instructor"
        title="Task progress"
        description="Track assigned-task completion across study pods."
      />

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
          <div className="grid gap-3 sm:grid-cols-3">
            <StatTile label="Pods tracked" value={summary.pods ?? items.length} />
            <StatTile label="Avg completion" value={`${summary.avgProgress ?? 0}%`} />
            <StatTile label="Pods without leader" value={summary.podsWithoutLeader ?? 0} />
          </div>

          <div className="space-y-3">
            {items.length === 0 ? (
              <p className="text-[13px] text-muted">No pod progress data yet.</p>
            ) : (
              items.map((item) => {
                const progress = Math.max(0, Math.min(100, Number(item.progress) || 0))
                return (
                  <Card
                    key={item.groupId ?? item.title}
                    title={item.title}
                    description={[item.course, item.leaderName ? `Leader: ${item.leaderName}` : null]
                      .filter(Boolean)
                      .join(' · ')}
                  >
                    <div className="flex items-center justify-between gap-3 text-[12px]">
                      <span className="text-muted">
                        {item.memberCount ?? 0} member{(item.memberCount ?? 0) === 1 ? '' : 's'}
                      </span>
                      <span className="font-semibold tabular-nums text-ink">{progress}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-page">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          progress >= 70
                            ? 'bg-emerald-500'
                            : progress >= 30
                              ? 'bg-brand-500'
                              : 'bg-amber-500',
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[11px] text-muted">
                      Pod completion from assigned tasks (todo → in progress → completed).
                    </p>
                  </Card>
                )
              })
            )}
          </div>
        </>
      )}
    </PageShell>
  )
}
