import { useMemo, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { AlertTriangle, BellRing, ChevronDown, Users } from 'lucide-react'
import { useWorkspace } from '@/context/WorkspaceContext'
import { useWorkspaceTasks } from '@/context/WorkspaceTasksContext'
import { useWorkspaceLeader } from '@/hooks/useWorkspaceLeader'
import { summarizeTeamProgress } from '@/services/workspaceTaskService'
import { cn } from '@/utils/cn'

function Badge({ children, tone = 'neutral' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
        tone === 'danger' && 'bg-red-50 text-red-700',
        tone === 'info' && 'bg-sky-50 text-sky-700',
        tone === 'neutral' && 'bg-page text-muted',
      )}
    >
      {children}
    </span>
  )
}

function MemberRow({ row, isSelf, canNudge, onNudge, onOpenTask }) {
  const { member } = row
  const openTasks = row.todo + row.inProgress

  return (
    <li className="py-2.5">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-surface',
            member.color || member.avatarColor || 'bg-brand-600',
          )}
        >
          {member.initials ?? member.name?.slice(0, 2).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="truncate text-sm font-medium text-ink">
              {member.name}
              {isSelf ? <span className="text-muted"> (you)</span> : null}
            </p>
            {member.isLeader ? (
              <span className="rounded bg-brand-50 px-1 text-[9px] font-semibold uppercase tracking-wide text-brand-700">
                Leader
              </span>
            ) : null}
            {row.overdue > 0 ? (
              <Badge tone="danger">
                <AlertTriangle className="h-3 w-3" />
                {row.overdue} overdue
              </Badge>
            ) : null}
            {row.stalled > 0 ? <Badge tone="danger">{row.stalled} stalled</Badge> : null}
            {row.inReview > 0 ? <Badge tone="info">{row.inReview} awaiting approval</Badge> : null}
          </div>

          {row.total > 0 ? (
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-page">
                <div
                  className="h-full rounded-full bg-brand-600 transition-all"
                  style={{ width: `${row.percent}%` }}
                />
              </div>
              <span className="w-9 text-right text-[11px] font-semibold tabular-nums text-ink">
                {row.percent}%
              </span>
            </div>
          ) : null}

          <p className="mt-1 text-[11px] text-muted">
            {row.total === 0
              ? 'No tasks assigned'
              : `${row.completed}/${row.total} done · ${row.inProgress} in progress · ${row.todo} to do`}
            {row.lastActivityAt
              ? ` · active ${formatDistanceToNow(row.lastActivityAt, { addSuffix: true })}`
              : ''}
          </p>
        </div>

        <div className="flex shrink-0 gap-1">
          {row.urgentTaskId ? (
            <button
              type="button"
              onClick={() => onOpenTask(row.urgentTaskId)}
              className="min-h-9 rounded-md px-2 text-xs font-semibold text-muted hover:bg-page hover:text-ink"
            >
              View
            </button>
          ) : null}
          {canNudge && openTasks > 0 ? (
            <button
              type="button"
              onClick={() => onNudge(row)}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted transition hover:bg-page hover:text-ink"
              aria-label={`Remind ${member.name}`}
              title={`Remind ${member.name}`}
            >
              <BellRing className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
    </li>
  )
}

export function TeamProgressPanel() {
  const { members } = useWorkspace()
  const { columns, nudgeMember, openTaskDetails } = useWorkspaceTasks()
  const { isLeader, userId } = useWorkspaceLeader()
  const [isOpen, setIsOpen] = useState(true)

  const rows = useMemo(() => summarizeTeamProgress(columns, members), [columns, members])
  const needsAttention = rows.filter((row) => row.overdue + row.stalled > 0).length
  const totals = rows.reduce(
    (acc, row) => ({ done: acc.done + row.completed, total: acc.total + row.total }),
    { done: 0, total: 0 },
  )

  if (members.length === 0) return null

  const handleNudge = async (row) => {
    const message = window.prompt(
      `Send ${row.member.name} a reminder:`,
      'Quick check-in on your tasks. Let the pod know if you are stuck.',
    )
    if (message === null) return
    const sent = await nudgeMember({
      userId: row.member.id,
      taskId: row.urgentTaskId,
      message,
    })
    if (sent) window.alert('Reminder sent.')
  }

  return (
    <section className="mb-4 rounded-lg border border-border bg-surface p-3 sm:p-4">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex min-w-0 items-center gap-2">
          <Users className="h-4 w-4 shrink-0 text-muted" />
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-ink">Team progress</h2>
            <p className="text-xs text-muted">
              {totals.done}/{totals.total} tasks done across the pod
              {needsAttention > 0
                ? ` · ${needsAttention} member${needsAttention === 1 ? '' : 's'} need attention`
                : ''}
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-muted transition', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen ? (
        <ul className="mt-2 divide-y divide-border">
          {rows.map((row) => (
            <MemberRow
              key={row.member.id}
              row={row}
              isSelf={String(row.member.id) === String(userId)}
              canNudge={isLeader && String(row.member.id) !== String(userId)}
              onNudge={handleNudge}
              onOpenTask={openTaskDetails}
            />
          ))}
        </ul>
      ) : null}
    </section>
  )
}
