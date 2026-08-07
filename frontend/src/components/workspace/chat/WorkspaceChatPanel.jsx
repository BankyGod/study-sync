import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, LogOut, Users, Video } from 'lucide-react'
import { ChatComposer } from '@/components/workspace/chat/ChatComposer'
import { ChatMessageList } from '@/components/workspace/chat/ChatMessageList'
import { ActiveCallBanner } from '@/components/workspace/ActiveCallBanner'
import { useAuth } from '@/hooks/useAuth'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useWorkspace } from '@/context/WorkspaceContext'
import { useWorkspaceCall } from '@/context/WorkspaceCallContext'
import {
  deleteGroupMessage,
  loadGroupMessages,
  sendGroupAttachment,
  sendGroupMessage,
  sendGroupVoiceMessage,
} from '@/services/workspaceChatService'
import { leaveStudyGroup } from '@/services/matchingService'
import { getMatchingErrorMessage } from '@/utils/matchingErrors'
import { getWorkspaceErrorMessage } from '@/utils/workspaceErrors'
import { DEV_BYPASS_AUTH, ROUTES } from '@/utils/constants'
import { Spinner } from '@/components/common/Spinner'

export function WorkspaceChatPanel() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { title, members } = useWorkspace()
  const { activeCall, isBusy, startOrJoinCall } = useWorkspaceCall()
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isLeaving, setIsLeaving] = useState(false)

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

  const handleLeavePod = async () => {
    if (!groupId) return
    if (
      !window.confirm(
        'Leave this study pod? You can search again later if there is still space.',
      )
    ) {
      return
    }

    setIsLeaving(true)
    try {
      await leaveStudyGroup(groupId)
      navigate(ROUTES.WORKSPACE_LIST)
    } catch (leaveError) {
      window.alert(getMatchingErrorMessage(leaveError) || 'Unable to leave this pod.')
    } finally {
      setIsLeaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center bg-page lg:border lg:border-border lg:bg-surface">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <section className="grid h-full min-h-0 min-w-0 flex-1 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden bg-page lg:border lg:border-border lg:bg-surface">
      <header className="shrink-0 border-b border-border bg-surface px-4 py-3 sm:px-5 lg:px-6 lg:py-3.5">
        <div className="mb-2 flex items-center justify-between gap-2 lg:hidden">
          <Link
            to={ROUTES.WORKSPACE_LIST}
            className="inline-flex min-h-9 items-center gap-1.5 text-xs font-medium text-muted transition hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All pods
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-surface">
            {title?.charAt(0)?.toUpperCase() ?? 'P'}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="line-clamp-2 font-display text-base font-semibold leading-snug text-ink lg:truncate">
              {title}
            </h2>
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <Users className="h-3.5 w-3.5 shrink-0" />
              {members.length} member{members.length === 1 ? '' : 's'} · Pod chat
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => startOrJoinCall({ title: `${title || 'Pod'} study call` })}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-semibold text-ink transition hover:bg-page disabled:opacity-60 sm:px-3"
            >
              <Video className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{activeCall ? 'Join call' : 'Start call'}</span>
            </button>
            <button
              type="button"
              disabled={isLeaving}
              onClick={handleLeavePod}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-muted transition hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
              aria-label="Leave pod"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isLeaving ? 'Leaving…' : 'Leave'}</span>
            </button>
          </div>
        </div>

        <ActiveCallBanner className="mt-3" />
      </header>

      <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
        {error ? (
          <p className="shrink-0 border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-600 lg:px-5">
            {error}
          </p>
        ) : null}
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
