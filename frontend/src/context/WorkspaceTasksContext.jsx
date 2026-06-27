import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  addGroupTask,
  loadGroupTasks,
  removeGroupTask,
  saveGroupTasks,
  updateGroupTask,
} from '@/services/workspaceTaskService'
import { getWorkspaceErrorMessage } from '@/utils/workspaceErrors'
import { useWebSocket } from '@/hooks/useWebSocket'
import { DEV_BYPASS_AUTH } from '@/utils/constants'

const WorkspaceTasksContext = createContext(null)

const EMPTY_COLUMNS = { todo: [], in_progress: [], completed: [] }

export function WorkspaceTasksProvider({ groupId, members = [], children }) {
  const [columns, setColumns] = useState(EMPTY_COLUMNS)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [taskActionError, setTaskActionError] = useState('')

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
      setEditingTask(null)
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

  const openAddTaskModal = useCallback(() => {
    setTaskActionError('')
    setIsAddTaskModalOpen(true)
  }, [])
  const closeAddTaskModal = useCallback(() => setIsAddTaskModalOpen(false), [])

  const openEditTaskModal = useCallback((task) => {
    setTaskActionError('')
    setEditingTask(task)
  }, [])
  const closeEditTaskModal = useCallback(() => setEditingTask(null), [])

  const createTask = useCallback(
    async (taskInput) => {
      try {
        const nextColumns = await addGroupTask(groupId, taskInput, members)
        setColumns(nextColumns)
        setTaskActionError('')
        return nextColumns
      } catch (error) {
        const message = getWorkspaceErrorMessage(error, 'Unable to create task.')
        setTaskActionError(message)
        throw error
      }
    },
    [groupId, members],
  )

  const updateTask = useCallback(
    async (taskId, taskInput) => {
      try {
        const nextColumns = await updateGroupTask(groupId, taskId, taskInput, members)
        setColumns(nextColumns)
        setEditingTask(null)
        setTaskActionError('')
        return nextColumns
      } catch (error) {
        const message = getWorkspaceErrorMessage(error, 'Unable to update task.')
        setTaskActionError(message)
        throw error
      }
    },
    [groupId, members],
  )

  const deleteTask = useCallback(
    async (taskId) => {
      if (!window.confirm('Delete this task? This cannot be undone.')) {
        return
      }

      try {
        const nextColumns = await removeGroupTask(groupId, taskId)
        setColumns(nextColumns)
        setTaskActionError('')
        return nextColumns
      } catch (error) {
        const message = getWorkspaceErrorMessage(error, 'Unable to delete task.')
        setTaskActionError(message)
        window.alert(message)
      }
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
    editingTask,
    openEditTaskModal,
    closeEditTaskModal,
    createTask,
    updateTask,
    deleteTask,
    taskActionError,
    clearTaskActionError: () => setTaskActionError(''),
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
