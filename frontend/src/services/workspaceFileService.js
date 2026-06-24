import { format } from 'date-fns'
import { STORAGE_KEYS } from '@/utils/constants'

export const CURRENT_FILE_USER_ID = 'alex'
export const MAX_SHARED_FILE_SIZE = 10 * 1024 * 1024

const DEFAULT_GROUP_FILES = {
  demo: [
    {
      id: 'f1',
      fileName: 'DP_Chapter3_Notes.pdf',
      fileSize: 248000,
      fileType: 'application/pdf',
      uploadedBy: 'Sarah',
      uploadedById: 'sarah',
      uploadedAt: '2024-10-10T14:20:00.000Z',
    },
    {
      id: 'f2',
      fileName: 'Practice_Set_4_Solutions.docx',
      fileSize: 156000,
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadedBy: 'Alex',
      uploadedById: 'alex',
      uploadedAt: '2024-10-11T09:15:00.000Z',
    },
    {
      id: 'f3',
      fileName: 'Algorithm_Cheatsheet.png',
      fileSize: 890000,
      fileType: 'image/png',
      uploadedBy: 'Mike P.',
      uploadedById: 'mike',
      uploadedAt: '2024-10-11T16:40:00.000Z',
    },
  ],
}

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

function readAllFiles() {
  const raw = localStorage.getItem(STORAGE_KEYS.GROUP_FILES)
  if (!raw) return { ...DEFAULT_GROUP_FILES }

  try {
    const stored = JSON.parse(raw)
    return { ...DEFAULT_GROUP_FILES, ...stored }
  } catch {
    return { ...DEFAULT_GROUP_FILES }
  }
}

function writeAllFiles(filesByGroup) {
  localStorage.setItem(STORAGE_KEYS.GROUP_FILES, JSON.stringify(filesByGroup))
}

export function loadGroupFiles(groupId) {
  const all = readAllFiles()
  return all[groupId] ?? []
}

export function uploadGroupFile(groupId, { file, uploadedBy, uploadedById }) {
  if (!file) return loadGroupFiles(groupId)

  if (file.size > MAX_SHARED_FILE_SIZE) {
    throw new Error(`Files must be smaller than ${formatFileSize(MAX_SHARED_FILE_SIZE)}.`)
  }

  const all = readAllFiles()
  const files = all[groupId] ?? []

  const entry = {
    id: crypto.randomUUID(),
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || 'application/octet-stream',
    uploadedBy,
    uploadedById,
    uploadedAt: new Date().toISOString(),
  }

  all[groupId] = [entry, ...files]
  writeAllFiles(all)
  return all[groupId]
}

export function deleteGroupFile(groupId, fileId, requesterId = CURRENT_FILE_USER_ID) {
  const all = readAllFiles()
  const files = all[groupId] ?? DEFAULT_GROUP_FILES[groupId] ?? []
  const target = files.find((file) => file.id === fileId)

  if (!target) return loadGroupFiles(groupId)

  if (target.uploadedById !== requesterId) {
    throw new Error('You can only delete files you uploaded.')
  }

  all[groupId] = files.filter((file) => file.id !== fileId)
  writeAllFiles(all)
  return all[groupId]
}

export function getTotalFileSize(files = []) {
  return files.reduce((total, file) => total + file.fileSize, 0)
}
