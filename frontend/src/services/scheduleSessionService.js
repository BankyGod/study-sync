import { format, parse } from 'date-fns'
import { DEV_BYPASS_AUTH, STORAGE_KEYS } from '@/utils/constants'
import {
  createWorkspaceSession,
  deleteWorkspaceSession,
  fetchWorkspaceSessions,
  updateWorkspaceSession,
} from '@/services/workspaceService'

export const MEETING_TYPES = [
  'Online Meeting',
  'In Person',
  'Hybrid',
]

function formatTime12h(timeValue) {
  const parsed = parse(timeValue, 'HH:mm', new Date())
  return format(parsed, 'h:mm a')
}

export function formatSessionMeta(session) {
  const dateLabel = format(new Date(`${session.date}T12:00:00`), 'd MMMM yyyy')
  const timeLabel = `${formatTime12h(session.startTime)} - ${formatTime12h(session.endTime)}`
  const tail = session.meetingType || `${session.memberCount} members`
  return `${dateLabel} | ${timeLabel} | ${tail}`
}

export function toScheduleListItem(session) {
  return {
    id: session.id,
    title: session.title,
    meta: formatSessionMeta(session),
    session,
  }
}

function sortSessions(sessions) {
  return [...sessions].sort(
    (a, b) =>
      new Date(`${a.date}T${a.startTime}`).getTime() -
      new Date(`${b.date}T${b.startTime}`).getTime(),
  )
}

function readLocalSessions(groupId) {
  const raw = localStorage.getItem(STORAGE_KEYS.GROUP_SCHEDULES)
  if (!raw) return []

  try {
    const stored = JSON.parse(raw)
    return stored[groupId] ?? []
  } catch {
    return []
  }
}

function writeLocalSessions(groupId, sessions) {
  const raw = localStorage.getItem(STORAGE_KEYS.GROUP_SCHEDULES)
  const all = raw ? JSON.parse(raw) : {}
  all[groupId] = sessions
  localStorage.setItem(STORAGE_KEYS.GROUP_SCHEDULES, JSON.stringify(all))
}

export async function loadGroupSessions(groupId) {
  if (DEV_BYPASS_AUTH) {
    return readLocalSessions(groupId)
  }

  const data = await fetchWorkspaceSessions(groupId)
  return data.sessions ?? []
}

export async function addGroupSession(groupId, sessionInput) {
  if (DEV_BYPASS_AUTH) {
    const sessions = readLocalSessions(groupId)
    const session = {
      id: crypto.randomUUID(),
      memberCount: 1,
      ...sessionInput,
      createdAt: new Date().toISOString(),
    }
    writeLocalSessions(groupId, sortSessions([...sessions, session]))
    return session
  }

  const data = await createWorkspaceSession(groupId, sessionInput)
  return data
}

export async function editGroupSession(groupId, sessionId, patch) {
  if (DEV_BYPASS_AUTH) {
    const sessions = readLocalSessions(groupId).map((session) =>
      session.id === sessionId ? { ...session, ...patch } : session,
    )
    writeLocalSessions(groupId, sortSessions(sessions))
    return sessions.find((session) => session.id === sessionId) ?? null
  }

  return updateWorkspaceSession(groupId, sessionId, patch)
}

export async function removeGroupSession(groupId, sessionId) {
  if (DEV_BYPASS_AUTH) {
    writeLocalSessions(
      groupId,
      readLocalSessions(groupId).filter((session) => session.id !== sessionId),
    )
    return
  }

  await deleteWorkspaceSession(groupId, sessionId)
}
