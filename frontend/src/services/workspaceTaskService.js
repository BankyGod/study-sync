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
  reviewWorkspaceTask,
  sendWorkspaceNudge,
  updateWorkspaceTask,
} from '@/services/workspaceService'

export const COLUMN_IDS = ['todo', 'in_progress', 'completed']

/** A started task with no activity for this many days is flagged as stalled. */
export const STALL_DAYS = 3

export const TASK_PRIORITIES = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

export const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  CHANGES_REQUESTED: 'changes_requested',
}

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
    priority: task.priority ?? null,
    reviewStatus: task.reviewStatus ?? task.review_status ?? null,
    reviewNote: task.reviewNote ?? task.review_note ?? null,
  }
}

export function isAwaitingReview(task) {
  return task?.reviewStatus === REVIEW_STATUS.PENDING
}

/** Completed and not waiting on the leader's review. */
export function isTaskDone(task) {
  return getTaskStatus(task) === 'completed' && !isAwaitingReview(task)
}

function getTaskStatus(task) {
  return task?.status ?? 'todo'
}

function toTime(value) {
  if (!value) return 0
  const text = String(value)
  const time = new Date(/^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text}T12:00:00` : text).getTime()
  return Number.isFinite(time) ? time : 0
}

export function getLastActivityAt(task) {
  const activityTimes = Array.isArray(task?.activity)
    ? task.activity.filter((entry) => entry.type !== 'nudged').map((entry) => toTime(entry.at))
    : []
  const latest = Math.max(
    toTime(task?.lastActivityAt),
    toTime(task?.updatedAt),
    toTime(task?.reviewedAt),
    toTime(task?.completedAt),
    toTime(task?.startedAt),
    toTime(task?.createdAt),
    ...activityTimes,
  )
  return latest > 0 ? new Date(latest) : null
}

export function isTaskStalled(task, now = Date.now()) {
  if (getTaskStatus(task) !== 'in_progress') return false
  const last = getLastActivityAt(task)
  if (!last) return false
  return now - last.getTime() > STALL_DAYS * 86_400_000
}

/** Leader reviews completed work from other members. */
export function canReviewTask(task, userId, options = {}) {
  if (!userId || !options.isLeader) return false
  return isAwaitingReview(task)
}

/** Leader reminds the assignee about unfinished work. */
export function canNudgeTask(task, userId, options = {}) {
  if (!userId || !options.isLeader || !task?.assignee?.id) return false
  if (String(task.assignee.id) === String(userId)) return false
  return getTaskStatus(task) !== 'completed'
}

/** Only the leader sets due dates and priority. */
export function canSetTaskSchedule(options = {}) {
  return Boolean(options.isLeader)
}

const ACTIVITY_LABELS = {
  created: 'created the task',
  assigned: 'assigned it',
  started: 'started working',
  completed: 'marked it done',
  review_requested: 'submitted it for review',
  approved: 'accepted the work',
  changes_requested: 'sent it back',
  nudged: 'sent a reminder',
  regress_requested: 'asked to move it back',
  updated: 'updated the task',
}

export function describeActivity(entry) {
  return ACTIVITY_LABELS[entry?.type] ?? 'updated the task'
}

/** Task history from the API, or rebuilt from the timestamps the task already has. */
export function getTaskActivity(task) {
  if (Array.isArray(task?.activity) && task.activity.length > 0) {
    return [...task.activity].sort((a, b) => toTime(b.at) - toTime(a.at))
  }

  const entries = []
  if (task?.createdAt) {
    entries.push({ id: 'created', type: 'created', at: task.createdAt, actor: task.createdBy })
  }
  if (task?.startedAt) {
    entries.push({ id: 'started', type: 'started', at: task.startedAt, actor: task.assignee })
  }
  if (task?.completedAt) {
    entries.push({
      id: 'completed',
      type: isAwaitingReview(task) ? 'review_requested' : 'completed',
      at: task.completedAt,
      actor: task.assignee,
    })
  }
  if (task?.reviewedAt && task?.reviewStatus && task.reviewStatus !== REVIEW_STATUS.PENDING) {
    entries.push({
      id: 'reviewed',
      type: task.reviewStatus === REVIEW_STATUS.APPROVED ? 'approved' : 'changes_requested',
      at: task.reviewedAt,
      actor: task.reviewedBy,
      note: task.reviewNote,
    })
  }
  return entries.sort((a, b) => toTime(b.at) - toTime(a.at))
}

export function canManageTask(task, userId, options = {}) {
  if (!userId) return false
  if (options.isLeader) return true
  if (task?.createdBy?.id === userId) return true
  return false
}

export function canProgressTask(task, userId) {
  if (!userId || !task?.assignee?.id) return false
  return task.assignee.id === userId
}

/** Only the group leader may approve/reject regress (move-back) requests. */
export function canModerateTask(_task, userId, options = {}) {
  if (!userId) return false
  return Boolean(options.isLeader)
}

/** Leader may reassign any task; task creator may set assignee on their own cards. */
export function canReassignTask(task, userId, options = {}) {
  if (!userId) return false
  if (options.isLeader) return true
  return task?.createdBy?.id === userId
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
    color: member.color ?? member.avatarColor ?? 'bg-sky-700',
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
    reviewStatus: base.reviewStatus === REVIEW_STATUS.PENDING ? null : base.reviewStatus,
  }
}

function withActivity(task, type, note) {
  const now = new Date().toISOString()
  const entry = { id: crypto.randomUUID(), type, at: now, actor: buildDevCreator() }
  if (note) entry.note = note
  return {
    ...task,
    lastActivityAt: now,
    activity: [...(Array.isArray(task.activity) ? task.activity : []), entry],
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

function describeDueDate(dueDate) {
  const due = new Date(`${dueDate}T23:59:59`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = Math.floor((due.getTime() - today.getTime()) / 86_400_000)
  if (days < 0) return { tag: 'Overdue', tagVariant: 'urgent' }
  if (days === 0) return { tag: 'Today', tagVariant: 'urgent' }
  if (days <= 3) return { tag: `${days}d left`, tagVariant: 'soon' }
  return { tag: format(due, 'MMM d'), tagVariant: 'later' }
}

export function isAssignedTo(task, userId) {
  return userId != null && String(task?.assignee?.id) === String(userId)
}

function isPastDue(dueDate) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(`${dueDate}T23:59:59`).getTime() < today.getTime()
}

function summarizeTasks(tasks) {
  const now = Date.now()
  const byStatus = (status) => tasks.filter((task) => getTaskStatus(task) === status)
  const todo = byStatus('todo')
  const inProgress = byStatus('in_progress')
  const completedColumn = byStatus('completed')
  const inReview = completedColumn.filter(isAwaitingReview)
  const done = completedColumn.length - inReview.length
  const total = tasks.length
  const lastActivity = tasks.reduce((latest, task) => {
    const at = getLastActivityAt(task)
    return at && (!latest || at > latest) ? at : latest
  }, null)

  return {
    todo: todo.length,
    inProgress: inProgress.length,
    inReview: inReview.length,
    completed: done,
    total,
    overdue: [...todo, ...inProgress].filter((task) => task.dueDate && isPastDue(task.dueDate))
      .length,
    stalled: inProgress.filter((task) => isTaskStalled(task, now)).length,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
    lastActivityAt: lastActivity,
  }
}

function allTasks(columns = EMPTY_COLUMNS) {
  return COLUMN_IDS.flatMap((columnId) =>
    (columns[columnId] ?? []).map((task) => ({ ...task, status: columnId })),
  )
}

/** Counts of the tasks assigned to `userId` on one pod board. */
export function summarizeMyTasks(columns = EMPTY_COLUMNS, userId) {
  return summarizeTasks(allTasks(columns).filter((task) => isAssignedTo(task, userId)))
}

/** Per-member task progress for the whole pod, most at-risk members first. */
export function summarizeTeamProgress(columns = EMPTY_COLUMNS, members = []) {
  const tasks = allTasks(columns)
  return members
    .map((member) => {
      const memberTasks = tasks.filter((task) => isAssignedTo(task, member.id))
      const summary = summarizeTasks(memberTasks)
      const urgentTask =
        memberTasks.find((task) => isTaskStalled(task)) ??
        memberTasks.find(
          (task) => task.status !== 'completed' && task.dueDate && isPastDue(task.dueDate),
        ) ??
        null
      return { member, ...summary, urgentTaskId: urgentTask?.id ?? null }
    })
    .sort(
      (a, b) =>
        b.overdue + b.stalled - (a.overdue + a.stalled) ||
        a.percent - b.percent ||
        String(a.member.name).localeCompare(String(b.member.name)),
    )
}

/** Every task assigned to `userId` across the user's pods, tagged with its pod. */
export async function loadMyAssignedTasks(groups = [], userId) {
  if (!userId || groups.length === 0) return []

  const results = await Promise.all(
    groups.map(async (group) => {
      const groupId = group.groupId ?? group.id
      try {
        const columns = await loadGroupTasks(groupId)
        return COLUMN_IDS.flatMap((columnId) =>
          (columns[columnId] ?? [])
            .filter((task) => isAssignedTo(task, userId))
            .map((task) => {
              const due = task.dueDate && columnId !== 'completed' ? describeDueDate(task.dueDate) : null
              return {
                ...task,
                status: columnId,
                groupId,
                groupTitle: group.title ?? 'Study pod',
                dueTag: due?.tag ?? null,
                dueTagVariant: due?.tagVariant ?? null,
                isOverdue: Boolean(task.dueDate && columnId !== 'completed' && isPastDue(task.dueDate)),
              }
            }),
        )
      } catch {
        return []
      }
    }),
  )

  return results.flat().sort((a, b) => {
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
    if (a.dueDate) return -1
    if (b.dueDate) return 1
    return String(a.title).localeCompare(String(b.title))
  })
}

/** Open tasks assigned to `userId` with a due date, across all of the user's pods. */
export async function loadMyUpcomingDeadlines(groups = [], userId, limit = 5) {
  const tasks = await loadMyAssignedTasks(groups, userId)
  return tasks
    .filter((task) => task.dueDate && task.status !== 'completed')
    .slice(0, limit)
    .map((task) => ({
      id: `${task.groupId}:${task.id}`,
      title: task.title,
      course: task.groupTitle,
      dueDate: task.dueDate,
      datetime: format(new Date(`${task.dueDate}T12:00:00`), 'EEE, d MMM yyyy'),
      tag: task.dueTag,
      tagVariant: task.dueTagVariant,
    }))
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

/**
 * `canSetSchedule` is false for non-leaders: due date and priority are then left out
 * of the request so the existing values are kept.
 */
export async function addGroupTask(
  groupId,
  { title, dueDate, assigneeId, priority },
  members = [],
  { canSetSchedule = true } = {},
) {
  const schedule = canSetSchedule
    ? { dueDate: dueDate || null, priority: priority || null }
    : { dueDate: null, priority: null }

  if (DEV_BYPASS_AUTH) {
    const columns = readLocalTasks(groupId)
    const task = withActivity(
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        ...schedule,
        status: 'todo',
        variant: 'default',
        assignee: resolveDevAssignee(assigneeId, members),
        createdBy: buildDevCreator(),
        createdAt: new Date().toISOString(),
        pendingRegressRequest: null,
        reviewStatus: null,
      },
      'created',
    )
    columns.todo = [...columns.todo, toKanbanTask(task)]
    writeLocalTasks(groupId, columns)
    return readLocalTasks(groupId)
  }

  await createWorkspaceTask(groupId, { title, assigneeId, ...schedule })

  return loadGroupTasks(groupId)
}

export async function updateGroupTask(
  groupId,
  taskId,
  { title, dueDate, assigneeId, priority },
  members = [],
  { canSetSchedule = true } = {},
) {
  const schedule = canSetSchedule ? { dueDate: dueDate || null, priority: priority || null } : {}

  if (DEV_BYPASS_AUTH) {
    const columns = readLocalTasks(groupId)
    const nextColumns = COLUMN_IDS.reduce((acc, columnId) => {
      acc[columnId] = columns[columnId].map((task) => {
        if (task.id !== taskId) return task

        const nextAssignee = resolveDevAssignee(assigneeId, members)
        const reassigned = String(nextAssignee?.id ?? '') !== String(task.assignee?.id ?? '')
        const updated = withActivity(
          {
            ...stripKanbanFields(task),
            title: title.trim(),
            ...schedule,
            assignee: nextAssignee,
          },
          reassigned ? 'assigned' : 'updated',
        )
        return toKanbanTask(updated)
      })
      return acc
    }, {})

    writeLocalTasks(groupId, nextColumns)
    return readLocalTasks(groupId)
  }

  await updateWorkspaceTask(groupId, taskId, {
    title: title.trim(),
    assigneeId: assigneeId || null,
    ...schedule,
  })

  return loadGroupTasks(groupId)
}

/** Leader accepts completed work or sends it back to In progress with a note. */
export async function reviewGroupTask(groupId, taskId, decision, note = '') {
  const trimmedNote = String(note ?? '').trim()

  if (DEV_BYPASS_AUTH) {
    const columns = readLocalTasks(groupId)
    const fromStatus = getTaskColumnId({ id: taskId }, columns)
    const task = columns[fromStatus].find((item) => item.id === taskId)
    if (!task) throw new Error('Task not found.')

    const reviewer = buildDevCreator()
    const reviewedAt = new Date().toISOString()
    const approved = decision === REVIEW_STATUS.APPROVED
    const targetStatus = approved ? 'completed' : 'in_progress'
    const reviewed = withActivity(
      {
        ...stripKanbanFields(task),
        reviewStatus: approved ? REVIEW_STATUS.APPROVED : REVIEW_STATUS.CHANGES_REQUESTED,
        reviewNote: trimmedNote || null,
        reviewedAt,
        reviewedBy: reviewer,
      },
      approved ? 'approved' : 'changes_requested',
      trimmedNote,
    )

    const nextColumns = COLUMN_IDS.reduce(
      (acc, columnId) => {
        acc[columnId] = columns[columnId].filter((item) => item.id !== taskId)
        return acc
      },
      { ...EMPTY_COLUMNS },
    )
    nextColumns[targetStatus] = [
      ...nextColumns[targetStatus],
      toKanbanTask(normalizeTaskForColumn(reviewed, targetStatus)),
    ]
    writeLocalTasks(groupId, nextColumns)
    return readLocalTasks(groupId)
  }

  await reviewWorkspaceTask(groupId, taskId, { decision, note: trimmedNote })
  return loadGroupTasks(groupId)
}

/** Leader sends the assignee a reminder about a task. */
export async function nudgeGroupMember(groupId, { userId, taskId, message }) {
  const trimmed = String(message ?? '').trim()

  if (DEV_BYPASS_AUTH) {
    if (!taskId) return null
    const columns = readLocalTasks(groupId)
    const nextColumns = COLUMN_IDS.reduce((acc, columnId) => {
      acc[columnId] = columns[columnId].map((task) =>
        task.id === taskId
          ? toKanbanTask({
              ...withActivity(stripKanbanFields(task), 'nudged', trimmed),
              lastActivityAt: task.lastActivityAt ?? null,
              updatedAt: task.updatedAt ?? null,
            })
          : task,
      )
      return acc
    }, {})
    writeLocalTasks(groupId, nextColumns)
    return readLocalTasks(groupId)
  }

  await sendWorkspaceNudge(groupId, { userId, taskId, message: trimmed })
  return taskId ? loadGroupTasks(groupId) : null
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

/** `requiresReview` is only used in dev mode; the API decides this server-side. */
export async function progressGroupTask(groupId, taskId, action, { requiresReview = false } = {}) {
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
          withActivity(
            {
              ...stripKanbanFields(task),
              startedAt:
                action === 'start'
                  ? new Date().toISOString()
                  : (task.startedAt ?? new Date().toISOString()),
              ...(action === 'complete'
                ? {
                    completedAt: new Date().toISOString().slice(0, 10),
                    reviewStatus: requiresReview ? REVIEW_STATUS.PENDING : REVIEW_STATUS.APPROVED,
                  }
                : {}),
            },
            action === 'start' ? 'started' : requiresReview ? 'review_requested' : 'completed',
          ),
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
