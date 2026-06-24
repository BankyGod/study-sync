import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { MessageSquare, Users } from 'lucide-react'
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
  const { members } = useWorkspace()
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
      <div className="flex h-full min-h-[calc(100vh-8.5rem)] items-center justify-center rounded-2xl border border-slate-200/80 bg-white">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <section className="grid h-full min-h-[calc(100vh-8.5rem)] flex-1 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Group Chat</h2>
            <p className="text-sm text-slate-500">Messages are visible only to your pod members.</p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
          <Users className="h-3.5 w-3.5" />
          {members.length} member{members.length === 1 ? '' : 's'}
        </div>
      </header>

      {error && (
        <p className="border-b border-red-100 bg-red-50 px-5 py-2 text-sm text-red-600">{error}</p>
      )}

      <ChatMessageList
        messages={messages}
        currentUserId={user?.id}
        onDeleteMessage={handleDeleteMessage}
      />
      <ChatComposer
        onSend={handleSend}
        onSendAttachment={handleSendAttachment}
        onSendVoice={handleSendVoice}
      />
    </section>
  )
}
