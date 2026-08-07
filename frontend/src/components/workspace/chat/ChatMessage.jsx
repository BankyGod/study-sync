import { Paperclip, Trash2, Video } from 'lucide-react'
import { VoiceMessagePlayer } from '@/components/workspace/chat/VoiceMessagePlayer'
import { MemberAvatarButton } from '@/components/workspace/MemberAvatarButton'
import { useMemberProfile } from '@/context/MemberProfileContext'
import { useAuth } from '@/hooks/useAuth'
import { useWorkspaceMember } from '@/context/WorkspaceContext'
import { useWorkspaceCall } from '@/context/WorkspaceCallContext'
import {
  downloadChatAttachment,
  formatFileSize,
  formatMessageTime,
} from '@/services/workspaceChatService'
import { normalizeCall, openCallInNewTab } from '@/services/workspaceCallService'
import { cn } from '@/utils/cn'

export function ChatMessage({
  message,
  isOwnMessage,
  showSender,
  isGroupedWithPrevious = false,
  isGroupedWithNext = false,
  onDelete,
}) {
  const member = useWorkspaceMember(message.senderId)
  const { openMemberProfile } = useMemberProfile()
  const { avatarVersion } = useAuth()
  const { startOrJoinCall, isBusy } = useWorkspaceCall()
  const isAttachment = message.type === 'attachment'
  const isVoice = message.type === 'voice'
  const isCall = message.type === 'call' || message.type === 'call.started'
  const canDelete = isOwnMessage && onDelete && !isCall
  const voiceSrc = message.voice?.streamUrl ?? message.voice?.audioDataUrl
  const timeLabel = formatMessageTime(message.sentAt)

  const bubbleRadius = isOwnMessage
    ? cn(
        'rounded-2xl rounded-br-sm lg:rounded-2xl lg:rounded-br-md',
        isGroupedWithPrevious && 'rounded-tr-2xl',
        isGroupedWithNext && 'rounded-br-2xl lg:rounded-br-2xl',
      )
    : cn(
        'rounded-2xl rounded-bl-sm lg:rounded-2xl lg:rounded-bl-md',
        isGroupedWithPrevious && 'rounded-tl-2xl',
        isGroupedWithNext && 'rounded-bl-2xl lg:rounded-bl-2xl',
      )

  const deleteButton = canDelete ? (
    <button
      type="button"
      onClick={() => onDelete(message.id)}
      className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-600 lg:flex lg:opacity-0 lg:group-hover:opacity-100 lg:focus:opacity-100"
      aria-label="Delete message"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  ) : null

  const handleJoinCallMessage = async () => {
    const call = normalizeCall(message.call ?? message.data ?? message)
    if (call?.roomUrl) {
      try {
        openCallInNewTab(call)
        return
      } catch {
        // fall through to start/join flow
      }
    }
    await startOrJoinCall({ title: call?.title || message.content || 'Pod study call' })
  }

  const callBubble = (
    <button
      type="button"
      disabled={isBusy}
      onClick={() => handleJoinCallMessage().catch(() => {})}
      className={cn(
        'inline-flex max-w-full items-center gap-3 px-4 py-3.5 text-left text-sm shadow-sm transition hover:brightness-95 disabled:opacity-60',
        bubbleRadius,
        'border border-brand-200 bg-brand-50 text-brand-800',
      )}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-surface">
        <Video className="h-4 w-4" />
      </span>
      <span className="min-w-0 pr-1">
        <span className="block font-semibold leading-snug">
          {message.content || message.call?.title || 'Pod video call'}
        </span>
        <span className="mt-1 block text-xs text-brand-700">Tap to join</span>
      </span>
    </button>
  )

  const textBubble = (
    <div
      className={cn(
        'inline-block max-w-full px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm lg:px-4 lg:py-3 lg:text-sm',
        bubbleRadius,
        isOwnMessage
          ? 'bg-brand-600 text-white'
          : 'border border-border bg-surface text-ink',
      )}
    >
      <p className="whitespace-pre-wrap break-words">{message.content}</p>
      <p
        className={cn(
          'mt-1.5 text-right text-[9px] leading-none lg:hidden',
          isOwnMessage ? 'text-brand-200' : 'text-muted',
        )}
      >
        {timeLabel}
      </p>
    </div>
  )

  const attachmentBubble = message.attachment?.deleted ? (
    <div
      className={cn(
        'inline-flex max-w-full items-center gap-2 px-3.5 py-2.5 text-xs italic opacity-80 lg:px-4 lg:py-3 lg:text-sm',
        bubbleRadius,
        isOwnMessage
          ? 'bg-brand-600 text-white'
          : 'border border-border bg-surface text-muted',
      )}
    >
      File no longer available
    </div>
  ) : (
    <button
      type="button"
      onClick={() => downloadChatAttachment(message.attachment)}
      disabled={!message.attachment?.downloadUrl}
      className={cn(
        'inline-flex max-w-full items-center gap-3 px-3.5 py-2.5 text-left text-xs shadow-sm transition active:scale-[0.98] disabled:cursor-default lg:px-4 lg:py-3 lg:text-sm',
        bubbleRadius,
        message.attachment?.downloadUrl && 'hover:brightness-95',
        isOwnMessage
          ? 'bg-brand-600 text-white'
          : 'border border-border bg-surface text-ink',
      )}
      aria-label={`Download ${message.attachment?.fileName ?? 'attachment'}`}
    >
      <div
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg lg:h-9 lg:w-9',
          isOwnMessage ? 'bg-white/20' : 'bg-brand-50 text-brand-600',
        )}
      >
        <Paperclip className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
      </div>
      <div className="min-w-0 text-left">
        <p className="truncate font-medium">{message.attachment?.fileName}</p>
        <p className={cn('text-xs', isOwnMessage ? 'text-brand-100' : 'text-slate-500')}>
          {formatFileSize(message.attachment?.fileSize ?? 0)}
          {message.attachment?.downloadUrl ? ' · Tap to download' : ''}
        </p>
      </div>
    </button>
  )

  const messageBody = isCall ? (
    callBubble
  ) : isVoice ? (
    <VoiceMessagePlayer
      src={voiceSrc}
      durationSec={message.voice?.durationSec ?? 0}
      isOwnMessage={isOwnMessage}
    />
  ) : isAttachment ? (
    attachmentBubble
  ) : (
    textBubble
  )

  if (isOwnMessage) {
    return (
      <div
        className={cn(
          'w-full min-w-0 max-w-full px-0.5',
          isGroupedWithPrevious ? 'mt-1' : 'mt-3',
        )}
      >
        <div className="group flex w-full min-w-0 items-end justify-end gap-2">
          {deleteButton}
          <div className="min-w-0 max-w-[min(85%,22rem)] shrink sm:max-w-[min(78%,28rem)]">
            {messageBody}
          </div>
        </div>
        <p className="mt-1.5 hidden text-right text-[11px] text-muted lg:block">{timeLabel}</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex w-full min-w-0 max-w-full gap-2 px-0.5 lg:gap-3',
        isGroupedWithPrevious ? 'mt-1' : 'mt-3',
      )}
    >
      {showSender ? (
        <MemberAvatarButton
          member={member}
          size="sm"
          refreshKey={avatarVersion}
          onClick={() => openMemberProfile(message.senderId)}
          className="mt-auto h-8 w-8 shrink-0 self-end text-[9px]"
        />
      ) : (
        <div className="w-8 shrink-0" />
      )}

      <div className="group min-w-0 max-w-[min(85%,22rem)] shrink sm:max-w-[min(78%,28rem)]">
        {showSender && member ? (
          <button
            type="button"
            onClick={() => openMemberProfile(message.senderId)}
            className="mb-1 px-0.5 text-[11px] font-semibold text-muted transition hover:text-brand-700 lg:text-xs"
          >
            {member.name}
          </button>
        ) : null}

        <div className="flex items-end gap-2">
          <div className="min-w-0">{messageBody}</div>
          {deleteButton}
        </div>

        <p className="mt-1.5 hidden text-[11px] text-muted lg:block">{timeLabel}</p>
      </div>
    </div>
  )
}
