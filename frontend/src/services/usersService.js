import apiClient from '@/api/client'
import { endpoints } from '@/api/endpoints'
import { getApiErrorMessage } from '@/utils/apiErrors'
import { resolveApiUrl } from '@/utils/apiUrl'
import { getStoredUser } from '@/services/authService'
import { DEV_BYPASS_AUTH, STORAGE_KEYS } from '@/utils/constants'

// Use 600/700 shades so white initials meet WCAG AA contrast (~4.5:1).
const AVATAR_COLOR_FALLBACK = 'bg-sky-700'
const AVATAR_COLOR_CLASSES = new Set([
  'bg-sky-600',
  'bg-sky-700',
  'bg-brand-600',
  'bg-brand-700',
  'bg-emerald-600',
  'bg-emerald-700',
  'bg-violet-600',
  'bg-violet-700',
  'bg-amber-700',
  'bg-rose-600',
  'bg-rose-700',
  'bg-indigo-600',
  'bg-indigo-700',
  'bg-cyan-700',
  'bg-teal-600',
  'bg-teal-700',
  'bg-orange-700',
  'bg-blue-600',
  'bg-blue-700',
  'bg-green-700',
  'bg-purple-600',
  'bg-purple-700',
  'bg-pink-700',
  'bg-red-600',
  'bg-red-700',
  'bg-slate-600',
  'bg-slate-700',
])

/** Map common light *-500 classes (and similar) to darker, contrast-safe tones. */
const AVATAR_COLOR_ALIASES = {
  'bg-sky-500': 'bg-sky-700',
  'bg-brand-500': 'bg-brand-700',
  'bg-emerald-500': 'bg-emerald-700',
  'bg-violet-500': 'bg-violet-700',
  'bg-amber-500': 'bg-amber-700',
  'bg-rose-500': 'bg-rose-700',
  'bg-indigo-500': 'bg-indigo-700',
  'bg-cyan-500': 'bg-cyan-700',
  'bg-teal-500': 'bg-teal-700',
  'bg-orange-500': 'bg-orange-700',
  'bg-blue-500': 'bg-blue-700',
  'bg-green-500': 'bg-green-700',
  'bg-purple-500': 'bg-purple-700',
  'bg-pink-500': 'bg-pink-700',
  'bg-red-500': 'bg-red-700',
  'bg-slate-500': 'bg-slate-700',
}

export function getProfileInitials(fullName = '') {
  return fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

/** Ensure avatar color is a usable Tailwind bg class (API may send hex or empty). */
export function normalizeAvatarColor(color) {
  if (!color || typeof color !== 'string') return AVATAR_COLOR_FALLBACK
  const trimmed = color.trim()
  if (AVATAR_COLOR_ALIASES[trimmed]) return AVATAR_COLOR_ALIASES[trimmed]
  if (AVATAR_COLOR_CLASSES.has(trimmed)) return trimmed
  if (trimmed.startsWith('bg-') && /^bg-[a-z]+-\d{2,3}$/.test(trimmed)) {
    const darkened = trimmed.replace(/-(\d{2,3})$/, (_, step) => {
      const n = Number(step)
      if (n <= 500) return '-700'
      if (n === 600) return '-700'
      return `-${step}`
    })
    return darkened
  }
  return AVATAR_COLOR_FALLBACK
}

/**
 * Resolve avatar URL from the API. Relative paths need the API origin.
 * Optional refreshKey busts browser cache after upload.
 */
export function resolveAvatarSrc(avatarUrl, refreshKey = 0) {
  if (!avatarUrl) return null
  if (avatarUrl.startsWith('data:') || avatarUrl.startsWith('blob:')) return avatarUrl

  const resolved = resolveApiUrl(avatarUrl)
  if (!resolved) return null
  if (!refreshKey) return resolved

  const separator = resolved.includes('?') ? '&' : '?'
  return `${resolved}${separator}v=${refreshKey}`
}

export function buildProfileFromAuthUser(user) {
  if (!user) return null

  return {
    fullName: user.name ?? '',
    studentRole: user.program ?? '',
    primaryUniversity: user.university ?? '',
    secondaryUniversity: '',
    email: user.email ?? '',
    location: '',
  }
}

export function normalizeUserProfile(profile = {}, authUser = getStoredUser()) {
  const fallback = buildProfileFromAuthUser(authUser) ?? {
    fullName: '',
    studentRole: '',
    primaryUniversity: '',
    secondaryUniversity: '',
    email: '',
    location: '',
  }

  return {
    fullName: profile.fullName?.trim() || fallback.fullName,
    studentRole: profile.studentRole?.trim() || fallback.studentRole,
    primaryUniversity: profile.primaryUniversity?.trim() || fallback.primaryUniversity,
    secondaryUniversity: profile.secondaryUniversity?.trim() ?? '',
    email: profile.email || fallback.email,
    location: profile.location?.trim() ?? fallback.location,
    updatedAt: profile.updatedAt,
  }
}

export function getUserProfileErrorMessage(error) {
  return getApiErrorMessage(error, 'Unable to save your profile. Please try again.')
}

export async function loadUserProfile() {
  if (DEV_BYPASS_AUTH) {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE)
    const authUser = getStoredUser()
    if (!raw) {
      return normalizeUserProfile({}, authUser)
    }
    try {
      return normalizeUserProfile(JSON.parse(raw), authUser)
    } catch {
      return normalizeUserProfile({}, authUser)
    }
  }

  const { data } = await apiClient.get(endpoints.users.profile)
  return normalizeUserProfile(data)
}

