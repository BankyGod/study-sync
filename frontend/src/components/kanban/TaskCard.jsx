import { AlertTriangle, Check, Clock, GripVertical, History, Play } from 'lucide-react'
import { TaskCardActionsMenu } from '@/components/kanban/TaskCardActionsMenu'
import { cn } from '@/utils/cn'

const PRIORITY_STYLES = {
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-ochre-soft text-ochre border-ochre/30',
  low: 'bg-page text-muted border-border',
}

export function TaskCard({
  title,
  footer,
  assignee,
  variant = 'default',
  isDragging = false,
  canManage = false,
  canProgress = false,
  status = 'todo',
  priority = null,
  reviewStatus = null,
  reviewNote = null,
  pendingAdvanceRequest = null,
  needsApproval = false,
  isStalled = false,
  canReview = false,
  pendingRegressRequest = null,
  canResolveRegress = false,
  onEdit,
  onDelete,
  onStart,
  onComplete,
  onApproveRegress,
  onRejectRegress,
  onApproveReview,
  onRequestChanges,
  onOpenDetails,
  dragHandleProps,
}) {
  const awaitingReview = Boolean(pendingAdvanceRequest)
  const pendingStepLabel =
    pendingAdvanceRequest?.targetStatus === 'completed' ? 'mark this done' : 'start this task'
  const sentBack = !awaitingReview && status !== 'completed' && reviewStatus === 'changes_requested'

  return (
    <article
      className={cn(
        'rounded-lg border border-border bg-surface p-3 transition',
        variant === 'highlight' && 'border-ochre/40 bg-ochre-soft/50',
        variant === 'completed' && 'border-brand-200 bg-brand-50/60',
        awaitingReview && 'border-sky-200 bg-sky-50/60',
        isDragging && 'ring-2 ring-brand-200',
      )}
    >
      <div className="flex items-start gap-1.5">
        {dragHandleProps ? (
          <button
            type="button"
            className={cn(
              'mt-0.5 flex h-10 w-9 shrink-0 touch-none items-center justify-center rounded-md text-muted transition hover:bg-page hover:text-ink',
              isDragging ? 'cursor-grabbing' : 'cursor-grab',
            )}
            aria-label="Drag task"
            {...dragHandleProps}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="break-words text-sm font-medium leading-snug text-ink">{title}</p>
            <div className="flex shrink-0 items-center">
              {onOpenDetails ? (
                <button
                  type="button"
                  onClick={onOpenDetails}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition hover:bg-page hover:text-ink"
                  aria-label="Task details and history"
                  title="Details and history"
                >
                  <History className="h-4 w-4" />
                </button>
              ) : null}
              {canManage ? <TaskCardActionsMenu onEdit={onEdit} onDelete={onDelete} /> : null}
            </div>
          </div>

          {priority || isStalled || awaitingReview ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {priority ? (
                <span
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                    PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.low,
                  )}
                >
                  {priority}
                </span>
              ) : null}
              {isStalled ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                  <AlertTriangle className="h-3 w-3" />
                  Stalled
                </span>
              ) : null}
              {awaitingReview ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-surface px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                  <Clock className="h-3 w-3" />
                  Awaiting approval
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="min-w-0 truncate text-xs text-muted">{footer}</span>
            {assignee ? (
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-surface',
                  assignee.color || 'bg-brand-600',
                )}
                title={assignee.name}
              >
                {assignee.initials}
              </div>
            ) : null}
          </div>

          {sentBack ? (
            <div className="mt-3 rounded-lg border border-ochre/30 bg-ochre-soft/50 px-3 py-2">
              <p className="text-xs font-semibold text-ochre">Leader declined the last step</p>
              {reviewNote ? <p className="mt-0.5 text-xs text-ink">{reviewNote}</p> : null}
            </div>
          ) : null}

          {awaitingReview ? (
            <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50/70 px-3 py-2">
              <p className="text-xs font-semibold text-sky-800">
                {pendingAdvanceRequest.requestedBy?.name ?? 'A member'} asked to {pendingStepLabel}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {canReview
                  ? 'The task moves only after you approve.'
                  : 'Waiting for the group leader to approve.'}
              </p>
              {canReview ? (
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={onApproveReview}
                    className="min-h-9 flex-1 rounded-md bg-brand-600 px-2 text-xs font-semibold text-surface"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={onRequestChanges}
                    className="min-h-9 flex-1 rounded-md border border-border bg-surface px-2 text-xs font-semibold text-ink"
                  >
                    Decline
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {pendingRegressRequest ? (
            <div className="mt-3 rounded-lg border border-ochre/30 bg-ochre-soft/50 px-3 py-2">
              <p className="text-xs font-semibold text-ochre">Move-back requested</p>
              <p className="mt-0.5 text-xs text-muted">
                To {pendingRegressRequest.targetStatus?.replace('_', ' ') || 'earlier column'}
                {pendingRegressRequest.requestedBy?.name
                  ? ` · by ${pendingRegressRequest.requestedBy.name}`
                  : ''}
              </p>
              {canResolveRegress ? (
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={onApproveRegress}
                    className="min-h-9 flex-1 rounded-md bg-brand-600 px-2 text-xs font-semibold text-surface"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={onRejectRegress}
                    className="min-h-9 flex-1 rounded-md border border-border bg-surface px-2 text-xs font-semibold text-ink"
                  >
                    Reject
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {canProgress && !pendingRegressRequest && !awaitingReview ? (
            <div className="mt-3 flex gap-2">
              {status === 'todo' ? (
                <button
                  type="button"
                  onClick={onStart}
                  className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-page px-2 text-xs font-semibold text-ink transition hover:bg-brand-50"
                >
                  <Play className="h-3.5 w-3.5" />
                  {needsApproval ? 'Ask to start' : 'Start'}
                </button>
              ) : null}
              {status === 'todo' || status === 'in_progress' ? (
                <button
                  type="button"
                  onClick={onComplete}
                  className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-md bg-brand-600 px-2 text-xs font-semibold text-surface transition hover:bg-brand-700"
                >
                  <Check className="h-3.5 w-3.5" />
                  {needsApproval ? 'Ask to finish' : 'Done'}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}
