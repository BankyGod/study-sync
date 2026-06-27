import { io } from 'socket.io-client'

let socket = null

export function connectSocket(token, groupId) {
  if (socket?.connected) return socket

  const url = import.meta.env.VITE_WS_URL || window.location.origin

  socket = io(url, {
    auth: { token },
    query: groupId ? { groupId } : undefined,
    autoConnect: true,
    transports: ['websocket', 'polling'],
  })

  return socket
}

export function getSocket() {
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function subscribeToWorkspaceEvents(groupId, handlers = {}) {
  const activeSocket = getSocket()
  if (!activeSocket) return () => {}

  activeSocket.emit('join:workspace', { groupId })

  const events = [
    ['task:created', handlers.onTaskCreated],
    ['task:updated', handlers.onTaskUpdated],
    ['task:deleted', handlers.onTaskDeleted],
    ['message:new', handlers.onMessageNew],
    ['file:uploaded', handlers.onFileUploaded],
    ['file:deleted', handlers.onFileDeleted],
    ['reliability:updated', handlers.onReliabilityUpdated],
  ]

  events.forEach(([event, handler]) => {
    if (handler) activeSocket.on(event, handler)
  })

  return () => {
    events.forEach(([event, handler]) => {
      if (handler) activeSocket.off(event, handler)
    })
    activeSocket.emit('leave:workspace', { groupId })
  }
}

export function subscribeToUserEvents(handlers = {}) {
  const activeSocket = getSocket()
  if (!activeSocket) return () => {}

  const events = [
    ['notification:new', handlers.onNotificationNew],
    ['notification:read', handlers.onNotificationRead],
  ]

  events.forEach(([event, handler]) => {
    if (handler) activeSocket.on(event, handler)
  })

  return () => {
    events.forEach(([event, handler]) => {
      if (handler) activeSocket.off(event, handler)
    })
  }
}
