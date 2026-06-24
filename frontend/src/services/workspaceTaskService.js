import { format } from 'date-fns'
import { DEV_BYPASS_AUTH, STORAGE_KEYS } from '@/utils/constants'
import {
  createWorkspaceTask,
  fetchWorkspaceTasks,
  reorderWorkspaceTasks,
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

export async function addGroupTask(groupId, { title, dueDate, assigneeId }) {
  if (DEV_BYPASS_AUTH) {
    const columns = readLocalTasks(groupId)
    const task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      dueDate: dueDate || null,
      variant: 'default',
      assignee: null,
      createdAt: new Date().toISOString(),
    }
    columns.todo = [...columns.todo, toKanbanTask(task)]
    writeLocalTasks(groupId, columns)
    return readLocalTasks(groupId)
  }

  await createWorkspaceTask(groupId, { title, dueDate, assigneeId })

  return loadGroupTasks(groupId)
}
