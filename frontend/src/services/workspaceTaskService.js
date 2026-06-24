import { format } from 'date-fns'
import { STORAGE_KEYS } from '@/utils/constants'

export const WORKSPACE_MEMBERS = [
  { id: 'alex', initials: 'AO', name: 'Alex', color: 'bg-sky-500' },
  { id: 'sarah', initials: 'SJ', name: 'Sarah', color: 'bg-violet-500' },
  { id: 'mike', initials: 'MP', name: 'Mike P.', color: 'bg-emerald-500' },
  { id: 'emma', initials: 'EJ', name: 'Emma J.', color: 'bg-amber-500' },
]

const DEFAULT_GROUP_TASKS = {
  demo: {
    todo: [
      {
        id: 't1',
        title: 'Review Chapter 3: Dynamic Programming',
        dueDate: '2024-10-20',
        variant: 'highlight',
        assignee: WORKSPACE_MEMBERS[0],
      },
      {
        id: 't2',
        title: 'Solve practice problems set 4',
        dueDate: '2024-10-22',
        variant: 'default',
        assignee: WORKSPACE_MEMBERS[1],
      },
    ],
    in_progress: [
      {
        id: 't3',
        title: "Implement Dijkstra's algorithm",
        dueDate: '2024-10-18',
        variant: 'default',
        assignee: WORKSPACE_MEMBERS[2],
      },
      {
        id: 't4',
        title: 'Discuss Bellman-Ford algorithm',
        dueDate: '2024-10-19',
        variant: 'default',
        assignee: WORKSPACE_MEMBERS[3],
      },
    ],
    completed: [
      {
        id: 't5',
        title: 'Study Big O notation complexity',
        completedAt: '2024-10-15',
        variant: 'completed',
        assignee: WORKSPACE_MEMBERS[0],
      },
      {
        id: 't6',
        title: 'Read chapter 2: Sorting algorithms',
        completedAt: '2024-10-16',
        variant: 'completed',
        assignee: WORKSPACE_MEMBERS[1],
      },
    ],
  },
}

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

function readAllTasks() {
  const raw = localStorage.getItem(STORAGE_KEYS.GROUP_TASKS)
  if (!raw) return { ...DEFAULT_GROUP_TASKS }

  try {
    const stored = JSON.parse(raw)
    return { ...DEFAULT_GROUP_TASKS, ...stored }
  } catch {
    return { ...DEFAULT_GROUP_TASKS }
  }
}

function writeAllTasks(tasksByGroup) {
  localStorage.setItem(STORAGE_KEYS.GROUP_TASKS, JSON.stringify(tasksByGroup))
}

export function loadGroupTasks(groupId) {
  const all = readAllTasks()
  const columns = all[groupId] ?? EMPTY_COLUMNS
  return {
    todo: columns.todo.map(toKanbanTask),
    in_progress: columns.in_progress.map(toKanbanTask),
    completed: columns.completed.map(toKanbanTask),
  }
}

export function saveGroupTasks(groupId, columns) {
  const all = readAllTasks()
  all[groupId] = denormalizeColumnsForSave(columns)
  writeAllTasks(all)
  return loadGroupTasks(groupId)
}

export function addGroupTask(groupId, { title, dueDate, assigneeId }) {
  const all = readAllTasks()
  const columns = all[groupId] ?? { ...EMPTY_COLUMNS }
  const assignee =
    WORKSPACE_MEMBERS.find((member) => member.id === assigneeId) ?? WORKSPACE_MEMBERS[0]

  const task = {
    id: crypto.randomUUID(),
    title: title.trim(),
    dueDate: dueDate || null,
    variant: 'default',
    assignee,
    createdAt: new Date().toISOString(),
  }

  columns.todo = [...columns.todo, task]
  all[groupId] = columns
  writeAllTasks(all)

  return loadGroupTasks(groupId)
}

export function getWorkspaceMember(memberId) {
  return WORKSPACE_MEMBERS.find((member) => member.id === memberId) ?? WORKSPACE_MEMBERS[0]
}
