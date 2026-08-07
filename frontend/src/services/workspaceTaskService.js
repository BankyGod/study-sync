import { format } from 'date-fns'
import { getStoredUser } from '@/services/authService'
import { getProfileInitials } from '@/services/usersService'
import { DEV_BYPASS_AUTH, DEV_MOCK_USER, STORAGE_KEYS } from '@/utils/constants'
import {
  approveTaskRegress,
  createWorkspaceTask,
  deleteWorkspaceTask,
  fetchWorkspaceTasks,
  markTaskProgress,
  rejectTaskRegress,
  reorderWorkspaceTasks,
  requestTaskRegress,
  updateWorkspaceTask,
} from '@/services/workspaceService'

export const COLUMN_IDS = ['todo', 'in_progress', 'completed']

const COLUMN_ORDER = {
  todo: 0,
  in_progress: 1,
  completed: 2,
}

const EMPTY_COLUMNS = {
  todo: [],
  in_progress: [],
  completed: [],
}

export function formatTaskFooter(task) {
  if (task.completedAt) {
    return `Done: ${format(new Date(`${task.completedAt}T12:00:00`), 'MMM d')}`
  }
  if (task.dueDate) {
    return `Due: ${format(new Date(`${task.dueDate}T12:00:00`), 'MMM d')}`
  }
  return 'No due date'
}

export function toKanbanTask(task) {
  return {
    ...task,
    footer: formatTaskFooter(task),
    assignee: task.assignee ?? null,
    createdBy: task.createdBy ?? null,
    pendingRegressRequest: task.pendingRegressRequest ?? null,
    status: task.status ?? undefined,
  }
}

export function canManageTask(task, userId) {
  if (!userId) return false
  return task?.createdBy?.id === userId
}

export function canProgressTask(task, userId) {
  if (!userId || !task?.assignee?.id) return false
  return task.assignee.id === userId
}

export function getTaskColumnId(task, columns = EMPTY_COLUMNS) {
  if (task?.status && COLUMN_IDS.includes(task.status)) return task.status
  return (
    COLUMN_IDS.find((columnId) => columns[columnId]?.some((item) => item.id === task?.id)) ??
    'todo'
  )
}

export function isBackwardMove(fromStatus, toStatus) {
  return (COLUMN_ORDER[toStatus] ?? 0) < (COLUMN_ORDER[fromStatus] ?? 0)
}

function buildDevCreator() {
  const user = getStoredUser() ?? DEV_MOCK_USER
  return {
    id: user.id,
    name: user.name,
    initials: getProfileInitials(user.name),
    color: 'bg-brand-500',
  }
}

function resolveDevAssignee(assigneeId, members = []) {
  if (!assigneeId) return null
  const member = members.find((item) => item.id === assigneeId)
  if (!member) return { id: assigneeId, name: 'Member', initials: 'MB', color: 'bg-slate-400' }
  return {
    id: member.id,
    name: member.name,
    initials: member.initials ?? getProfileInitials(member.name),
    color: member.color ?? member.avatarColor ?? 'bg-sky-500',
  }
}

function stripKanbanFields(task) {
  const { footer, ...rest } = task
  return rest
}

export function normalizeTaskForColumn(task, columnId) {
  const base = stripKanbanFields(task)

  if (columnId === 'completed') {
    return {
      ...base,
      status: 'completed',
      variant: 'completed',
      completedAt: base.completedAt ?? new Date().toISOString().slice(0, 10),
    }
  }

  return {
    ...base,
    status: columnId,
    variant: base.variant === 'completed' ? 'default' : base.variant,
    completedAt: undefined,
  }
}

export function denormalizeColumnsForSave(columns) {
  return {
    todo: columns.todo.map((task) => normalizeTaskForColumn(task, 'todo')),
    in_progress: columns.in_progress.map((task) => normalizeTaskForColumn(task, 'in_progress')),
    completed: columns.completed.map((task) => normalizeTaskForColumn(task, 'completed')),
  }
}

export function findTaskContainer(columns, id) {
  if (COLUMN_IDS.includes(id)) return id

  return COLUMN_IDS.find((columnId) => columns[columnId].some((task) => task.id === id)) ?? null
}

function mapBoardResponse(data) {
  return {
    todo: (data.todo ?? []).map((task) => toKanbanTask({ ...task, status: 'todo' })),
    in_progress: (data.in_progress ?? []).map((task) =>
      toKanbanTask({ ...task, status: 'in_progress' }),
    ),
    completed: (data.completed ?? []).map((task) => toKanbanTask({ ...task, status: 'completed' })),
  }
}

