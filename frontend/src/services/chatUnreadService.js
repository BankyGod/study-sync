import { STORAGE_KEYS } from '@/utils/constants'

function readState() {
  const raw = localStorage.getItem(STORAGE_KEYS.CHAT_UNREAD)
  if (!raw) return {}

  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function writeState(state) {
  localStorage.setItem(STORAGE_KEYS.CHAT_UNREAD, JSON.stringify(state))
}

export function getChatUnreadCount(groupId) {
  if (!groupId) return 0
  return readState()[groupId] ?? 0
}

export function incrementChatUnread(groupId, amount = 1) {
  if (!groupId) return 0
  const state = readState()
  const next = (state[groupId] ?? 0) + amount
  state[groupId] = next
  writeState(state)
  return next
}

export function clearChatUnread(groupId) {
  if (!groupId) return
  const state = readState()
  if (!state[groupId]) return
  delete state[groupId]
  writeState(state)
}
