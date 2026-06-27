import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { DEV_BYPASS_AUTH, STORAGE_KEYS } from '@/utils/constants'
import { resolveApiUrl } from '@/utils/apiUrl'
import {
  buildFileDownloadUrl,
  deleteWorkspaceMessage,
  fetchWorkspaceMessages,
  sendWorkspaceAttachmentMessage,
  sendWorkspaceTextMessage,
  sendWorkspaceVoiceMessage,
} from '@/services/workspaceService'
import { appendLocalGroupFile, downloadGroupFile } from '@/services/workspaceFileService'

export const MAX_CHAT_FILE_SIZE = 10 * 1024 * 1024
export const MAX_VOICE_FILE_SIZE = 2 * 1024 * 1024
export const MAX_VOICE_DURATION_SEC = 120

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

function normalizeAttachment(groupId, attachment) {
  if (!attachment) return attachment

  const fileId = attachment.fileId ?? attachment.id
  const fileName = attachment.fileName ?? attachment.name ?? 'file'
  const fileSize = attachment.fileSize ?? attachment.size ?? 0
  const fileType = attachment.fileType ?? attachment.type ?? 'application/octet-stream'

  const downloadUrl = attachment.downloadUrl
    ? resolveApiUrl(attachment.downloadUrl)
    : fileId
      ? buildFileDownloadUrl(groupId, { id: fileId, downloadUrl: attachment.downloadUrl })
      : undefined

  return {
    ...attachment,
    fileId,
    fileName,
    fileSize,
    fileType,
    downloadUrl,
    deleted: Boolean(attachment.deleted),
  }
}

function normalizeMessage(groupId, message) {
  const normalized = {
    ...message,
    senderId: message.senderId ?? message.sender_id,
    sentAt: message.sentAt ?? message.sent_at,
  }

  if (normalized.attachment) {
    normalized.attachment = normalizeAttachment(groupId, normalized.attachment)
  }

  if (normalized.voice?.streamUrl) {
    normalized.voice = {
      ...normalized.voice,
      streamUrl: resolveApiUrl(normalized.voice.streamUrl),
    }
  }

  return normalized
}

function readLocalMessages(groupId) {
  const raw = localStorage.getItem(STORAGE_KEYS.GROUP_CHAT)
  if (!raw) return []

  try {
    const stored = JSON.parse(raw)
    return (stored[groupId] ?? []).map((message) => ({ type: 'text', ...message }))
  } catch {
    return []
  }
}

function writeLocalMessages(groupId, messages) {
  const raw = localStorage.getItem(STORAGE_KEYS.GROUP_CHAT)
  const all = raw ? JSON.parse(raw) : {}
  all[groupId] = messages
  localStorage.setItem(STORAGE_KEYS.GROUP_CHAT, JSON.stringify(all))
}

export async function loadGroupMessages(groupId) {
  if (DEV_BYPASS_AUTH) {
    return readLocalMessages(groupId)
  }

  const data = await fetchWorkspaceMessages(groupId)
  return (data.messages ?? []).map((message) => normalizeMessage(groupId, message))
}

export async function sendGroupMessage(groupId, { content }) {
  const trimmed = content.trim()
  if (!trimmed) return loadGroupMessages(groupId)

  if (DEV_BYPASS_AUTH) {
    const messages = readLocalMessages(groupId)
    const message = {
      id: crypto.randomUUID(),
      senderId: 'local-user',
      type: 'text',
      content: trimmed,
      sentAt: new Date().toISOString(),
    }
    const next = [...messages, message]
    writeLocalMessages(groupId, next)
    return next
  }

  const created = await sendWorkspaceTextMessage(groupId, trimmed)

  const messages = await loadGroupMessages(groupId)
  return messages.length ? messages : [normalizeMessage(groupId, created)]
}

export async function sendGroupAttachment(groupId, { file }) {
  if (!file) return loadGroupMessages(groupId)

  if (file.size > MAX_CHAT_FILE_SIZE) {
    throw new Error(`File must be smaller than ${formatFileSize(MAX_CHAT_FILE_SIZE)}.`)
  }

  if (DEV_BYPASS_AUTH) {
    const messages = readLocalMessages(groupId)
    const fileId = crypto.randomUUID()
    const message = {
      id: crypto.randomUUID(),
      senderId: 'local-user',
      type: 'attachment',
      content: `Shared a file: ${file.name}`,
      attachment: {
        fileId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'application/octet-stream',
      },
      sentAt: new Date().toISOString(),
    }
    const next = [...messages, message]
    writeLocalMessages(groupId, next)
    appendLocalGroupFile(groupId, {
      id: fileId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type || 'application/octet-stream',
      uploadedBy: 'You',
      uploadedById: 'local-user',
      uploadedAt: message.sentAt,
    })
    return next
  }

  const created = await sendWorkspaceAttachmentMessage(groupId, file)

  const messages = await loadGroupMessages(groupId)
  return messages.length ? messages : [normalizeMessage(groupId, created)]
}

export async function sendGroupVoiceMessage(groupId, { file, durationSec }) {
  if (!file) return loadGroupMessages(groupId)

  if (file.size > MAX_VOICE_FILE_SIZE) {
    throw new Error(`Voice notes must be smaller than ${formatFileSize(MAX_VOICE_FILE_SIZE)}.`)
  }

  if (durationSec > MAX_VOICE_DURATION_SEC) {
    throw new Error(`Voice notes can be up to ${MAX_VOICE_DURATION_SEC} seconds.`)
  }

  if (DEV_BYPASS_AUTH) {
    const messages = readLocalMessages(groupId)
    const message = {
      id: crypto.randomUUID(),
      senderId: 'local-user',
      type: 'voice',
      content: 'Sent a voice message',
      voice: { durationSec, mimeType: file.type, fileName: file.name, fileSize: file.size },
      sentAt: new Date().toISOString(),
    }
    const next = [...messages, message]
    writeLocalMessages(groupId, next)
    return next
  }

  await sendWorkspaceVoiceMessage(groupId, { file, durationSec })

  return loadGroupMessages(groupId)
}

export async function deleteGroupMessage(groupId, messageId) {
  if (DEV_BYPASS_AUTH) {
    const messages = readLocalMessages(groupId).filter((message) => message.id !== messageId)
    writeLocalMessages(groupId, messages)
    return messages
  }

  await deleteWorkspaceMessage(groupId, messageId)
  return loadGroupMessages(groupId)
}

export function downloadChatAttachment(attachment) {
  if (!attachment?.downloadUrl || attachment.deleted) return

  downloadGroupFile({
    fileName: attachment.fileName,
    downloadUrl: attachment.downloadUrl,
  })
}
