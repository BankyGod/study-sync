import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  addGroupTask,
  loadGroupTasks,
  saveGroupTasks,
} from '@/services/workspaceTaskService'
import { useWebSocket } from '@/hooks/useWebSocket'
import { DEV_BYPASS_AUTH } from '@/utils/constants'

const WorkspaceTasksContext = createContext(null)

const EMPTY_COLUMNS = { todo: [], in_progress: [], completed: [] }

export function WorkspaceTasksProvider({ groupId, children }) {
  const [columns, setColumns] = useState(EMPTY_COLUMNS)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)

  const reloadColumns = useCallback(async () => {
    const nextColumns = await loadGroupTasks(groupId)
    setColumns(nextColumns)
    return nextColumns
  }, [groupId])

  const socketHandlers = useMemo(
    () => ({
      onTaskCreated: () => {
        reloadColumns()
      },
      onTaskUpdated: () => {
        reloadColumns()
      },
      onTaskDeleted: () => {
        reloadColumns()
      },
    }),
    [reloadColumns],
  )

  useWebSocket(DEV_BYPASS_AUTH ? null : groupId, socketHandlers)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setIsAddTaskModalOpen(false)
      try {
        const nextColumns = await loadGroupTasks(groupId)
        if (!cancelled) {
          setColumns(nextColumns)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [groupId])

  const openAddTaskModal = useCallback(() => setIsAddTaskModalOpen(true), [])
  const closeAddTaskModal = useCallback(() => setIsAddTaskModalOpen(false), [])

  const createTask = useCallback(
    async (taskInput) => {
      const nextColumns = await addGroupTask(groupId, taskInput)
      setColumns(nextColumns)
      return nextColumns
    },
    [groupId],
  )

  const commitColumns = useCallback(
    async (getNextColumns) => {
      let nextColumns = null
      setColumns((prev) => {
        nextColumns = getNextColumns(prev)
        return nextColumns
      })

      if (nextColumns) {
        const saved = await saveGroupTasks(groupId, nextColumns)
        setColumns(saved)
      }
    },
    [groupId],
  )

  const value = {
    columns,
    setColumns,
    commitColumns,
    reloadColumns,
    isLoading,
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
