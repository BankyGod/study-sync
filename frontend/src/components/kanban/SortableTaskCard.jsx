import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TaskCard } from '@/components/kanban/TaskCard'
import { useWorkspaceLeader } from '@/hooks/useWorkspaceLeader'
import { useWorkspaceTasks } from '@/context/WorkspaceTasksContext'
import {
  REVIEW_STATUS,
  canManageTask,
  canModerateTask,
  canProgressTask,
  canReviewTask,
  getTaskColumnId,
  isTaskStalled,
} from '@/services/workspaceTaskService'
import { cn } from '@/utils/cn'

export function SortableTaskCard({ task }) {
  const { isLeader, userId } = useWorkspaceLeader()
  const {
    columns,
    openEditTaskModal,
    deleteTask,
    markProgress,
    approveRegress,
    rejectRegress,
    reviewTask,
    openTaskDetails,
  } = useWorkspaceTasks()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const status = getTaskColumnId(task, columns)
  const canManage = canManageTask(task, userId, { isLeader })
  const canProgress = canProgressTask(task, userId)
  const pending = task.pendingRegressRequest
  const canResolveRegress = Boolean(pending && canModerateTask(task, userId, { isLeader }))

  const handleRequestChanges = () => {
    const note = window.prompt('What needs to change? The assignee will see this note.')
    if (note === null) return
    reviewTask(task.id, REVIEW_STATUS.CHANGES_REQUESTED, note)
  }

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && 'z-10 opacity-40')}>
      <TaskCard
        title={task.title}
        footer={task.footer}
        assignee={task.assignee}
        variant={task.variant}
        status={status}
        priority={task.priority}
        reviewStatus={task.reviewStatus}
        reviewNote={task.reviewNote}
        isStalled={isTaskStalled({ ...task, status })}
        canReview={canReviewTask(task, userId, { isLeader })}
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
        onApproveReview={() => reviewTask(task.id, REVIEW_STATUS.APPROVED)}
        onRequestChanges={handleRequestChanges}
        onOpenDetails={() => openTaskDetails(task.id)}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}
