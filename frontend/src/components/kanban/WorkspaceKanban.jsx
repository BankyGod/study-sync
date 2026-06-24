import { useState } from 'react'
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
import { TaskCard } from '@/components/kanban/TaskCard'
import { Spinner } from '@/components/common/Spinner'
import { useWorkspaceTasks } from '@/context/WorkspaceTasksContext'
import {
  COLUMN_IDS,
  findTaskContainer,
  normalizeTaskForColumn,
  toKanbanTask,
} from '@/services/workspaceTaskService'

export function WorkspaceKanban() {
  const { columns, setColumns, commitColumns, reloadColumns, openAddTaskModal, isLoading } =
    useWorkspaceTasks()
  const [activeTask, setActiveTask] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  const handleDragStart = ({ active }) => {
    const containerId = findTaskContainer(columns, active.id)
    if (!containerId) return
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
      const normalizedTask = toKanbanTask(normalizeTaskForColumn(movedTask, overContainer))

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

    if (!over) {
      reloadColumns()
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
        <div className="grid gap-5 lg:grid-cols-3">
        <KanbanColumn
          columnId="todo"
          tasks={columns.todo}
          showAddTask
          onAddTask={openAddTaskModal}
        />
        <KanbanColumn columnId="in_progress" tasks={columns.in_progress} />
        <KanbanColumn columnId="completed" tasks={columns.completed} />
        </div>
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
