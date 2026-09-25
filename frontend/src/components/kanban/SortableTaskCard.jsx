import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TaskCard } from '@/components/kanban/TaskCard'
import { useAuth } from '@/hooks/useAuth'
import { useWorkspace } from '@/context/WorkspaceContext'
import { useWorkspaceTasks } from '@/context/WorkspaceTasksContext'
import {
  canManageTask,
  canModerateTask,
  canProgressTask,
  getTaskColumnId,
} from '@/services/workspaceTaskService'
import { isCurrentUserLeader } from '@/utils/groupMembers'
import { cn } from '@/utils/cn'

export function SortableTaskCard({ task }) {
  const { user } = useAuth()
  const { leaderId, members } = useWorkspace()
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

  const isLeader = isCurrentUserLeader(user?.id, { leaderId, members })
  const status = getTaskColumnId(task, columns)
  const canManage = canManageTask(task, user?.id, { isLeader })
  const canProgress = canProgressTask(task, user?.id)
  const pending = task.pendingRegressRequest
  const canResolveRegress = Boolean(pending && canModerateTask(task, user?.id, { isLeader }))

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
