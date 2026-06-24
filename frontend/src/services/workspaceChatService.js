import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { STORAGE_KEYS } from '@/utils/constants'
import { WORKSPACE_MEMBERS } from '@/services/workspaceTaskService'

export const CURRENT_CHAT_USER_ID = 'alex'
export const MAX_CHAT_FILE_SIZE = 10 * 1024 * 1024
export const MAX_VOICE_FILE_SIZE = 2 * 1024 * 1024
export const MAX_VOICE_DURATION_SEC = 120

const DEFAULT_GROUP_MESSAGES = {
  demo: [
    {
      id: 'm1',
      senderId: 'sarah',
      type: 'text',
      content: 'Hey team! Did everyone finish the Dynamic Programming readings?',
      sentAt: '2024-10-12T09:15:00.000Z',
    },
    {
      id: 'm2',
      senderId: 'mike',
      type: 'text',
      content: "I'm still working through the memoization examples.",
      sentAt: '2024-10-12T09:22:00.000Z',
    },
    {
      id: 'm3',
      senderId: 'alex',
      type: 'text',
      content:
        'I finished them last night. Happy to walk through the knapsack problem in our session.',
      sentAt: '2024-10-12T09:28:00.000Z',
    },
    {
      id: 'm4',
      senderId: 'emma',
      type: 'text',
      content: 'That would be great! Can we also cover the practice set 4 problems?',
      sentAt: '2024-10-12T09:35:00.000Z',
    },
    {
      id: 'm5',
      senderId: 'sarah',
      type: 'text',
      content: "Works for me. I'll share my notes in the Files tab later today.",
      sentAt: '2024-10-12T09:41:00.000Z',
    },
  ],
}

export function getChatMember(senderId) {
  if (senderId === CURRENT_CHAT_USER_ID) {
    return WORKSPACE_MEMBERS.find((member) => member.id === CURRENT_CHAT_USER_ID) ?? WORKSPACE_MEMBERS[0]
  }
  return WORKSPACE_MEMBERS.find((member) => member.id === senderId) ?? null
}

export function formatMessageTime(sentAt) {
  const date = parseISO(sentAt)
  return format(date, 'h:mm a')
}

export function formatMessageDateLabel(sentAt) {
  const date = parseISO(sentAt)
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'MMMM d, yyyy')
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function groupMessagesByDate(messages) {
  return messages.reduce((groups, message) => {
    const label = formatMessageDateLabel(message.sentAt)
    const lastGroup = groups[groups.length - 1]

    if (lastGroup?.label === label) {
      lastGroup.messages.push(message)
      return groups
    }

    groups.push({ label, messages: [message] })
    return groups
  }, [])
}

function readAllChats() {
  const raw = localStorage.getItem(STORAGE_KEYS.GROUP_CHAT)
  if (!raw) return { ...DEFAULT_GROUP_MESSAGES }

  try {
    const stored = JSON.parse(raw)
    return { ...DEFAULT_GROUP_MESSAGES, ...stored }
  } catch {
    return { ...DEFAULT_GROUP_MESSAGES }
  }
}

function writeAllChats(chatsByGroup) {
  localStorage.setItem(STORAGE_KEYS.GROUP_CHAT, JSON.stringify(chatsByGroup))
}

function appendMessage(groupId, message) {
  const chats = readAllChats()
  const messages = chats[groupId] ?? []
  chats[groupId] = [...messages, message]
  writeAllChats(chats)
  return chats[groupId]
}

export function loadGroupMessages(groupId) {
  const chats = readAllChats()
  return (chats[groupId] ?? []).map((message) => ({
    type: 'text',
    ...message,
  }))
}

export function sendGroupMessage(groupId, { senderId, content }) {
  const trimmed = content.trim()
  if (!trimmed) return loadGroupMessages(groupId)

  return appendMessage(groupId, {
    id: crypto.randomUUID(),
    senderId,
    type: 'text',
    content: trimmed,
    sentAt: new Date().toISOString(),
  })
}

export function sendGroupAttachment(groupId, { senderId, file }) {
  if (!file) return loadGroupMessages(groupId)

  if (file.size > MAX_CHAT_FILE_SIZE) {
    throw new Error(`File must be smaller than ${formatFileSize(MAX_CHAT_FILE_SIZE)}.`)
  }

  return appendMessage(groupId, {
    id: crypto.randomUUID(),
    senderId,
    type: 'attachment',
    content: `Shared a file: ${file.name}`,
    attachment: {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type || 'application/octet-stream',
    },
    sentAt: new Date().toISOString(),
  })
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Unable to process voice recording.'))
    reader.readAsDataURL(file)
  })
}

export async function sendGroupVoiceMessage(groupId, { senderId, file, durationSec }) {
  if (!file) return loadGroupMessages(groupId)

  if (file.size > MAX_VOICE_FILE_SIZE) {
    throw new Error(`Voice notes must be smaller than ${formatFileSize(MAX_VOICE_FILE_SIZE)}.`)
  }

  if (durationSec > MAX_VOICE_DURATION_SEC) {
    throw new Error(`Voice notes can be up to ${MAX_VOICE_DURATION_SEC} seconds.`)
  }

  const audioDataUrl = await readFileAsDataUrl(file)

  return appendMessage(groupId, {
    id: crypto.randomUUID(),
    senderId,
    type: 'voice',
    content: 'Sent a voice message',
    voice: {
      audioDataUrl,
      durationSec,
      mimeType: file.type || 'audio/webm',
      fileName: file.name,
      fileSize: file.size,
    },
    sentAt: new Date().toISOString(),
  })
}

export function deleteGroupMessage(groupId, messageId, requesterId = CURRENT_CHAT_USER_ID) {
  const chats = readAllChats()
  const messages = chats[groupId] ?? DEFAULT_GROUP_MESSAGES[groupId] ?? []
  const target = messages.find((message) => message.id === messageId)

  if (!target) return loadGroupMessages(groupId)

  if (target.senderId !== requesterId) {
    throw new Error('You can only delete your own messages.')
  }

  chats[groupId] = messages.filter((message) => message.id !== messageId)
  writeAllChats(chats)
  return loadGroupMessages(groupId)
}
