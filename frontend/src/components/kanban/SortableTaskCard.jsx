import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TaskCard } from '@/components/kanban/TaskCard'
import { useAuth } from '@/hooks/useAuth'
import { useWorkspaceTasks } from '@/context/WorkspaceTasksContext'
import { canManageTask } from '@/services/workspaceTaskService'
import { cn } from '@/utils/cn'

export function SortableTaskCard({ task }) {
  const { user } = useAuth()
  const { openEditTaskModal, deleteTask } = useWorkspaceTasks()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const canManage = canManageTask(task, user?.id)

  return (
    <div ref={setNodeRef} style={style} className={cn('touch-none', isDragging && 'z-10 opacity-40')}>
      <TaskCard
        title={task.title}
        footer={task.footer}
        assignee={task.assignee}
        variant={task.variant}
        isDragging={isDragging}
        canManage={canManage}
        onEdit={() => openEditTaskModal(task)}
        onDelete={() => deleteTask(task.id)}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}