function readLocalTasks(groupId) {
  const raw = localStorage.getItem(STORAGE_KEYS.GROUP_TASKS)
  if (!raw) return { ...EMPTY_COLUMNS }

  try {
    const stored = JSON.parse(raw)
    const columns = stored[groupId] ?? EMPTY_COLUMNS
    return mapBoardResponse(columns)
  } catch {
    return { ...EMPTY_COLUMNS }
  }
}

function writeLocalTasks(groupId, columns) {
  const raw = localStorage.getItem(STORAGE_KEYS.GROUP_TASKS)
  const all = raw ? JSON.parse(raw) : {}
  all[groupId] = denormalizeColumnsForSave(columns)
  localStorage.setItem(STORAGE_KEYS.GROUP_TASKS, JSON.stringify(all))
}

export async function loadGroupTasks(groupId) {
  if (DEV_BYPASS_AUTH) {
    return readLocalTasks(groupId)
  }

  const data = await fetchWorkspaceTasks(groupId)
  return mapBoardResponse(data)
}

export async function saveGroupTasks(groupId, columns) {
  if (DEV_BYPASS_AUTH) {
    writeLocalTasks(groupId, columns)
    return readLocalTasks(groupId)
  }

  const tasks = []
  COLUMN_IDS.forEach((status) => {
    columns[status].forEach((task, position) => {
      tasks.push({ id: task.id, status, position })
    })
  })

  const data = await reorderWorkspaceTasks(groupId, tasks)
  return mapBoardResponse(data)
}

export async function addGroupTask(groupId, { title, dueDate, assigneeId }, members = []) {
  if (DEV_BYPASS_AUTH) {
    const columns = readLocalTasks(groupId)
    const task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      dueDate: dueDate || null,
      status: 'todo',
      variant: 'default',
      assignee: resolveDevAssignee(assigneeId, members),
      createdBy: buildDevCreator(),
      createdAt: new Date().toISOString(),
      pendingRegressRequest: null,
    }
    columns.todo = [...columns.todo, toKanbanTask(task)]
    writeLocalTasks(groupId, columns)
    return readLocalTasks(groupId)
  }

  await createWorkspaceTask(groupId, { title, dueDate, assigneeId })

  return loadGroupTasks(groupId)
}

export async function updateGroupTask(
  groupId,
  taskId,
  { title, dueDate, assigneeId },
  members = [],
) {
  if (DEV_BYPASS_AUTH) {
    const columns = readLocalTasks(groupId)
    const nextColumns = COLUMN_IDS.reduce((acc, columnId) => {
      acc[columnId] = columns[columnId].map((task) => {
        if (task.id !== taskId) return task

        const updated = {
          ...stripKanbanFields(task),
          title: title.trim(),
          dueDate: dueDate || null,
          assignee: resolveDevAssignee(assigneeId, members),
        }
        return toKanbanTask(updated)
      })
      return acc
    }, {})

    writeLocalTasks(groupId, nextColumns)
    return readLocalTasks(groupId)
  }

  await updateWorkspaceTask(groupId, taskId, {
    title: title.trim(),
    dueDate: dueDate || null,
    assigneeId: assigneeId || null,
  })

  return loadGroupTasks(groupId)
}

export async function removeGroupTask(groupId, taskId) {
  if (DEV_BYPASS_AUTH) {
    const columns = readLocalTasks(groupId)
    const task = COLUMN_IDS.flatMap((columnId) => columns[columnId]).find(
      (item) => item.id === taskId,
    )
    const user = getStoredUser() ?? DEV_MOCK_USER

    if (!task?.createdBy?.id) {
      throw Object.assign(
        new Error('This task cannot be deleted because it has no creator record.'),
        {
          response: {
            data: {
              error: { message: 'This task cannot be deleted because it has no creator record.' },
            },
          },
        },
      )
    }

    if (task.createdBy.id !== user.id) {
      throw Object.assign(new Error('Only the task creator can delete this task.'), {
        response: { data: { error: { message: 'Only the task creator can delete this task.' } } },
      })
    }

    const nextColumns = COLUMN_IDS.reduce((acc, columnId) => {
      acc[columnId] = columns[columnId].filter((item) => item.id !== taskId)
      return acc
    }, {})
    writeLocalTasks(groupId, nextColumns)
    return readLocalTasks(groupId)
  }

  await deleteWorkspaceTask(groupId, taskId)
  return loadGroupTasks(groupId)
}

