import { getApiErrorMessage } from '@/utils/apiErrors'

export function getWorkspaceErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return getApiErrorMessage(error, fallback)
}
