import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Users } from 'lucide-react'
import { ChatComposer } from '@/components/workspace/chat/ChatComposer'
import { ChatMessageList } from '@/components/workspace/chat/ChatMessageList'
import { useAuth } from '@/hooks/useAuth'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useWorkspace } from '@/context/WorkspaceContext'
import {
  deleteGroupMessage,
  loadGroupMessages,
  sendGroupAttachment,
  sendGroupMessage,
  sendGroupVoiceMessage,
} from '@/services/workspaceChatService'
import { getWorkspaceErrorMessage } from '@/utils/workspaceErrors'
import { DEV_BYPASS_AUTH } from '@/utils/constants'
import { Spinner } from '@/components/common/Spinner'

export function WorkspaceChatPanel() {
  const { groupId } = useParams()
  const { user } = useAuth()
  const { title, members } = useWorkspace()
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const reloadMessages = useCallback(async () => {
    const nextMessages = await loadGroupMessages(groupId)
    setMessages(nextMessages)
    return nextMessages
  }, [groupId])

  const socketHandlers = useMemo(
    () => ({
      onMessageNew: () => {
        reloadMessages().catch(() => {})
      },
    }),
    [reloadMessages],
  )

  useWebSocket(DEV_BYPASS_AUTH ? null : groupId, socketHandlers)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError('')
      try {
        const nextMessages = await loadGroupMessages(groupId)
        if (!cancelled) {
          setMessages(nextMessages)
        }
      } catch (err) {
        if (!cancelled) {
          setError(getWorkspaceErrorMessage(err, 'Unable to load messages.'))
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [groupId])

  const handleSend = async (content) => {
    try {
      setError('')
      const nextMessages = await sendGroupMessage(groupId, { content })
      setMessages(nextMessages)
    } catch (err) {
      setError(getWorkspaceErrorMessage(err, 'Unable to send message.'))
    }
  }

  const handleSendAttachment = async (file) => {
    try {
      setError('')
      const nextMessages = await sendGroupAttachment(groupId, { file })
      setMessages(nextMessages)
    } catch (err) {
      setError(getWorkspaceErrorMessage(err, 'Unable to upload attachment.'))
    }
  }

  const handleSendVoice = async (file, durationSec) => {
    try {
      setError('')
      const nextMessages = await sendGroupVoiceMessage(groupId, { file, durationSec })
      setMessages(nextMessages)
    } catch (err) {
      setError(getWorkspaceErrorMessage(err, 'Unable to send voice message.'))
    }
  }

  const handleDeleteMessage = async (messageId) => {
    try {
      setError('')
      const nextMessages = await deleteGroupMessage(groupId, messageId)
      setMessages(nextMessages)
    } catch (err) {
      setError(getWorkspaceErrorMessage(err, 'Unable to delete message.'))
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center bg-slate-100 lg:rounded-2xl lg:border lg:border-slate-200/80 lg:bg-white">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <section className="grid h-full min-h-0 min-w-0 flex-1 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden bg-slate-100 lg:rounded-2xl lg:border lg:border-slate-200/80 lg:bg-white lg:shadow-sm">
      <header className="flex shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white px-4 py-3 lg:px-5 lg:py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-violet-700 text-sm font-bold text-white">
          {title?.charAt(0)?.toUpperCase() ?? 'P'}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="line-clamp-2 text-base font-bold leading-snug text-slate-900 lg:truncate">
            {title}
          </h2>
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <Users className="h-3.5 w-3.5 shrink-0" />
            {members.length} member{members.length === 1 ? '' : 's'} · Pod chat
          </p>
        </div>
        <span className="hidden shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 sm:inline-flex">
          Live
        </span>
      </header>

      <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
        {error && (
          <p className="shrink-0 border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-600 lg:px-5">
            {error}
          </p>
        )}
        <ChatMessageList
          messages={messages}
          currentUserId={user?.id}
          onDeleteMessage={handleDeleteMessage}
        />
      </div>
      <ChatComposer
        onSend={handleSend}
        onSendAttachment={handleSendAttachment}
        onSendVoice={handleSendVoice}
      />
    </section>
  )
}
