import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { connectSocket, subscribeToUserEvents } from '@/services/websocketService'
import { DEV_BYPASS_AUTH } from '@/utils/constants'

export const NOTIFICATIONS_QUERY_KEY = ['notifications']
export const UNREAD_COUNT_QUERY_KEY = ['notifications', 'unread-count']

export function useNotificationSocket() {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!token || DEV_BYPASS_AUTH) return undefined

    connectSocket(token)

    const unsubscribe = subscribeToUserEvents({
      onNotificationNew: () => {
        queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
        queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY })
      },
      onNotificationRead: () => {
        queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
        queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY })
      },
    })

    return unsubscribe
  }, [token, queryClient])
}
