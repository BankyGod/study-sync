export function getWorkspaceErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error?.response) {
    const message = (error?.message ?? '').toLowerCase()
    if (message.includes('network error') || message.includes('failed to fetch')) {
      return 'Unable to reach the server. If you are using the live site, the API may not be configured for this domain yet.'
    }
  }

  const apiError = error?.response?.data?.error

  if (apiError?.details?.length) {
    return apiError.details.map((item) => item.message).join(' ')
  }

  if (error?.response?.status === 409) {
    return apiError?.message || 'An account with this email or student ID already exists.'
  }

  return apiError?.message || error?.message || fallback
}
