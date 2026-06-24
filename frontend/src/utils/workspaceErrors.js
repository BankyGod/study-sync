export function getWorkspaceErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const apiError = error?.response?.data?.error

  if (apiError?.details?.length) {
    return apiError.details.map((item) => item.message).join(' ')
  }

  return apiError?.message || error?.message || fallback
}
