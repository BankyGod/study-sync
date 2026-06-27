import { format } from 'date-fns'
import { getStoredUser } from '@/services/authService'
import { getProfileInitials } from '@/services/usersService'
import { DEV_BYPASS_AUTH, DEV_MOCK_USER, STORAGE_KEYS } from '@/utils/constants'
import {
  createWorkspaceTask,
  deleteWorkspaceTask,
  fetchWorkspaceTasks,
  reorderWorkspaceTasks,
  updateWorkspaceTask,
} from '@/services/workspaceService'

export const COLUMN_IDS = ['todo', 'in_progress', 'completed']

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
  }
}

export function canManageTask(task, userId) {
  if (!userId) return false
  return task?.createdBy?.id === userId
}

function buildDevCreator() {
  const user = getStoredUser() ?? DEV_MOCK_USER
  return {
    id: user.id,
    name: user.name,
    initials: getProfileInitials(user.name),
    color: 'bg-violet-500',
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
      variant: 'completed',
      completedAt: base.completedAt ?? new Date().toISOString().slice(0, 10),
    }
  }

  return {
    ...base,
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
    todo: (data.todo ?? []).map(toKanbanTask),
    in_progress: (data.in_progress ?? []).map(toKanbanTask),
    completed: (data.completed ?? []).map(toKanbanTask),
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
      variant: 'default',
      assignee: resolveDevAssignee(assigneeId, members),
      createdBy: buildDevCreator(),
      createdAt: new Date().toISOString(),
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
    const task = COLUMN_IDS.flatMap((columnId) => columns[columnId]).find((item) => item.id === taskId)
    const user = getStoredUser() ?? DEV_MOCK_USER

    if (!task?.createdBy?.id) {
      throw Object.assign(new Error('This task cannot be deleted because it has no creator record.'), {
        response: {
          data: { error: { message: 'This task cannot be deleted because it has no creator record.' } },
        },
      })
    }

    if (task.createdBy.id !== user.id) {
      throw Object.assign(new Error('Only the task creator can delete this task.'), {
        response: { data: { error: { message: 'Only the task creator can delete this task.' } } },
      })
    }

    const nextColumns = COLUMN_IDS.reduce((acc, columnId) => {
      acc[columnId] = columns[columnId].filter((task) => task.id !== taskId)
      return acc
    }, {})
    writeLocalTasks(groupId, nextColumns)
    return readLocalTasks(groupId)
  }

  await deleteWorkspaceTask(groupId, taskId)
  return loadGroupTasks(groupId)
}
