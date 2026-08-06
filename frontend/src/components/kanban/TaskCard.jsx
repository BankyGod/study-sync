import { GripVertical } from 'lucide-react'
import { TaskCardActionsMenu } from '@/components/kanban/TaskCardActionsMenu'
import { cn } from '@/utils/cn'

export function TaskCard({
  title,
  footer,
  assignee,
  variant = 'default',
  isDragging = false,
  canManage = false,
  onEdit,
  onDelete,
  dragHandleProps,
}) {
  return (
    <article
      className={cn(
        'rounded-lg border border-border bg-surface p-3 transition',
        variant === 'highlight' && 'border-ochre/40 bg-ochre-soft/50',
        variant === 'completed' && 'border-brand-200 bg-brand-50/60',
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
            {canManage ? <TaskCardActionsMenu onEdit={onEdit} onDelete={onDelete} /> : null}
          </div>

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
        </div>
      </div>
    </article>
  )
}
