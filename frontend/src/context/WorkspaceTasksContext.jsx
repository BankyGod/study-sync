import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  COLUMN_IDS,
  addGroupTask,
  approveGroupTaskRegress,
  loadGroupTasks,
  nudgeGroupMember,
  progressGroupTask,
  rejectGroupTaskRegress,
  removeGroupTask,
  requestGroupTaskRegress,
  requiresLeaderApproval,
  reviewGroupTask,
  saveGroupTasks,
  updateGroupTask,
  uploadGroupTaskDocument,
} from '@/services/workspaceTaskService'
import { getWorkspaceErrorMessage } from '@/utils/workspaceErrors'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useWorkspaceLeader } from '@/hooks/useWorkspaceLeader'
import { DEV_BYPASS_AUTH } from '@/utils/constants'

const WorkspaceTasksContext = createContext(null)

const EMPTY_COLUMNS = { todo: [], in_progress: [], completed: [] }

let hasWarnedAboutApproval = false

/** The deployed API may still move tasks directly; tell the user once per session. */
function warnIfServerSkippedApproval(columns, taskId, action) {
  if (hasWarnedAboutApproval) return
  const target = action === 'complete' ? 'completed' : 'in_progress'
  const task = columns?.[target]?.find((item) => item.id === taskId)
  if (!task || task.pendingAdvanceRequest) return
  hasWarnedAboutApproval = true
  window.alert(
    'The server moved this task without waiting for the group leader. Leader approval needs the backend update described in docs/BACKEND_API_SPEC.md ("Step approval").',
  )
}

function getErrorCode(error) {
  return error?.response?.data?.error?.code ?? error?.code ?? null
}

export function WorkspaceTasksProvider({ groupId, members = [], children }) {
  const [columns, setColumns] = useState(EMPTY_COLUMNS)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [detailsTaskId, setDetailsTaskId] = useState(null)
  const [submitTaskId, setSubmitTaskId] = useState(null)
  const [taskActionError, setTaskActionError] = useState('')
  const { isLeader, leaderId } = useWorkspaceLeader()
  const scheduleOptions = useMemo(() => ({ canSetSchedule: isLeader }), [isLeader])

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
      setDetailsTaskId(null)
      setSubmitTaskId(null)
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

  const openTaskDetails = useCallback((taskId) => setDetailsTaskId(taskId), [])
  const closeTaskDetails = useCallback(() => setDetailsTaskId(null), [])
  const findTask = useCallback(
    (taskId) => {
      if (!taskId) return null
      for (const columnId of COLUMN_IDS) {
        const task = columns[columnId]?.find((item) => item.id === taskId)
        if (task) return { ...task, status: columnId }
      }
      return null
    },
    [columns],
  )
  const detailsTask = useMemo(() => findTask(detailsTaskId), [findTask, detailsTaskId])

  const openDocumentSubmit = useCallback((taskId) => setSubmitTaskId(taskId), [])
  const closeDocumentSubmit = useCallback(() => setSubmitTaskId(null), [])
  const submitTask = useMemo(() => findTask(submitTaskId), [findTask, submitTaskId])

  const createTask = useCallback(
    async (taskInput) => {
      try {
        const nextColumns = await addGroupTask(groupId, taskInput, members, scheduleOptions)
        setColumns(nextColumns)
        setTaskActionError('')
        return nextColumns
      } catch (error) {
        const message = getWorkspaceErrorMessage(error, 'Unable to create task.')
        setTaskActionError(message)
        throw error
      }
    },
    [groupId, members, scheduleOptions],
  )

  const updateTask = useCallback(
    async (taskId, taskInput) => {
      try {
        const nextColumns = await updateGroupTask(
          groupId,
          taskId,
          taskInput,
          members,
          scheduleOptions,
        )
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
    [groupId, members, scheduleOptions],
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
        const requiresReview = requiresLeaderApproval({ isLeader, leaderId })
        const nextColumns = await progressGroupTask(groupId, taskId, action, { requiresReview })
        setColumns(nextColumns)
        setTaskActionError('')
        if (requiresReview && !DEV_BYPASS_AUTH) warnIfServerSkippedApproval(nextColumns, taskId, action)
        return nextColumns
      } catch (error) {
        const message = getWorkspaceErrorMessage(error, 'Unable to update task progress.')
        setTaskActionError(message)
        window.alert(message)
      }
    },
    [groupId, isLeader, leaderId],
  )

  const reviewTask = useCallback(
    async (taskId, decision, note) => {
      try {
        const nextColumns = await reviewGroupTask(groupId, taskId, decision, note)
        setColumns(nextColumns)
        setTaskActionError('')
        return nextColumns
      } catch (error) {
        const message = getWorkspaceErrorMessage(error, 'Unable to review this task.')
        setTaskActionError(message)
        window.alert(message)
      }
    },
    [groupId],
  )

  const uploadTaskDocument = useCallback(
    async (taskId, file) => {
      try {
        const nextColumns = await uploadGroupTaskDocument(groupId, taskId, file)
        setColumns(nextColumns)
        setTaskActionError('')
        return true
      } catch (error) {
        const message = getWorkspaceErrorMessage(error, 'Unable to upload the document.')
        setTaskActionError(message)
        window.alert(message)
        return false
      }
    },
    [groupId],
  )

  const nudgeMember = useCallback(
    async ({ userId, taskId, message }) => {
      try {
        const nextColumns = await nudgeGroupMember(groupId, { userId, taskId, message })
        if (nextColumns) setColumns(nextColumns)
        setTaskActionError('')
        return true
      } catch (error) {
        const errorMessage = getWorkspaceErrorMessage(error, 'Unable to send the reminder.')
        setTaskActionError(errorMessage)
        window.alert(errorMessage)
        return false
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
            'Moving this task backward needs the group leader’s approval. Send a move-back request?',
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
    reviewTask,
    nudgeMember,
    uploadTaskDocument,
    submitTask,
    openDocumentSubmit,
    closeDocumentSubmit,
    detailsTask,
    openTaskDetails,
    closeTaskDetails,
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
