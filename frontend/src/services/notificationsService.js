import apiClient from '@/api/client'
import { endpoints } from '@/api/endpoints'
import { DEV_BYPASS_AUTH, STORAGE_KEYS } from '@/utils/constants'

const DEV_MOCK_NOTIFICATIONS = [
  {
    id: 'dev-notif-1',
    type: 'task.assigned',
    title: 'You were assigned a task',
    body: 'Sam assigned you "Review Chapter 3" in Biology 101',
    groupId: 'biology-101',
    readAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    data: {
      groupId: 'biology-101',
      taskId: 'dev-task-1',
      taskTitle: 'Review Chapter 3',
      actorId: 'dev-user-2',
      actorName: 'Sam',
    },
  },
  {
    id: 'dev-notif-2',
    type: 'task.regress_requested',
    title: 'Move-back requested on your task',
    body: 'Jordan asked to move "Practice problems set 4" back to In Progress',
    groupId: 'biology-101',
    readAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    data: {
      groupId: 'biology-101',
      taskId: 'dev-task-2',
      taskTitle: 'Practice problems set 4',
      requestId: 'dev-request-1',
      actorId: 'dev-user-3',
      fromStatus: 'completed',
      targetStatus: 'in_progress',
    },
  },
  {
    id: 'dev-notif-3',
    type: 'task.regress_approved',
    title: 'Task moved back to In Progress',
    body: '"Study Big O notation" was moved back to In Progress in CS 400',
    groupId: 'cs-400',
    readAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    data: {
      groupId: 'cs-400',
      taskId: 'dev-task-3',
      taskTitle: 'Study Big O notation',
    },
  },
]

function readDevNotifications() {
  const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(DEV_MOCK_NOTIFICATIONS))
    return [...DEV_MOCK_NOTIFICATIONS]
  }

  try {
    return JSON.parse(raw)
  } catch {
    return [...DEV_MOCK_NOTIFICATIONS]
  }
}

function writeDevNotifications(notifications) {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications))
}

export function getNotificationsErrorMessage(error) {
  const apiError = error?.response?.data?.error
  return apiError?.message || 'Unable to load notifications. Please try again.'
}

export async function fetchNotifications({ limit = 20, cursor, unreadOnly = false, groupId } = {}) {
  if (DEV_BYPASS_AUTH) {
    let items = readDevNotifications()
    if (unreadOnly) {
      items = items.filter((item) => !item.readAt)
    }
    if (groupId) {
      items = items.filter((item) => item.groupId === groupId)
    }
    items = items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return {
      notifications: items.slice(0, limit),
      nextCursor: null,
      unreadCount: readDevNotifications().filter((item) => !item.readAt).length,
    }
  }

  const params = { limit }
  if (cursor) params.cursor = cursor
  if (unreadOnly) params.unreadOnly = true
  if (groupId) params.groupId = groupId

  const { data } = await apiClient.get(endpoints.users.notifications, { params })
  return {
    notifications: data.notifications ?? [],
    nextCursor: data.nextCursor ?? null,
    unreadCount: data.unreadCount ?? 0,
  }
}

export async function fetchUnreadNotificationCount() {
  if (DEV_BYPASS_AUTH) {
    const unreadCount = readDevNotifications().filter((item) => !item.readAt).length
    return { unreadCount }
  }

  const { data } = await apiClient.get(endpoints.users.notificationsUnreadCount)
  return { unreadCount: data.unreadCount ?? 0 }
}

export async function markNotificationRead(notificationId) {
  if (DEV_BYPASS_AUTH) {
    const items = readDevNotifications()
    const index = items.findIndex((item) => item.id === notificationId)
    if (index === -1) {
      throw new Error('Notification not found')
    }

    const readAt = new Date().toISOString()
    items[index] = { ...items[index], readAt }
    writeDevNotifications(items)
    return { id: notificationId, readAt }
  }

  const { data } = await apiClient.patch(endpoints.users.notificationRead(notificationId))
  return data
}

export async function markAllNotificationsRead(groupId) {
  if (DEV_BYPASS_AUTH) {
    const readAt = new Date().toISOString()
    const items = readDevNotifications().map((item) => {
      if (groupId && item.groupId !== groupId) return item
      return { ...item, readAt: item.readAt ?? readAt }
    })
    writeDevNotifications(items)
    const markedCount = items.filter((item) => item.readAt === readAt).length
    return { markedCount }
  }

  const body = groupId ? { groupId } : undefined
  const { data } = await apiClient.post(endpoints.users.notificationsReadAll, body)
  return data
}
