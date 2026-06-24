import { STORAGE_KEYS } from '@/utils/constants'

export const DEFAULT_USER_PROFILE = {
  fullName: 'Alex Johnson',
  studentRole: 'Computer Science Student',
  primaryUniversity: 'GCTU',
  secondaryUniversity: 'Babcock University',
  email: 'alexjohnson@email.com',
  location: 'Accra, Ghana',
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

export function loadUserProfile() {
  const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE)
  if (!raw) return { ...DEFAULT_USER_PROFILE }

  try {
    return { ...DEFAULT_USER_PROFILE, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_USER_PROFILE }
  }
}

export function saveUserProfile(profile) {
  const payload = {
    ...profile,
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(payload))
  return payload
}
