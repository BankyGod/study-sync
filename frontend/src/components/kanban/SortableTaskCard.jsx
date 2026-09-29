import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TaskCard } from '@/components/kanban/TaskCard'
import { useWorkspace } from '@/context/WorkspaceContext'
import { useWorkspaceLeader } from '@/hooks/useWorkspaceLeader'
import { useWorkspaceTasks } from '@/context/WorkspaceTasksContext'
import {
  REVIEW_STATUS,
  canManageTask,
  canModerateTask,
  canProgressTask,
  canReviewTask,
  getCompletionBlocker,
  getTaskColumnId,
  getTaskSubmissions,
  isDocumentTask,
  isTaskStalled,
  requiresLeaderApproval,
} from '@/services/workspaceTaskService'
import { downloadTaskSubmission } from '@/services/workspaceFileService'
import { cn } from '@/utils/cn'

export function SortableTaskCard({ task }) {
  const { groupId } = useWorkspace()
  const { isLeader, leaderId, userId } = useWorkspaceLeader()
  const {
    columns,
    openEditTaskModal,
    deleteTask,
    markProgress,
    approveRegress,
    rejectRegress,
    reviewTask,
    openTaskDetails,
    openDocumentSubmit,
  } = useWorkspaceTasks()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const status = getTaskColumnId(task, columns)
  const taskWithStatus = { ...task, status }
  const isDocument = isDocumentTask(task)
  const canManage = canManageTask(task, userId, { isLeader })
  const canProgress = canProgressTask(task, userId)
  const pending = task.pendingRegressRequest
  const canResolveRegress = Boolean(pending && canModerateTask(task, userId, { isLeader }))

  const handleRequestChanges = () => {
    const note = window.prompt('Why are you declining this step? The assignee will see this note.')
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
        pendingAdvanceRequest={task.pendingAdvanceRequest}
        needsApproval={requiresLeaderApproval({ isLeader, leaderId })}
        isDocument={isDocument}
        submissions={getTaskSubmissions(task)}
        completionBlocker={isDocument && status === 'todo' ? getCompletionBlocker(taskWithStatus) : null}
        onOpenSubmission={(submission) => downloadTaskSubmission(groupId, submission)}
        isStalled={isTaskStalled(taskWithStatus)}
        canReview={canReviewTask(task, userId, { isLeader })}
        isDragging={isDragging}
        canManage={canManage}
        canProgress={canProgress}
        pendingRegressRequest={pending}
        canResolveRegress={canResolveRegress}
        onEdit={() => openEditTaskModal(task)}
        onDelete={() => deleteTask(task.id)}
        onStart={() => markProgress(task.id, 'start')}
        onComplete={() =>
          isDocument ? openDocumentSubmit(task.id) : markProgress(task.id, 'complete')
        }
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
