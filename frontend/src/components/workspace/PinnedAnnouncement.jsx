import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Megaphone, Pencil, Trash2 } from 'lucide-react'
import { useWorkspace } from '@/context/WorkspaceContext'
import { useWorkspaceLeader } from '@/hooks/useWorkspaceLeader'
import { getWorkspaceErrorMessage } from '@/utils/workspaceErrors'
import { cn } from '@/utils/cn'

const MAX_LENGTH = 500

export function PinnedAnnouncement({ className }) {
  const { announcement, saveAnnouncement } = useWorkspace()
  const { isLeader } = useWorkspaceLeader()
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  if (!announcement && !isLeader) return null

  const startEditing = () => {
    setDraft(announcement?.text ?? '')
    setIsEditing(true)
  }

  const save = async (text) => {
    setIsSaving(true)
    try {
      await saveAnnouncement(text)
      setIsEditing(false)
    } catch (error) {
      window.alert(getWorkspaceErrorMessage(error, 'Unable to save the announcement.'))
    } finally {
      setIsSaving(false)
    }
  }

  const clear = () => {
    if (window.confirm('Remove the pinned announcement for everyone?')) save('')
  }

  if (isEditing) {
    return (
      <form
        className={cn('rounded-lg border border-brand-200 bg-brand-50/60 p-3', className)}
        onSubmit={(event) => {
          event.preventDefault()
          save(draft)
        }}
      >
        <label htmlFor="pod-announcement" className="text-xs font-semibold text-brand-800">
          Pinned announcement
        </label>
        <textarea
          id="pod-announcement"
          value={draft}
          maxLength={MAX_LENGTH}
          rows={3}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="e.g. Finish your chapter summaries before Friday's session."
          className="mt-1.5 w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-[11px] text-muted">
            {draft.length}/{MAX_LENGTH}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="min-h-9 rounded-md border border-border bg-surface px-3 text-xs font-semibold text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="min-h-9 rounded-md bg-brand-600 px-3 text-xs font-semibold text-surface disabled:opacity-60"
            >
              {isSaving ? 'Saving…' : 'Pin'}
            </button>
          </div>
        </div>
      </form>
    )
  }

  if (!announcement) {
    return (
      <button
        type="button"
        onClick={startEditing}
        className={cn(
          'flex w-full items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-left text-xs font-medium text-muted transition hover:border-brand-300 hover:text-ink',
          className,
        )}
      >
        <Megaphone className="h-3.5 w-3.5" />
        Pin an announcement for your pod
      </button>
    )
  }

  const updatedAt = announcement.updatedAt ? new Date(announcement.updatedAt) : null

  return (
    <section
      className={cn('rounded-lg border border-brand-200 bg-brand-50/60 px-3 py-2.5', className)}
      aria-label="Pinned announcement"
    >
      <div className="flex items-start gap-2">
        <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
        <div className="min-w-0 flex-1">
          <p className="whitespace-pre-line break-words text-sm text-ink">{announcement.text}</p>
          <p className="mt-1 text-[11px] text-muted">
            Leader announcement
            {announcement.author?.name ? ` · ${announcement.author.name}` : ''}
            {updatedAt && !Number.isNaN(updatedAt.getTime())
              ? ` · ${formatDistanceToNow(updatedAt, { addSuffix: true })}`
              : ''}
          </p>
        </div>
        {isLeader ? (
          <div className="flex shrink-0">
            <button
              type="button"
              onClick={startEditing}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-ink"
              aria-label="Edit announcement"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={clear}
              disabled={isSaving}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-red-700"
              aria-label="Remove announcement"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
