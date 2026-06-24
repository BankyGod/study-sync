import { useEffect, useRef } from 'react'
import { QUICK_EMOJIS } from '@/components/workspace/chat/chatEmojis'
import { cn } from '@/utils/cn'

export function ChatEmojiPicker({ open, onClose, onSelect }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose()
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={panelRef}
      className="absolute bottom-full left-0 z-20 mb-2 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg"
    >
      <p className="mb-2 text-xs font-semibold text-slate-500">Quick emojis</p>
      <div className="grid grid-cols-8 gap-1">
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onSelect(emoji)}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg text-lg transition hover:bg-violet-50',
            )}
            aria-label={`Insert ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
