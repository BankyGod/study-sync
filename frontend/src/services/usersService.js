import apiClient from '@/api/client'
import { endpoints } from '@/api/endpoints'
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
  const apiError = error?.response?.data?.error
  if (apiError?.details?.length) {
    return apiError.details.map((item) => item.message).join(' ')
  }
  return apiError?.message || 'Unable to save your profile. Please try again.'
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

export async function fetchUserGroups() {
  if (DEV_BYPASS_AUTH) {
    return []
  }

  const { data } = await apiClient.get(endpoints.users.groups)
  return data.groups ?? []
}

export function getUserGroupsErrorMessage(error) {
  const apiError = error?.response?.data?.error
  return apiError?.message || 'Unable to load your study groups.'
}
