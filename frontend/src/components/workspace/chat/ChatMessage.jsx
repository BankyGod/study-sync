import { Paperclip, Trash2 } from 'lucide-react'
import { VoiceMessagePlayer } from '@/components/workspace/chat/VoiceMessagePlayer'
import { useWorkspaceMember } from '@/context/WorkspaceContext'
import { formatFileSize, formatMessageTime } from '@/services/workspaceChatService'
import { cn } from '@/utils/cn'

export function ChatMessage({ message, isOwnMessage, showSender, onDelete }) {
  const member = useWorkspaceMember(message.senderId)
  const isAttachment = message.type === 'attachment'
  const isVoice = message.type === 'voice'
  const canDelete = isOwnMessage && onDelete
  const voiceSrc = message.voice?.streamUrl ?? message.voice?.audioDataUrl

  return (
    <div className={cn('flex gap-3', isOwnMessage ? 'flex-row-reverse' : 'flex-row')}>
      {!isOwnMessage && showSender ? (
        <div
          className={cn(
            'mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white',
            member?.color ?? 'bg-slate-400',
          )}
        >
          {member?.initials ?? '?'}
        </div>
      ) : (
        !isOwnMessage && <div className="w-8 shrink-0" />
      )}

      <div className={cn('group relative max-w-[75%]', isOwnMessage && 'items-end text-right')}>
        {!isOwnMessage && showSender && member && (
          <p className="mb-1 text-xs font-semibold text-slate-600">{member.name}</p>
        )}

        <div className={cn('relative inline-flex max-w-full', isOwnMessage && 'flex-row-reverse')}>
          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete(message.id)}
              className={cn(
                'mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 focus:opacity-100',
                isOwnMessage ? 'ml-2' : 'mr-2',
              )}
              aria-label="Delete message"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}

          {isVoice ? (
            <VoiceMessagePlayer
              src={voiceSrc}
              durationSec={message.voice?.durationSec ?? 0}
              isOwnMessage={isOwnMessage}
            />
          ) : isAttachment ? (
            <div
              className={cn(
                'inline-flex max-w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm shadow-sm',
                isOwnMessage
                  ? 'rounded-br-md bg-violet-600 text-white'
                  : 'rounded-bl-md border border-slate-200/80 bg-slate-50 text-slate-800',
              )}
            >
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                  isOwnMessage ? 'bg-white/20' : 'bg-violet-50 text-violet-600',
                )}
              >
                <Paperclip className="h-4 w-4" />
              </div>
              <div className="min-w-0 text-left">
                <p className="truncate font-medium">{message.attachment?.fileName}</p>
                <p className={cn('text-xs', isOwnMessage ? 'text-violet-100' : 'text-slate-500')}>
                  {formatFileSize(message.attachment?.fileSize ?? 0)}
                </p>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                'inline-block rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm',
                isOwnMessage
                  ? 'rounded-br-md bg-violet-600 text-white'
                  : 'rounded-bl-md border border-slate-200/80 bg-slate-50 text-slate-800',
              )}
            >
              {message.content}
            </div>
          )}
        </div>

        <p className={cn('mt-1 text-[11px] text-slate-400', isOwnMessage && 'text-right')}>
          {formatMessageTime(message.sentAt)}
        </p>
      </div>
    </div>
  )
}
