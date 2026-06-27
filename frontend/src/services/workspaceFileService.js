import { format } from 'date-fns'
import { DEV_BYPASS_AUTH, STORAGE_KEYS } from '@/utils/constants'
import { getStoredToken } from '@/services/authService'
import {
  buildFileDownloadUrl,
  deleteWorkspaceFile,
  fetchWorkspaceFiles,
  uploadWorkspaceFile,
} from '@/services/workspaceService'

export const MAX_SHARED_FILE_SIZE = 10 * 1024 * 1024

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatUploadedAt(uploadedAt) {
  return format(new Date(uploadedAt), 'MMM d, yyyy')
}

export function getFileIconType(fileType = '', fileName = '') {
  if (fileType.startsWith('image/')) return 'image'
  if (fileType.includes('pdf') || fileName.endsWith('.pdf')) return 'pdf'
  if (fileType.includes('word') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    return 'doc'
  }
  if (fileType.includes('sheet') || fileName.endsWith('.xlsx')) return 'sheet'
  if (fileType.includes('presentation') || fileName.endsWith('.pptx')) return 'slides'
  return 'file'
}

function normalizeFile(groupId, file) {
  const id = file.id
  const fileName = file.fileName ?? file.file_name ?? file.name ?? 'file'
  const fileSize = file.fileSize ?? file.file_size ?? 0
  const fileType = file.fileType ?? file.file_type ?? 'application/octet-stream'

  return {
    id,
    fileName,
    fileSize,
    fileType,
    uploadedBy: file.uploadedBy ?? file.uploaded_by ?? 'Member',
    uploadedById: file.uploadedById ?? file.uploaded_by_id,
    uploadedAt: file.uploadedAt ?? file.uploaded_at,
    source: file.source,
    downloadUrl: buildFileDownloadUrl(groupId, { ...file, id, fileName }),
  }
}

function readLocalFiles(groupId) {
  const raw = localStorage.getItem(STORAGE_KEYS.GROUP_FILES)
  if (!raw) return []

  try {
    const stored = JSON.parse(raw)
    return stored[groupId] ?? []
  } catch {
    return []
  }
}

function writeLocalFiles(groupId, files) {
  const raw = localStorage.getItem(STORAGE_KEYS.GROUP_FILES)
  const all = raw ? JSON.parse(raw) : {}
  all[groupId] = files
  localStorage.setItem(STORAGE_KEYS.GROUP_FILES, JSON.stringify(all))
}

export function appendLocalGroupFile(groupId, fileMeta) {
  const files = readLocalFiles(groupId)
  const next = [fileMeta, ...files]
  writeLocalFiles(groupId, next)
  return next
}

export async function loadGroupFiles(groupId) {
  if (DEV_BYPASS_AUTH) {
    return readLocalFiles(groupId)
  }

  const data = await fetchWorkspaceFiles(groupId)
  return (data.files ?? []).map((file) => normalizeFile(groupId, file))
}

export async function uploadGroupFile(groupId, { file }) {
  if (!file) return loadGroupFiles(groupId)

  if (file.size > MAX_SHARED_FILE_SIZE) {
    throw new Error(`Files must be smaller than ${formatFileSize(MAX_SHARED_FILE_SIZE)}.`)
  }

  if (DEV_BYPASS_AUTH) {
    const files = readLocalFiles(groupId)
    const entry = {
      id: crypto.randomUUID(),
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type || 'application/octet-stream',
      uploadedBy: 'You',
      uploadedById: 'local-user',
      uploadedAt: new Date().toISOString(),
    }
    const next = [entry, ...files]
    writeLocalFiles(groupId, next)
    return next
  }

  await uploadWorkspaceFile(groupId, file)

  return loadGroupFiles(groupId)
}

export async function deleteGroupFile(groupId, fileId) {
  if (DEV_BYPASS_AUTH) {
    const files = readLocalFiles(groupId).filter((file) => file.id !== fileId)
    writeLocalFiles(groupId, files)
    return files
  }

  await deleteWorkspaceFile(groupId, fileId)
  return loadGroupFiles(groupId)
}

export function getTotalFileSize(files = []) {
  return files.reduce((total, file) => total + file.fileSize, 0)
}

export function downloadGroupFile(file) {
  if (!file?.downloadUrl) return

  const token = getStoredToken()
  const link = document.createElement('a')
  link.href = file.downloadUrl
  link.target = '_blank'
  link.rel = 'noopener'

  if (token && file.downloadUrl.startsWith('http')) {
    fetch(file.downloadUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob)
        link.href = url
        link.download = file.fileName
        link.click()
        URL.revokeObjectURL(url)
      })
      .catch(() => {
        link.click()
      })
    return
  }

  link.click()
}