export async function saveUserProfile(profile) {
  const body = {
    fullName: profile.fullName?.trim(),
    studentRole: profile.studentRole?.trim() ?? '',
    primaryUniversity: profile.primaryUniversity?.trim() ?? '',
    secondaryUniversity: profile.secondaryUniversity?.trim() || null,
    location: profile.location?.trim() ?? '',
  }

  if (!body.fullName) {
    throw new Error('Full name is required.')
  }

  if (DEV_BYPASS_AUTH) {
    const authUser = getStoredUser()
    const saved = {
      ...normalizeUserProfile({ ...profile, ...body }, authUser),
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(saved))
    return saved
  }

  const { data } = await apiClient.put(endpoints.users.profile, body)
  return normalizeUserProfile(data)
}

export async function fetchMemberProfile(userId) {
  if (!userId || DEV_BYPASS_AUTH) {
    return null
  }

  try {
    const { data } = await apiClient.get(endpoints.users.profileById(userId))
    return normalizeUserProfile(data)
  } catch (error) {
    if (error.response?.status === 404 || error.response?.status === 403) {
      return null
    }
    throw error
  }
}

const DEV_MOCK_GROUPS = [
  {
    id: 'demo',
    groupId: 'demo',
    title: 'Demo Study Group',
    progress: 64,
    accent: 'blue',
    members: [
      { id: 'dev-user-1', name: 'Alex Opoku', initials: 'AO', color: 'bg-sky-500' },
      { id: 'dev-user-2', name: 'Sarah Mensah', initials: 'SM', color: 'bg-brand-500' },
      { id: 'dev-user-3', name: 'Mike Park', initials: 'MP', color: 'bg-emerald-500' },
    ],
  },
]

export async function fetchUserGroups() {
  if (DEV_BYPASS_AUTH) {
    return DEV_MOCK_GROUPS
  }

  const { data } = await apiClient.get(endpoints.users.groups)
  return data.groups ?? []
}

export const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024

const ACCEPTED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export function validateAvatarFile(file) {
  if (!file) return 'Choose a photo to upload.'
  if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
    return 'Use a JPEG, PNG, WebP, or GIF image.'
  }
  if (file.size > MAX_AVATAR_FILE_SIZE) {
    return 'Profile photo must be smaller than 5 MB.'
  }
  return null
}

/** Pull avatar URL from common API response shapes. */
export function extractAvatarUrl(payload) {
  if (!payload) return null
  if (typeof payload === 'string' && payload.trim()) return payload.trim()

  const candidates = [
    payload.avatarUrl,
    payload.avatar_url,
    payload.url,
    payload.photoUrl,
    payload.photo_url,
    payload.imageUrl,
    payload.image_url,
    payload.path,
    payload.user?.avatarUrl,
    payload.user?.avatar_url,
    payload.data?.avatarUrl,
    payload.data?.avatar_url,
    payload.data?.url,
  ]

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return null
}

/**
 * Return a browser-displayable src.
 * Public/CDN URLs are used as-is.
 * API avatar routes (need JWT) are fetched as a blob object URL.
 */
export async function loadDisplayableAvatarSrc(avatarUrl, refreshKey = 0) {
  if (!avatarUrl) return null
  if (avatarUrl.startsWith('data:') || avatarUrl.startsWith('blob:')) return avatarUrl

  const apiPath = toAvatarApiPath(avatarUrl)
  if (apiPath) {
    try {
      const response = await apiClient.get(apiPath, {
        responseType: 'blob',
        skipAuthLogout: true,
        params: refreshKey ? { v: refreshKey } : undefined,
      })
      const blob = response.data
      if (!(blob instanceof Blob)) return null
      if (blob.type && !blob.type.startsWith('image/') && blob.type !== 'application/octet-stream') {
        return null
      }
      // Empty JSON error bodies sometimes come back as tiny blobs
      if (blob.size < 32) return null
      return URL.createObjectURL(blob)
    } catch {
      return null
    }
  }

  return resolveAvatarSrc(avatarUrl, refreshKey)
}

/** Convert an avatar URL to an axios path under /api (e.g. /users/me/avatar). */
function toAvatarApiPath(avatarUrl) {
  if (!avatarUrl || avatarUrl.startsWith('data:') || avatarUrl.startsWith('blob:')) return null

  let path = avatarUrl
  if (/^https?:\/\//i.test(avatarUrl)) {
    try {
      path = new URL(avatarUrl).pathname
    } catch {
      return null
    }
  }

  if (path.startsWith('/api/')) path = path.slice(4)
  if (!path.startsWith('/')) path = `/${path}`

  if (/^\/users\/me\/avatar\/?$/i.test(path) || /^\/users\/[^/]+\/avatar\/?$/i.test(path)) {
    return path
  }
  return null
}

