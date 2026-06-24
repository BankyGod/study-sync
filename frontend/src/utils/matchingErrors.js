export const NO_ENROLLED_STUDENTS_MESSAGE =
  'There are no other enrolled students for this course yet. Please wait a while and try again.'

export const MATCHING_ERROR_CODES = {
  NO_ENROLLED_STUDENTS: 'NO_ENROLLED_STUDENTS',
}

export function isNoEnrolledStudentsError(error) {
  const code = error?.response?.data?.error?.code ?? error?.code
  const message = (error?.response?.data?.error?.message ?? error?.message ?? '').toLowerCase()

  return (
    code === MATCHING_ERROR_CODES.NO_ENROLLED_STUDENTS ||
    message.includes('no enrolled student') ||
    message.includes('no other enrolled') ||
    message.includes('no students enrolled')
  )
}

export function getMatchingErrorMessage(error, { profileReady = true } = {}) {
  if (isNoEnrolledStudentsError(error)) {
    return NO_ENROLLED_STUDENTS_MESSAGE
  }

  const code = error?.response?.data?.error?.code
  const message = error?.response?.data?.error?.message

  if (code === 'VALIDATION_ERROR' || message?.toLowerCase().includes('onboarding')) {
    return 'Complete onboarding and select a course before matching.'
  }

  if (message?.toLowerCase().includes('no course')) {
    return 'Select a course in onboarding before finding a study group.'
  }

  if (typeof error === 'string' && isNoEnrolledStudentsError({ message: error })) {
    return NO_ENROLLED_STUDENTS_MESSAGE
  }

  if (message) {
    return message
  }

  if (error?.message) {
    return error.message
  }

  return 'Unable to start matching. Please try again.'
}
