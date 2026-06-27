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
        'rounded-xl border p-3 shadow-sm transition',
        variant === 'highlight' && 'border-amber-200 bg-amber-50/80',
        variant === 'completed' && 'border-emerald-200 bg-emerald-50/70',
        variant === 'default' && 'border-slate-200/80 bg-white',
        isDragging && 'shadow-md ring-2 ring-violet-200',
      )}
    >
      <div className="flex items-start gap-2">
        {dragHandleProps ? (
          <button
            type="button"
            className={cn(
              'mt-0.5 flex h-7 w-6 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600',
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
            <p className="text-sm font-medium leading-snug text-slate-900">{title}</p>
            {canManage ? <TaskCardActionsMenu onEdit={onEdit} onDelete={onDelete} /> : null}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-xs text-slate-500">{footer}</span>
            {assignee ? (
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-white',
                  assignee.color,
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
