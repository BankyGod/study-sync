import { API_BASE_URL } from '@/api/config'

/**
 * Build a full URL for API paths returned by the backend (e.g. file downloads).
 * Signed avatar URLs from the API should be used as-is — do not pass through here.
 */
export function resolveApiUrl(path) {
  if (!path) return path
  if (path.startsWith('http')) return path

  const base = API_BASE_URL.replace(/\/$/, '')

  if (base.startsWith('http')) {
    const { origin } = new URL(base)

    if (path.startsWith('/api/')) {
      return `${origin}${path}`
    }

    if (path.startsWith('/workspaces/') || path.startsWith('/users/')) {
      return `${base}${path}`
    }

    return `${origin}${path}`
  }

  if (path.startsWith('/api/')) {
    return `${base}${path.slice(4)}`
  }

  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}
