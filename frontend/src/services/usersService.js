import apiClient from '@/api/client'
import { endpoints } from '@/api/endpoints'
import { getApiErrorMessage } from '@/utils/apiErrors'
import { getStoredUser } from '@/services/authService'
import { DEV_BYPASS_AUTH, STORAGE_KEYS } from '@/utils/constants'

export function getProfileInitials(fullName = '') {
  return fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
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
    accent: 'purple',
    members: [
      { id: 'dev-user-1', name: 'Alex Opoku', initials: 'AO', color: 'bg-sky-500' },
      { id: 'dev-user-2', name: 'Sarah Mensah', initials: 'SM', color: 'bg-violet-500' },
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

  if (DEV_BYPASS_AUTH) {
    const previewDataUrl = await fileToDataUrl(file)
    writeDevAvatarCache(previewDataUrl)
    return { avatarUrl: previewDataUrl, updatedAt: new Date().toISOString() }
  }

  const formData = new FormData()
  formData.append('photo', file)

  const { data } = await apiClient.post(endpoints.users.avatar, formData)
  return data
}

export async function deleteUserAvatar() {
  if (DEV_BYPASS_AUTH) {
    writeDevAvatarCache(null)
    return
  }

  await apiClient.delete(endpoints.users.avatar)
}

export function getAvatarUploadErrorMessage(error) {
  return getApiErrorMessage(error, 'Unable to update profile photo.')
}

export function getUserGroupsErrorMessage(error) {
  return getApiErrorMessage(error, 'Unable to load your study groups.')
}