function readDevAvatarCache() {
  return localStorage.getItem(STORAGE_KEYS.USER_AVATAR) || null
}

function writeDevAvatarCache(dataUrl) {
  if (dataUrl) localStorage.setItem(STORAGE_KEYS.USER_AVATAR, dataUrl)
  else localStorage.removeItem(STORAGE_KEYS.USER_AVATAR)
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Unable to read image.'))
    reader.readAsDataURL(file)
  })
}

export function readCachedUserAvatar(userId) {
  if (!DEV_BYPASS_AUTH || !userId) return null
  return readDevAvatarCache()
}

export function revokeUserAvatarObjectUrl(url) {
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

export async function uploadUserAvatar(file) {
  const validationError = validateAvatarFile(file)
  if (validationError) {
    throw new Error(validationError)
  }

  const previewDataUrl = await fileToDataUrl(file)

  if (DEV_BYPASS_AUTH) {
    writeDevAvatarCache(previewDataUrl)
    return { avatarUrl: previewDataUrl, previewDataUrl, updatedAt: new Date().toISOString() }
  }

  // Backend Multer `.single('…')` must match exactly — wrong name → LIMIT_UNEXPECTED_FILE.
  // Try common field names until one is accepted.
  const fieldNames = ['image', 'file', 'photo', 'avatar', 'profilePhoto', 'picture']
  let data = null
  let lastError = null
  const rejectedFields = []

  for (const fieldName of fieldNames) {
    const formData = new FormData()
    formData.append(fieldName, file, file.name || 'avatar.jpg')

    try {
      const response = await apiClient.post(endpoints.users.avatar, formData)
      data = response.data
      break
    } catch (error) {
      lastError = error
      if (isUnexpectedMulterFieldError(error)) {
        rejectedFields.push(getRejectedMulterField(error) || fieldName)
        continue
      }
      throw error
    }
  }

  if (!data) {
    if (rejectedFields.length) {
      const err = new Error(
        `Upload field name mismatch (rejected: ${[...new Set(rejectedFields)].join(', ')}). Backend Multer .single('…') must match one of: ${fieldNames.join(', ')}.`,
      )
      err.code = 'LIMIT_UNEXPECTED_FILE'
      err.response = lastError?.response
      throw err
    }
    throw lastError ?? new Error('Unable to update profile photo.')
  }

  let avatarUrl = extractAvatarUrl(data)
  if (avatarUrl) {
    avatarUrl = resolveApiUrl(avatarUrl)
  } else {
    // Upload succeeded but no URL in body — use the authenticated avatar route.
    avatarUrl = endpoints.users.avatar
  }

  return {
    ...data,
    avatarUrl,
    previewDataUrl,
    updatedAt: data?.updatedAt ?? new Date().toISOString(),
  }
}

function isUnexpectedMulterFieldError(error) {
  const data = error?.response?.data
  const code =
    data?.error?.code ?? data?.code ?? error?.code ?? data?.error?.name
  const message = String(
    data?.error?.message ?? data?.message ?? error?.message ?? '',
  ).toLowerCase()

  return (
    code === 'LIMIT_UNEXPECTED_FILE' ||
    message.includes('unexpected field') ||
    message.includes('limit_unexpected_file')
  )
}

function getRejectedMulterField(error) {
  const data = error?.response?.data
  return data?.error?.field ?? data?.field ?? null
}

export async function deleteUserAvatar() {
  if (DEV_BYPASS_AUTH) {
    writeDevAvatarCache(null)
    return
  }

  await apiClient.delete(endpoints.users.avatar)
}

export function getAvatarUploadErrorMessage(error) {
  const status = error?.response?.status
  const apiMessage =
    error?.response?.data?.error?.message ?? error?.response?.data?.message

  if (String(apiMessage || '').toLowerCase().includes('unexpected field') || error?.code === 'LIMIT_UNEXPECTED_FILE') {
    return (
      apiMessage ||
      error?.message ||
      'Upload field name mismatch. Backend must use multer().single with the same field name the frontend sends.'
    )
  }
  if (status === 401) {
    return 'Your session expired. Sign in again, then upload the photo.'
  }
  if (status === 413) {
    return 'That image is too large. Use a photo under 5 MB.'
  }
  if (status === 415 || status === 400) {
    return apiMessage || 'Use a JPEG, PNG, WebP, or GIF image.'
  }
  if (status === 500 || status === 502 || status === 503) {
    return (
      apiMessage ||
      'Server failed while saving the photo (500). Backend needs to fix POST /users/me/avatar storage.'
    )
  }

  return getApiErrorMessage(error, 'Unable to update profile photo.')
}

export function getUserGroupsErrorMessage(error) {
  return getApiErrorMessage(error, 'Unable to load your study groups.')
}
