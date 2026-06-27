import { useEffect, useId, useRef, useState } from 'react'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/utils/cn'

export function TaskCardActionsMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const handleEdit = (event) => {
    event.stopPropagation()
    setOpen(false)
    onEdit?.()
  }

  const handleDelete = (event) => {
    event.stopPropagation()
    setOpen(false)
    onDelete?.()
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          setOpen((value) => !value)
        }}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700',
          open && 'bg-slate-100 text-slate-700',
        )}
        aria-label="Task actions"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 min-w-[9.5rem] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleEdit}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
          >
            <Pencil className="h-3.5 w-3.5 text-slate-400" />
            Edit
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleDelete}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      ) : null}
    </div>
  )
}
