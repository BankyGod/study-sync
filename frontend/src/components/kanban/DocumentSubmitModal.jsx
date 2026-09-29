import { useRef, useState } from 'react'
import { CheckCircle2, FileText, FileUp, Loader2 } from 'lucide-react'
import { Modal } from '@/components/common/Modal'
import { getTaskSubmissions } from '@/services/workspaceTaskService'
import { MAX_SHARED_FILE_SIZE, formatFileSize } from '@/services/workspaceFileService'
import { cn } from '@/utils/cn'

/**
 * Opens when the assignee presses Done on a document task: upload the file(s), then submit
 * the task for the leader's review (or finish it directly when no approval is needed).
 */
export function DocumentSubmitModal({ task, needsApproval, onUpload, onSubmit, onClose }) {
  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState('')

  if (!task) return null

  const submissions = getTaskSubmissions(task)
  const hasUpload = submissions.length > 0

  const uploadFile = async (file) => {
    if (!file) return
    if (file.size > MAX_SHARED_FILE_SIZE) {
      setError(`Files must be smaller than ${formatFileSize(MAX_SHARED_FILE_SIZE)}.`)
      return
    }
    setError('')
    setIsUploading(true)
    const ok = await onUpload(file)
    setIsUploading(false)
    if (!ok) setError('Upload failed. Try again.')
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const ok = await onSubmit()
    setIsSubmitting(false)
    if (ok !== false) onClose()
  }

  return (
    <Modal open onClose={onClose} title="Submit your document">
      <p className="text-sm text-ink">
        <span className="font-semibold">{task.title}</span>
      </p>
      <p className="mt-1 text-xs text-muted">
        Upload your work, then{' '}
        {needsApproval
          ? 'send it to the group leader. The task moves to Done only after the leader approves it.'
          : 'mark the task as done.'}{' '}
        Uploads are also saved in the pod&apos;s Files tab.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          uploadFile(file)
        }}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragOver(false)
          uploadFile(event.dataTransfer.files?.[0])
        }}
        disabled={isUploading || isSubmitting}
        className={cn(
          'mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition disabled:opacity-60',
          isDragOver
            ? 'border-violet-500 bg-violet-50'
            : 'border-violet-200 bg-violet-50/40 hover:bg-violet-50',
        )}
      >
        {isUploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-violet-700" />
        ) : (
          <FileUp className="h-6 w-6 text-violet-700" />
        )}
        <span className="text-sm font-semibold text-violet-900">
          {isUploading
            ? 'Uploading…'
            : hasUpload
              ? 'Upload another version'
              : 'Click to choose a file or drop it here'}
        </span>
        <span className="text-xs text-muted">
          Max {formatFileSize(MAX_SHARED_FILE_SIZE)} · PDF, Word, slides, images…
        </span>
      </button>

      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}

      {hasUpload ? (
        <ul className="mt-4 space-y-1.5">
          {submissions.map((submission) => (
            <li
              key={submission.id ?? submission.fileId}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
            >
              <FileText className="h-4 w-4 shrink-0 text-violet-700" />
              <span className="min-w-0 flex-1 truncate text-sm text-ink">{submission.fileName}</span>
              {submission.fileSize ? (
                <span className="shrink-0 text-[11px] text-muted">
                  {formatFileSize(submission.fileSize)}
                </span>
              ) : null}
              <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-600" />
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={onClose}
          className="min-h-10 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-ink hover:bg-page"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!hasUpload || isUploading || isSubmitting}
          className="min-h-10 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-surface hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? 'Submitting…'
            : needsApproval
              ? 'Submit for leader review'
              : 'Mark as done'}
        </button>
      </div>
    </Modal>
  )
}
