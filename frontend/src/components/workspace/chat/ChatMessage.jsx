import { Paperclip, Trash2 } from 'lucide-react'
import { VoiceMessagePlayer } from '@/components/workspace/chat/VoiceMessagePlayer'
import { MemberAvatarButton } from '@/components/workspace/MemberAvatarButton'
import { useMemberProfile } from '@/context/MemberProfileContext'
import { useAuth } from '@/hooks/useAuth'
import { useWorkspaceMember } from '@/context/WorkspaceContext'
import {
  downloadChatAttachment,
  formatFileSize,
  formatMessageTime,
} from '@/services/workspaceChatService'
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
  const isAttachment = message.type === 'attachment'
  const isVoice = message.type === 'voice'
  const canDelete = isOwnMessage && onDelete
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

  const textBubble = (
    <div
      className={cn(
        'inline-block max-w-full px-2.5 py-1.5 text-[13px] leading-snug shadow-sm lg:px-4 lg:py-2.5 lg:text-sm lg:leading-relaxed',
        bubbleRadius,
        isOwnMessage
          ? 'bg-violet-600 text-white'
          : 'border border-slate-200/60 bg-white text-slate-800',
      )}
    >
      <p className="whitespace-pre-wrap break-words">{message.content}</p>
      <p
        className={cn(
          'mt-0.5 text-right text-[9px] leading-none lg:hidden',
          isOwnMessage ? 'text-violet-200' : 'text-slate-400',
        )}
      >
        {timeLabel}
      </p>
    </div>
  )

  const attachmentBubble = message.attachment?.deleted ? (
    <div
      className={cn(
        'inline-flex max-w-full items-center gap-2 px-2.5 py-2 text-xs italic opacity-80 lg:px-4 lg:py-3 lg:text-sm',
        bubbleRadius,
        isOwnMessage
          ? 'bg-violet-600 text-white'
          : 'border border-slate-200/60 bg-white text-slate-500',
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
        'inline-flex max-w-full items-center gap-2 px-2.5 py-2 text-left text-xs shadow-sm transition active:scale-[0.98] disabled:cursor-default lg:gap-3 lg:px-4 lg:py-3 lg:text-sm',
        bubbleRadius,
        message.attachment?.downloadUrl && 'hover:brightness-95',
        isOwnMessage
          ? 'bg-violet-600 text-white'
          : 'border border-slate-200/60 bg-white text-slate-800',
      )}
      aria-label={`Download ${message.attachment?.fileName ?? 'attachment'}`}
    >
      <div
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg lg:h-9 lg:w-9',
          isOwnMessage ? 'bg-white/20' : 'bg-violet-50 text-violet-600',
        )}
      >
        <Paperclip className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
      </div>
      <div className="min-w-0 text-left">
        <p className="truncate font-medium">{message.attachment?.fileName}</p>
        <p className={cn('text-xs', isOwnMessage ? 'text-violet-100' : 'text-slate-500')}>
          {formatFileSize(message.attachment?.fileSize ?? 0)}
          {message.attachment?.downloadUrl ? ' · Tap to download' : ''}
        </p>
      </div>
    </button>
  )

  const messageBody = isVoice ? (
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
          'w-full min-w-0 max-w-full',
          isGroupedWithPrevious ? 'mt-0.5' : 'mt-2 lg:mt-0',
        )}
      >
        <div className="group flex w-full min-w-0 items-end justify-end gap-1.5">
          {deleteButton}
          <div className="min-w-0 max-w-[72%] shrink lg:max-w-[75%]">{messageBody}</div>
        </div>
        <p className="mt-1 hidden text-right text-[11px] text-slate-400 lg:block">{timeLabel}</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex w-full min-w-0 max-w-full gap-1.5 lg:gap-3',
        isGroupedWithPrevious ? 'mt-0.5' : 'mt-2 lg:mt-0',
      )}
    >
      {showSender ? (
        <MemberAvatarButton
          member={member}
          size="sm"
          refreshKey={avatarVersion}
          onClick={() => openMemberProfile(message.senderId)}
            className="mt-auto h-7 w-7 shrink-0 self-end text-[9px] lg:h-8 lg:w-8 lg:text-[10px]"
        />
      ) : (
        <div className="w-7 shrink-0 lg:w-8" />
      )}

      <div className="group min-w-0 max-w-[72%] shrink lg:max-w-[75%]">
        {showSender && member && (
          <button
            type="button"
            onClick={() => openMemberProfile(message.senderId)}
            className="mb-0.5 px-0.5 text-[11px] font-semibold text-slate-600 transition hover:text-violet-700 lg:mb-1 lg:text-xs"
          >
            {member.name}
          </button>
        )}

        <div className="flex items-end gap-1.5">
          <div className="min-w-0">{messageBody}</div>
          {deleteButton}
        </div>

        <p className="mt-1 hidden text-[11px] text-slate-400 lg:block">{timeLabel}</p>
      </div>
    </div>
  )
}
