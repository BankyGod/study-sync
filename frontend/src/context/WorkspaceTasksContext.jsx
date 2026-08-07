import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  addGroupTask,
  approveGroupTaskRegress,
  loadGroupTasks,
  progressGroupTask,
  rejectGroupTaskRegress,
  removeGroupTask,
  requestGroupTaskRegress,
  saveGroupTasks,
  updateGroupTask,
} from '@/services/workspaceTaskService'
import { getWorkspaceErrorMessage } from '@/utils/workspaceErrors'
import { useWebSocket } from '@/hooks/useWebSocket'
import { DEV_BYPASS_AUTH } from '@/utils/constants'

const WorkspaceTasksContext = createContext(null)

const EMPTY_COLUMNS = { todo: [], in_progress: [], completed: [] }

function getErrorCode(error) {
  return error?.response?.data?.error?.code ?? error?.code ?? null
}

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

  const markProgress = useCallback(
    async (taskId, action) => {
      try {
        const nextColumns = await progressGroupTask(groupId, taskId, action)
        setColumns(nextColumns)
        setTaskActionError('')
        return nextColumns
      } catch (error) {
        const message = getWorkspaceErrorMessage(error, 'Unable to update task progress.')
        setTaskActionError(message)
        window.alert(message)
      }
    },
    [groupId],
  )

  const requestRegress = useCallback(
    async (taskId, targetStatus, reason) => {
      try {
        const nextColumns = await requestGroupTaskRegress(groupId, taskId, targetStatus, reason)
        setColumns(nextColumns)
        setTaskActionError('')
        return nextColumns
      } catch (error) {
        const message = getWorkspaceErrorMessage(error, 'Unable to request move-back approval.')
        setTaskActionError(message)
        window.alert(message)
        await reloadColumns()
      }
    },
    [groupId, reloadColumns],
  )

  const approveRegress = useCallback(
    async (taskId, requestId) => {
      try {
        const nextColumns = await approveGroupTaskRegress(groupId, taskId, requestId)
        setColumns(nextColumns)
        setTaskActionError('')
        return nextColumns
      } catch (error) {
        const message = getWorkspaceErrorMessage(error, 'Unable to approve move-back request.')
        setTaskActionError(message)
        window.alert(message)
      }
    },
    [groupId],
  )

  const rejectRegress = useCallback(
    async (taskId, requestId) => {
      try {
        const nextColumns = await rejectGroupTaskRegress(groupId, taskId, requestId)
        setColumns(nextColumns)
        setTaskActionError('')
        return nextColumns
      } catch (error) {
        const message = getWorkspaceErrorMessage(error, 'Unable to reject move-back request.')
        setTaskActionError(message)
        window.alert(message)
      }
    },
    [groupId],
  )

  const commitColumns = useCallback(
    async (getNextColumns) => {
      let previousColumns = null
      let nextColumns = null
      setColumns((prev) => {
        previousColumns = prev
        nextColumns = getNextColumns(prev)
        return nextColumns
      })

      if (!nextColumns) return

      try {
        const saved = await saveGroupTasks(groupId, nextColumns)
        setColumns(saved)
        setTaskActionError('')
      } catch (error) {
        const code = getErrorCode(error)
        if (code === 'REGRESS_REQUIRES_APPROVAL' && previousColumns) {
          setColumns(previousColumns)
          const details = error?.response?.data?.error?.details
          let taskId = details?.taskId
          let targetStatus = details?.targetStatus

          if (!taskId || !targetStatus) {
            for (const status of ['todo', 'in_progress', 'completed']) {
              for (const task of nextColumns[status] ?? []) {
                const from = ['todo', 'in_progress', 'completed'].find((columnId) =>
                  previousColumns[columnId]?.some((item) => item.id === task.id),
                )
                const order = { todo: 0, in_progress: 1, completed: 2 }
                if (from && (order[status] ?? 0) < (order[from] ?? 0)) {
                  taskId = task.id
                  targetStatus = status
                  break
                }
              }
              if (taskId) break
            }
          }

          const confirmed = window.confirm(
            'Moving this task backward needs creator approval. Send a move-back request?',
          )
          if (confirmed && taskId && targetStatus) {
            await requestRegress(taskId, targetStatus)
          } else {
            await reloadColumns()
          }
          return
        }

        const message = getWorkspaceErrorMessage(error, 'Unable to save board changes.')
        setTaskActionError(message)
        await reloadColumns()
      }
    },
    [groupId, reloadColumns, requestRegress],
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
    markProgress,
    requestRegress,
    approveRegress,
    rejectRegress,
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
