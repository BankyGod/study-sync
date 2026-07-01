import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { MessageSquare, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useWebSocket } from '@/hooks/useWebSocket'
import {
  NOTIFICATIONS_QUERY_KEY,
  UNREAD_COUNT_QUERY_KEY,
} from '@/hooks/useNotificationSocket'
import { useWorkspaceMember } from '@/context/WorkspaceContext'
import { pushDevChatNotification } from '@/services/notificationsService'
import {
  clearChatUnread,
  getChatUnreadCount,
  incrementChatUnread,
} from '@/services/chatUnreadService'
import { DEV_BYPASS_AUTH } from '@/utils/constants'
import { cn } from '@/utils/cn'

const WorkspaceChatActivityContext = createContext(null)

function ChatMessageToast({ toast, onDismiss }) {
  const member = useWorkspaceMember(toast.senderId)

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-violet-200 bg-white p-4 shadow-lg shadow-violet-100/60',
      )}
      role="status"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
        <MessageSquare className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">New pod message</p>
        <p className="mt-0.5 truncate text-sm text-slate-600">
          {member?.name ?? 'Someone'}: {toast.preview}
        </p>
        <Link
          to={toast.chatPath}
          onClick={onDismiss}
          className="mt-2 inline-block text-sm font-semibold text-violet-600 hover:text-violet-700"
        >
          Open chat
        </Link>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function WorkspaceChatActivityProvider({ children }) {
  const { groupId } = useParams()
  const location = useLocation()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const isChatView = location.pathname.includes('/chat')
  const [unreadCount, setUnreadCount] = useState(() => getChatUnreadCount(groupId))
  const [toast, setToast] = useState(null)

  const markChatRead = useCallback(() => {
    if (!groupId) return
    clearChatUnread(groupId)
    setUnreadCount(0)
    setToast(null)
  }, [groupId])

  useEffect(() => {
    setUnreadCount(getChatUnreadCount(groupId))
  }, [groupId])

  useEffect(() => {
    if (isChatView) {
      markChatRead()
    }
  }, [isChatView, markChatRead])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), 6000)
    return () => window.clearTimeout(timer)
  }, [toast])

  const handleMessageNew = useCallback(
    (payload) => {
      const message = payload?.message ?? payload
      const eventGroupId = payload?.groupId ?? groupId
      if (!message || eventGroupId !== groupId) return
      if (message.senderId === user?.id) return

      const preview =
        message.type === 'attachment'
          ? message.attachment?.fileName
            ? `Shared ${message.attachment.fileName}`
            : 'Shared a file'
          : message.type === 'voice'
            ? 'Sent a voice message'
            : message.content?.slice(0, 80) || 'New message'

      if (isChatView) return

      const nextCount = incrementChatUnread(groupId)
      setUnreadCount(nextCount)

      pushDevChatNotification({
        groupId,
        message,
        preview,
        podTitle: payload?.podTitle,
      }).catch(() => {})

      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY })

      setToast({
        senderId: message.senderId,
        preview,
        chatPath: `/workspace/${groupId}/chat`,
      })
    },
    [groupId, user?.id, isChatView, queryClient],
  )

  const socketHandlers = useMemo(
    () => ({
      onMessageNew: handleMessageNew,
    }),
    [handleMessageNew],
  )

  useWebSocket(DEV_BYPASS_AUTH ? null : groupId, socketHandlers)

  const value = useMemo(
    () => ({
      unreadCount,
      markChatRead,
    }),
    [unreadCount, markChatRead],
  )

  return (
    <WorkspaceChatActivityContext.Provider value={value}>
      {children}
      {toast && !isChatView ? (
        <div className="pointer-events-none fixed inset-x-0 top-16 z-50 flex justify-center px-4 lg:top-20 lg:justify-end lg:px-6">
          <ChatMessageToast toast={toast} onDismiss={() => setToast(null)} />
        </div>
      ) : null}
    </WorkspaceChatActivityContext.Provider>
  )
}

export function useWorkspaceChatActivity() {
  const context = useContext(WorkspaceChatActivityContext)
  if (!context) {
    return { unreadCount: 0, markChatRead: () => {} }
  }
  return context
}
