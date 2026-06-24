import apiClient from '@/api/client'
import { endpoints } from '@/api/endpoints'
import { DEV_BYPASS_AUTH, STORAGE_KEYS } from '@/utils/constants'

export async function register(payload) {
  if (DEV_BYPASS_AUTH) {
    const data = buildDevAuthResponse(payload)
    persistSession(data)
    return data
  }

  const { confirmPassword, agreeToTerms, ...body } = payload
  const { data } = await apiClient.post(endpoints.auth.register, body)
  persistSession(data)
  return data
}

function buildDevAuthResponse(payload) {
  const fullName = `${payload.firstName} ${payload.lastName}`.trim()

  return {
    token: `dev-token-${Date.now()}`,
    user: {
      id: crypto.randomUUID(),
      name: fullName,
      email: payload.email,
      role: payload.role,
      studentId: payload.studentId,
      university: payload.university,
      program: payload.program,
      level: payload.level,
      phone: payload.phone ?? '',
    },
  }
}

export async function login(credentials) {
  if (DEV_BYPASS_AUTH) {
    const stored = getStoredUser()
    const data = {
      token: 'dev-token',
      user:
        stored ?? {
          id: 'dev-user-1',
          name: 'Alex Opoku',
          email: credentials.email,
          role: 'student',
        },
    }
    persistSession(data)
    return data
  }

  const { data } = await apiClient.post(endpoints.auth.login, credentials)
  persistSession(data)
  return data
}

export async function fetchCurrentUser() {
  const { data } = await apiClient.get(endpoints.auth.me)
  return data
}

export function logout() {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER)
}

function persistSession({ token, user }) {
  if (token) localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
  if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
}

export function getStoredUser() {
  const raw = localStorage.getItem(STORAGE_KEYS.USER)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function getStoredToken() {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
}
