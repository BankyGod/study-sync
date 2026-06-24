import { format, parse } from 'date-fns'
import { STORAGE_KEYS } from '@/utils/constants'

export const MEETING_TYPES = [
  'Online Meeting',
  'In Person',
  'Hybrid',
]

const DEFAULT_GROUP_SESSIONS = {
  demo: [
    {
      id: '1',
      title: 'Study Session - Dynamic Programming',
      date: '2024-01-12',
      startTime: '12:00',
      endTime: '14:00',
      meetingType: 'Online Meeting',
      memberCount: 12,
    },
    {
      id: '2',
      title: 'Quiz preparation',
      date: '2024-02-20',
      startTime: '10:00',
      endTime: '13:00',
      meetingType: 'Online Meeting',
      memberCount: 10,
    },
    {
      id: '3',
      title: 'Group Presentation Rehearsal',
      date: '2024-03-15',
      startTime: '15:00',
      endTime: '17:00',
      meetingType: 'In Person',
      memberCount: 15,
    },
  ],
}

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
  }
}

function readAllSchedules() {
  const raw = localStorage.getItem(STORAGE_KEYS.GROUP_SCHEDULES)
  if (!raw) return { ...DEFAULT_GROUP_SESSIONS }

  try {
    const stored = JSON.parse(raw)
    return { ...DEFAULT_GROUP_SESSIONS, ...stored }
  } catch {
    return { ...DEFAULT_GROUP_SESSIONS }
  }
}

function writeAllSchedules(schedules) {
  localStorage.setItem(STORAGE_KEYS.GROUP_SCHEDULES, JSON.stringify(schedules))
}

export function loadGroupSessions(groupId) {
  const schedules = readAllSchedules()
  return schedules[groupId] ?? []
}

export function saveGroupSessions(groupId, sessions) {
  const schedules = readAllSchedules()
  schedules[groupId] = sessions
  writeAllSchedules(schedules)
  return sessions
}

export function addGroupSession(groupId, sessionInput) {
  const sessions = loadGroupSessions(groupId)
  const session = {
    id: crypto.randomUUID(),
    memberCount: 12,
    ...sessionInput,
    createdAt: new Date().toISOString(),
  }

  const nextSessions = [...sessions, session].sort(
    (a, b) =>
      new Date(`${a.date}T${a.startTime}`).getTime() -
      new Date(`${b.date}T${b.startTime}`).getTime(),
  )

  saveGroupSessions(groupId, nextSessions)
  return session
}
