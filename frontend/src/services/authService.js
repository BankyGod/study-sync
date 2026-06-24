import apiClient from '@/api/client'
import { endpoints } from '@/api/endpoints'
import { STORAGE_KEYS } from '@/utils/constants'

export async function login(credentials) {
  const { data } = await apiClient.post(endpoints.auth.login, credentials)
  persistSession(data)
  return data
}

export async function register(payload) {
  const { data } = await apiClient.post(endpoints.auth.register, payload)
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