export async function progressGroupTask(groupId, taskId, action) {
  if (DEV_BYPASS_AUTH) {
    const columns = readLocalTasks(groupId)
    const fromStatus = getTaskColumnId({ id: taskId }, columns)
    const task = columns[fromStatus].find((item) => item.id === taskId)
    if (!task) throw new Error('Task not found.')

    const nextStatus = action === 'complete' ? 'completed' : 'in_progress'
    const nextColumns = COLUMN_IDS.reduce(
      (acc, columnId) => {
        acc[columnId] = columns[columnId].filter((item) => item.id !== taskId)
        return acc
      },
      { ...EMPTY_COLUMNS },
    )

    nextColumns[nextStatus] = [
      ...nextColumns[nextStatus],
      toKanbanTask(
        normalizeTaskForColumn(
          {
            ...stripKanbanFields(task),
            startedAt:
              action === 'start'
                ? new Date().toISOString()
                : (task.startedAt ?? new Date().toISOString()),
          },
          nextStatus,
        ),
      ),
    ]
    writeLocalTasks(groupId, nextColumns)
    return readLocalTasks(groupId)
  }

  await markTaskProgress(groupId, taskId, action)
  return loadGroupTasks(groupId)
}

export async function requestGroupTaskRegress(groupId, taskId, targetStatus, reason) {
  if (DEV_BYPASS_AUTH) {
    const columns = readLocalTasks(groupId)
    const fromStatus = getTaskColumnId({ id: taskId }, columns)
    const user = getStoredUser() ?? DEV_MOCK_USER
    const nextColumns = COLUMN_IDS.reduce((acc, columnId) => {
      acc[columnId] = columns[columnId].map((task) => {
        if (task.id !== taskId) return task
        return toKanbanTask({
          ...stripKanbanFields(task),
          pendingRegressRequest: {
            id: crypto.randomUUID(),
            fromStatus,
            targetStatus,
            reason: reason || '',
            requestedAt: new Date().toISOString(),
            requestedBy: {
              id: user.id,
              name: user.name,
              initials: getProfileInitials(user.name),
              color: 'bg-brand-500',
            },
          },
        })
      })
      return acc
    }, {})
    writeLocalTasks(groupId, nextColumns)
    return readLocalTasks(groupId)
  }

  await requestTaskRegress(groupId, taskId, { targetStatus, reason })
  return loadGroupTasks(groupId)
}

export async function approveGroupTaskRegress(groupId, taskId, requestId) {
  if (DEV_BYPASS_AUTH) {
    const columns = readLocalTasks(groupId)
    const fromStatus = getTaskColumnId({ id: taskId }, columns)
    const task = columns[fromStatus].find((item) => item.id === taskId)
    const targetStatus = task?.pendingRegressRequest?.targetStatus ?? 'todo'
    const nextColumns = COLUMN_IDS.reduce(
      (acc, columnId) => {
        acc[columnId] = columns[columnId].filter((item) => item.id !== taskId)
        return acc
      },
      { ...EMPTY_COLUMNS },
    )
    nextColumns[targetStatus] = [
      ...nextColumns[targetStatus],
      toKanbanTask(
        normalizeTaskForColumn(
          { ...stripKanbanFields(task), pendingRegressRequest: null },
          targetStatus,
        ),
      ),
    ]
    writeLocalTasks(groupId, nextColumns)
    return readLocalTasks(groupId)
  }

  await approveTaskRegress(groupId, taskId, requestId)
  return loadGroupTasks(groupId)
}

export async function rejectGroupTaskRegress(groupId, taskId, requestId, message) {
  if (DEV_BYPASS_AUTH) {
    const columns = readLocalTasks(groupId)
    const nextColumns = COLUMN_IDS.reduce((acc, columnId) => {
      acc[columnId] = columns[columnId].map((task) => {
        if (task.id !== taskId) return task
        return toKanbanTask({ ...stripKanbanFields(task), pendingRegressRequest: null })
      })
      return acc
    }, {})
    writeLocalTasks(groupId, nextColumns)
    return readLocalTasks(groupId)
  }

  await rejectTaskRegress(groupId, taskId, requestId, message)
  return loadGroupTasks(groupId)
}
