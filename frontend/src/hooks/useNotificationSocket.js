import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { connectSocket, subscribeToUserEvents } from '@/services/websocketService'
import { DEV_BYPASS_AUTH } from '@/utils/constants'

export const NOTIFICATIONS_QUERY_KEY = ['notifications']
export const UNREAD_COUNT_QUERY_KEY = ['notifications', 'unread-count']

function runWhenIdle(callback) {
  if (typeof window === 'undefined') return () => {}
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(callback, { timeout: 2500 })
    return () => window.cancelIdleCallback(id)
  }
  const id = window.setTimeout(callback, 1200)
  return () => window.clearTimeout(id)
}

export function useNotificationSocket() {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!token || DEV_BYPASS_AUTH) return undefined

    let unsubscribe = () => {}
    const cancelIdle = runWhenIdle(() => {
      connectSocket(token)
      unsubscribe = subscribeToUserEvents({
        onNotificationNew: () => {
          queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
          queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY })
        },
        onNotificationRead: () => {
          queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
          queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY })
        },
      })
    })

    return () => {
      cancelIdle()
      unsubscribe()
    }
  }, [token, queryClient])
}
