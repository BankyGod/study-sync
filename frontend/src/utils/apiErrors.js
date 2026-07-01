export function isNetworkError(error) {
  if (error?.response) return false

  const message = (error?.message ?? '').toLowerCase()
  return (
    Boolean(error?.request) ||
    message.includes('network error') ||
    message.includes('failed to fetch') ||
    message.includes('network request failed')
  )
}

export function getApiErrorMessage(error, fallback = 'Request failed. Please try again.') {
  if (isNetworkError(error)) {
    return "Can't reach server. Check your connection, or ask an admin to add this site to backend CORS."
  }

  const apiError = error?.response?.data?.error

  if (apiError?.details?.length) {
    return apiError.details.map((item) => item.message).join(' ')
  }

  if (apiError?.message) {
    return apiError.message
  }

  if (error?.response?.status) {
    return `Request failed (${error.response.status})`
  }

  return error?.message || fallback
}
