import { useMemo, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { KanbanColumn } from '@/components/kanban/KanbanColumn'
import { MyTaskProgress } from '@/components/kanban/MyTaskProgress'
import { TaskCard } from '@/components/kanban/TaskCard'
import { TeamProgressPanel } from '@/components/kanban/TeamProgressPanel'
import { Spinner } from '@/components/common/Spinner'
import { useAuth } from '@/hooks/useAuth'
import { useWorkspaceLeader } from '@/hooks/useWorkspaceLeader'
import { useWorkspaceTasks } from '@/context/WorkspaceTasksContext'
import {
  COLUMN_IDS,
  REVIEW_STATUS,
  canProgressTask,
  findTaskContainer,
  getCompletionBlocker,
  isAssignedTo,
  isBackwardMove,
  normalizeTaskForColumn,
  requiresLeaderApproval,
  summarizeMyTasks,
  toKanbanTask,
} from '@/services/workspaceTaskService'

function isForwardMove(fromStatus, toStatus) {
  return fromStatus !== toStatus && !isBackwardMove(fromStatus, toStatus)
}

export function WorkspaceKanban() {
  const { user } = useAuth()
  const { isLeader, leaderId } = useWorkspaceLeader()
  const requiresReview = requiresLeaderApproval({ isLeader, leaderId })
  const {
    columns,
    setColumns,
    commitColumns,
    reloadColumns,
    openAddTaskModal,
    markProgress,
    openDocumentSubmit,
    isLoading,
  } = useWorkspaceTasks()
  const dragOriginRef = useRef(null)
  const [activeTask, setActiveTask] = useState(null)
  const [showMineOnly, setShowMineOnly] = useState(false)

  const summary = useMemo(() => summarizeMyTasks(columns, user?.id), [columns, user?.id])
  const visibleTasks = (columnId) =>
    showMineOnly
      ? columns[columnId].filter((task) => isAssignedTo(task, user?.id))
      : columns[columnId]

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  const handleDragStart = ({ active }) => {
    const containerId = findTaskContainer(columns, active.id)
    if (!containerId) return
    dragOriginRef.current = containerId
    const task = columns[containerId].find((item) => item.id === active.id)
    setActiveTask(task ?? null)
  }

  const handleDragOver = ({ active, over }) => {
    if (!over) return

    setColumns((prev) => {
      const activeContainer = findTaskContainer(prev, active.id)
      const overContainer =
        findTaskContainer(prev, over.id) ?? (COLUMN_IDS.includes(over.id) ? over.id : null)

      if (!activeContainer || !overContainer || activeContainer === overContainer) {
        return prev
      }

      const activeItems = [...prev[activeContainer]]
      const overItems = [...prev[overContainer]]
      const activeIndex = activeItems.findIndex((task) => task.id === active.id)
      const overIndex = overItems.findIndex((task) => task.id === over.id)

      if (activeIndex === -1) return prev

      const [movedTask] = activeItems.splice(activeIndex, 1)
      const normalizedTask = toKanbanTask(
        normalizeTaskForColumn(
          requiresReview
            ? movedTask
            : {
                ...movedTask,
                pendingAdvanceRequest: null,
                reviewStatus:
                  movedTask.reviewStatus === REVIEW_STATUS.PENDING ? null : movedTask.reviewStatus,
              },
          overContainer,
        ),
      )

      let insertIndex = overItems.length
      if (overIndex >= 0) {
        const isBelowOverItem =
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height / 2
        insertIndex = overIndex + (isBelowOverItem ? 1 : 0)
      }

      overItems.splice(insertIndex, 0, normalizedTask)

      return {
        ...prev,
        [activeContainer]: activeItems,
        [overContainer]: overItems,
      }
    })
  }

  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null)
    const origin = dragOriginRef.current
    dragOriginRef.current = null

    if (!over) {
      reloadColumns()
      return
    }

    const destination = findTaskContainer(columns, active.id)
    if (destination === 'completed' && origin && origin !== 'completed') {
      const task = columns.completed.find((item) => item.id === active.id)
      const blocker = getCompletionBlocker({ ...task, status: origin })
      if (blocker) {
        reloadColumns()
        if (origin === 'in_progress' && canProgressTask(task, user?.id)) {
          openDocumentSubmit(active.id)
        } else {
          window.alert(blocker)
        }
        return
      }
    }
    if (requiresReview && origin && destination && isForwardMove(origin, destination)) {
      const task = columns[destination].find((item) => item.id === active.id)
      reloadColumns()
      if (task?.pendingAdvanceRequest) {
        window.alert('This task is already waiting for the leader’s approval.')
      } else if (!canProgressTask(task, user?.id)) {
        window.alert('Only the person assigned to this task can ask to move it forward.')
      } else {
        markProgress(active.id, destination === 'completed' ? 'complete' : 'start')
      }
      return
    }

    commitColumns((prev) => {
      const activeContainer = findTaskContainer(prev, active.id)
      const overContainer =
        findTaskContainer(prev, over.id) ?? (COLUMN_IDS.includes(over.id) ? over.id : null)

      if (!activeContainer || !overContainer) return prev

      if (activeContainer === overContainer) {
        const activeIndex = prev[activeContainer].findIndex((task) => task.id === active.id)
        const overIndex = prev[overContainer].findIndex((task) => task.id === over.id)

        if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
          return {
            ...prev,
            [activeContainer]: arrayMove(prev[activeContainer], activeIndex, overIndex),
          }
        }
      }

      return prev
    })
  }

  const handleDragCancel = () => {
    setActiveTask(null)
    reloadColumns()
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {isLoading ? (
        <div className="flex min-h-[320px] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <MyTaskProgress
            summary={summary}
            showMineOnly={showMineOnly}
            onToggleMineOnly={() => setShowMineOnly((value) => !value)}
          />
          <TeamProgressPanel />
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:gap-5">
            <KanbanColumn
              columnId="todo"
              tasks={visibleTasks('todo')}
              showAddTask
              onAddTask={openAddTaskModal}
            />
            <KanbanColumn columnId="in_progress" tasks={visibleTasks('in_progress')} />
            <KanbanColumn columnId="completed" tasks={visibleTasks('completed')} />
          </div>
        </>
      )}

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <TaskCard
            title={activeTask.title}
            footer={activeTask.footer}
            assignee={activeTask.assignee}
            variant={activeTask.variant}
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
