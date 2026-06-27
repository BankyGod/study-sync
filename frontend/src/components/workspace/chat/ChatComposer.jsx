import { useRef, useState } from 'react'
import { Mic, Paperclip, Send, Smile, Square, X } from 'lucide-react'
import { ChatEmojiPicker } from '@/components/workspace/chat/ChatEmojiPicker'
import { formatVoiceDuration, useVoiceRecorder } from '@/hooks/useVoiceRecorder'
import {
  MAX_CHAT_FILE_SIZE,
  MAX_VOICE_DURATION_SEC,
  formatFileSize,
} from '@/services/workspaceChatService'
import { cn } from '@/utils/cn'

const ACCEPTED_FILE_TYPES =
  'image/*,.pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.zip'

export function ChatComposer({
  onSend,
  onSendAttachment,
  onSendVoice,
  disabled = false,
}) {
  const [draft, setDraft] = useState('')
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)

  const {
    isRecording,
    durationSec,
    error: recorderError,
    setError: setRecorderError,
    startRecording,
    cancelRecording,
    sendRecording,
  } = useVoiceRecorder({
    maxDurationSec: MAX_VOICE_DURATION_SEC,
    onRecorded: async ({ file, durationSec: recordedDuration }) => {
      try {
        setUploadError('')
        await onSendVoice(file, recordedDuration)
      } catch (error) {
        setUploadError(error.message || 'Unable to send voice message.')
      }
    },
  })

  const displayError = uploadError || recorderError
  const hasDraft = draft.trim().length > 0

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!draft.trim() || disabled || isRecording) return
    onSend(draft)
    setDraft('')
    setUploadError('')
    setRecorderError('')
  }

  const insertEmoji = (emoji) => {
    const textarea = textareaRef.current
    if (!textarea) {
      setDraft((value) => `${value}${emoji}`)
      setEmojiOpen(false)
      return
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const nextValue = `${draft.slice(0, start)}${emoji}${draft.slice(end)}`
    setDraft(nextValue)
    setEmojiOpen(false)

    requestAnimationFrame(() => {
      textarea.focus()
      const cursor = start + emoji.length
      textarea.setSelectionRange(cursor, cursor)
    })
  }

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file || disabled || isRecording) return

    if (file.size > MAX_CHAT_FILE_SIZE) {
      setUploadError(`Files must be smaller than ${formatFileSize(MAX_CHAT_FILE_SIZE)}.`)
      return
    }

    try {
      setUploadError('')
      setRecorderError('')
      await onSendAttachment(file)
    } catch (error) {
      setUploadError(error.message || 'Unable to upload file.')
    }
  }

  const handleMicClick = async () => {
    if (disabled) return
    setUploadError('')
    setRecorderError('')

    if (isRecording) {
      sendRecording()
      return
    }

    setEmojiOpen(false)
    await startRecording()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 border-t border-slate-200/80 bg-white px-2 py-2 lg:border-slate-100 lg:px-5 lg:py-4"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))' }}
    >
      {isRecording && (
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 lg:mb-3 lg:px-4 lg:py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-red-600">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
            Recording {formatVoiceDuration(durationSec)}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancelRecording}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
            <button
              type="button"
              onClick={sendRecording}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
              Send
            </button>
          </div>
        </div>
      )}

      <div className="flex items-end gap-1 lg:gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isRecording}
          className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 lg:h-9 lg:w-9"
          aria-label="Attach file"
        >
          <Paperclip className="h-5 w-5 lg:h-4 lg:w-4" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={ACCEPTED_FILE_TYPES}
          onChange={handleFileSelect}
        />

        <div className="relative flex min-w-0 flex-1 items-end gap-1 rounded-3xl border border-slate-200 bg-slate-50 px-2 py-1 focus-within:border-violet-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-violet-100 lg:gap-2 lg:rounded-2xl lg:px-3 lg:py-1.5">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                handleSubmit(event)
              }
            }}
            rows={1}
            disabled={isRecording}
            placeholder={isRecording ? 'Recording…' : 'Message'}
            className="max-h-24 min-h-[34px] min-w-0 flex-1 resize-none bg-transparent py-1.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-60 lg:min-h-[38px] lg:py-2 lg:text-sm"
          />

          <div className="relative mb-0.5 hidden shrink-0 lg:mb-0 lg:block">
            <button
              type="button"
              onClick={() => setEmojiOpen((open) => !open)}
              disabled={disabled || isRecording}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50',
                emojiOpen && 'bg-violet-50 text-violet-600',
              )}
              aria-label="Add emoji"
              aria-expanded={emojiOpen}
            >
              <Smile className="h-4 w-4" />
            </button>

            <ChatEmojiPicker
              open={emojiOpen}
              onClose={() => setEmojiOpen(false)}
              onSelect={insertEmoji}
            />
          </div>

          {/* Desktop: mic inside bar */}
          <button
            type="button"
            onClick={handleMicClick}
            disabled={disabled}
            className={cn(
              'mb-0.5 hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50 lg:mb-0 lg:flex',
              isRecording
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'text-slate-500 hover:bg-slate-100',
            )}
            aria-label={isRecording ? 'Stop and send recording' : 'Record voice message'}
          >
            <Mic className="h-4 w-4" />
          </button>

          {/* Desktop: send inside bar */}
          <button
            type="submit"
            disabled={!hasDraft || disabled || isRecording}
            className={cn(
              'session-start-btn mb-0.5 hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow-sm transition lg:mb-0 lg:flex',
              (!hasDraft || disabled || isRecording) && 'cursor-not-allowed opacity-50',
            )}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile: WhatsApp-style mic ↔ send toggle outside the pill */}
        {hasDraft ? (
          <button
            type="submit"
            disabled={disabled || isRecording}
            className={cn(
              'session-start-btn mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition active:scale-95 lg:hidden',
              (disabled || isRecording) && 'cursor-not-allowed opacity-50',
            )}
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleMicClick}
            disabled={disabled}
            className={cn(
              'mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-violet-600 transition active:scale-95 active:bg-violet-50 lg:hidden',
              isRecording && 'bg-red-100 text-red-600',
              disabled && 'cursor-not-allowed opacity-50',
            )}
            aria-label={isRecording ? 'Stop and send recording' : 'Record voice message'}
          >
            <Mic className="h-5 w-5" />
          </button>
        )}
      </div>

      {displayError ? (
        <p className="mt-1.5 text-center text-[11px] text-red-500">{displayError}</p>
      ) : (
        <p className="mt-1.5 hidden text-center text-[11px] text-slate-400 lg:block">
          Press Enter to send · Mic for voice notes up to {MAX_VOICE_DURATION_SEC}s
        </p>
      )}
    </form>
  )
}
