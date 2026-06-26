/**
 * Build a full URL for API paths returned by the backend (e.g. file downloads).
 */
export function resolveApiUrl(path) {
  if (!path) return path
  if (path.startsWith('http')) return path

  const base = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

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
