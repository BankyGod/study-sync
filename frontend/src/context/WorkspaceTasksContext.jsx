import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { addGroupTask, loadGroupTasks, saveGroupTasks } from '@/services/workspaceTaskService'

const WorkspaceTasksContext = createContext(null)

export function WorkspaceTasksProvider({ groupId, children }) {
  const [columns, setColumns] = useState(() => loadGroupTasks(groupId))
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)

  useEffect(() => {
    setColumns(loadGroupTasks(groupId))
    setIsAddTaskModalOpen(false)
  }, [groupId])

  const openAddTaskModal = useCallback(() => setIsAddTaskModalOpen(true), [])
  const closeAddTaskModal = useCallback(() => setIsAddTaskModalOpen(false), [])

  const createTask = useCallback(
    (taskInput) => {
      const nextColumns = addGroupTask(groupId, taskInput)
      setColumns(nextColumns)
      return nextColumns
    },
    [groupId],
  )

  const commitColumns = useCallback(
    (getNextColumns) => {
      setColumns((prev) => saveGroupTasks(groupId, getNextColumns(prev)))
    },
    [groupId],
  )

  const reloadColumns = useCallback(() => {
    setColumns(loadGroupTasks(groupId))
  }, [groupId])

  const value = {
    columns,
    setColumns,
    commitColumns,
    reloadColumns,
    isAddTaskModalOpen,
    openAddTaskModal,
    closeAddTaskModal,
    createTask,
  }

  return (
    <WorkspaceTasksContext.Provider value={value}>{children}</WorkspaceTasksContext.Provider>
  )
}

export function useWorkspaceTasks() {
  const context = useContext(WorkspaceTasksContext)
  if (!context) {
    throw new Error('useWorkspaceTasks must be used within WorkspaceTasksProvider')
  }
  return context
}
