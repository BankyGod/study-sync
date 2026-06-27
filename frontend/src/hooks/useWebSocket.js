import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { connectSocket, subscribeToWorkspaceEvents } from '@/services/websocketService'

export function useWebSocket(groupId, handlers = {}) {
  const { token } = useAuth()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!token || !groupId) return undefined

    const socket = connectSocket(token, groupId)

    const onConnect = () => setIsConnected(true)
    const onDisconnect = () => setIsConnected(false)

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    const unsubscribe = subscribeToWorkspaceEvents(groupId, handlers)

    return () => {
      unsubscribe()
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      setIsConnected(false)
    }
  }, [token, groupId, handlers])

  return { isConnected }
}
