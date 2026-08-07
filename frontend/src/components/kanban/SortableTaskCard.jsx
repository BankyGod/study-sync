import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TaskCard } from '@/components/kanban/TaskCard'
import { useAuth } from '@/hooks/useAuth'
import { useWorkspaceTasks } from '@/context/WorkspaceTasksContext'
import { canManageTask, canProgressTask, getTaskColumnId } from '@/services/workspaceTaskService'
import { cn } from '@/utils/cn'

export function SortableTaskCard({ task }) {
  const { user } = useAuth()
  const {
    columns,
    openEditTaskModal,
    deleteTask,
    markProgress,
    approveRegress,
    rejectRegress,
  } = useWorkspaceTasks()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const status = getTaskColumnId(task, columns)
  const canManage = canManageTask(task, user?.id)
  const canProgress = canProgressTask(task, user?.id)
  const pending = task.pendingRegressRequest
  const canResolveRegress = Boolean(pending && canManage)

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && 'z-10 opacity-40')}>
      <TaskCard
        title={task.title}
        footer={task.footer}
        assignee={task.assignee}
        variant={task.variant}
        status={status}
        isDragging={isDragging}
        canManage={canManage}
        canProgress={canProgress}
        pendingRegressRequest={pending}
        canResolveRegress={canResolveRegress}
        onEdit={() => openEditTaskModal(task)}
        onDelete={() => deleteTask(task.id)}
        onStart={() => markProgress(task.id, 'start')}
        onComplete={() => markProgress(task.id, 'complete')}
        onApproveRegress={() => approveRegress(task.id, pending.id)}
        onRejectRegress={() => rejectRegress(task.id, pending.id)}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}
