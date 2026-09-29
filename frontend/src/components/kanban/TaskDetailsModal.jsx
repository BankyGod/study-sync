import { useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { AlertTriangle, BellRing } from 'lucide-react'
import { Modal } from '@/components/common/Modal'
import { useWorkspaceLeader } from '@/hooks/useWorkspaceLeader'
import { useWorkspaceTasks } from '@/context/WorkspaceTasksContext'
import {
  STALL_DAYS,
  canNudgeTask,
  describeActivity,
  getLastActivityAt,
  getTaskActivity,
  isAwaitingReview,
  isTaskStalled,
} from '@/services/workspaceTaskService'

const STATUS_LABELS = {
  todo: 'To do',
  in_progress: 'In progress',
  completed: 'Done',
}

function formatWhen(value) {
  if (!value) return ''
  const text = String(value)
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text}T12:00:00` : text)
  if (Number.isNaN(date.getTime())) return ''
  return format(date, 'MMM d, h:mm a')
}

function DetailRow({ label, children }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">{children}</dd>
    </div>
  )
}

export function TaskDetailsModal() {
  const { isLeader, userId } = useWorkspaceLeader()
  const { detailsTask: task, closeTaskDetails, nudgeMember } = useWorkspaceTasks()
  const [isNudging, setIsNudging] = useState(false)

  if (!task) return null

  const activity = getTaskActivity(task)
  const lastActivity = getLastActivityAt(task)
  const stalled = isTaskStalled(task)
  const statusLabel = isAwaitingReview(task)
    ? 'Awaiting leader review'
    : (STATUS_LABELS[task.status] ?? 'To do')

  const handleNudge = async () => {
    const message = window.prompt(
      `Send ${task.assignee?.name ?? 'the assignee'} a reminder about this task:`,
      `Quick check-in on "${task.title}". How is it going?`,
    )
    if (message === null) return
    setIsNudging(true)
    const sent = await nudgeMember({ userId: task.assignee.id, taskId: task.id, message })
    setIsNudging(false)
    if (sent) window.alert('Reminder sent.')
  }

  return (
    <Modal open onClose={closeTaskDetails} title="Task details">
      <h3 className="break-words text-base font-semibold text-ink">{task.title}</h3>

      {stalled ? (
        <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          No progress for more than {STALL_DAYS} days.
        </p>
      ) : null}

      <dl className="mt-4 grid grid-cols-2 gap-3">
        <DetailRow label="Status">{statusLabel}</DetailRow>
        <DetailRow label="Assignee">{task.assignee?.name ?? 'Unassigned'}</DetailRow>
        <DetailRow label="Due">
          {task.dueDate ? format(new Date(`${task.dueDate}T12:00:00`), 'EEE, MMM d') : 'No due date'}
        </DetailRow>
        <DetailRow label="Priority">
          {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'None'}
        </DetailRow>
        <DetailRow label="Last activity">
          {lastActivity ? formatDistanceToNow(lastActivity, { addSuffix: true }) : 'None yet'}
        </DetailRow>
        <DetailRow label="Created by">{task.createdBy?.name ?? 'Unknown'}</DetailRow>
      </dl>

      {task.reviewNote ? (
        <div className="mt-4 rounded-lg border border-ochre/30 bg-ochre-soft/50 px-3 py-2">
          <p className="text-xs font-semibold text-ochre">Leader&apos;s review note</p>
          <p className="mt-0.5 text-sm text-ink">{task.reviewNote}</p>
        </div>
      ) : null}

      {canNudgeTask(task, userId, { isLeader }) ? (
        <button
          type="button"
          onClick={handleNudge}
          disabled={isNudging}
          className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-ink transition hover:bg-page disabled:opacity-60"
        >
          <BellRing className="h-4 w-4" />
          {isNudging ? 'Sending…' : `Remind ${task.assignee.name?.split(' ')[0] ?? 'assignee'}`}
        </button>
      ) : null}

      <h4 className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-muted">History</h4>
      {activity.length === 0 ? (
        <p className="mt-2 text-sm text-muted">No activity recorded yet.</p>
      ) : (
        <ol className="mt-2 space-y-3 border-l border-border pl-4">
          {activity.map((entry) => (
            <li key={entry.id ?? `${entry.type}-${entry.at}`} className="relative">
              <span className="absolute -left-[1.3rem] top-1.5 h-2 w-2 rounded-full bg-brand-500" />
              <p className="text-sm text-ink">
                <span className="font-semibold">{entry.actor?.name ?? 'Someone'}</span>{' '}
                {describeActivity(entry)}
              </p>
              {entry.note ? <p className="mt-0.5 text-xs text-muted">“{entry.note}”</p> : null}
              <p className="text-[11px] text-muted">{formatWhen(entry.at)}</p>
            </li>
          ))}
        </ol>
      )}
    </Modal>
  )
}
