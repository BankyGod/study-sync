import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Download,
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  Presentation,
  Trash2,
  Upload,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useWebSocket } from '@/hooks/useWebSocket'
import {
  MAX_SHARED_FILE_SIZE,
  deleteGroupFile,
  downloadGroupFile,
  formatFileSize,
  formatUploadedAt,
  getFileIconType,
  getTotalFileSize,
  loadGroupFiles,
  uploadGroupFile,
} from '@/services/workspaceFileService'
import { getWorkspaceErrorMessage } from '@/utils/workspaceErrors'
import { DEV_BYPASS_AUTH } from '@/utils/constants'
import { Spinner } from '@/components/common/Spinner'
import { cn } from '@/utils/cn'

const FILE_ICONS = {
  image: FileImage,
  pdf: FileText,
  doc: FileText,
  sheet: FileSpreadsheet,
  slides: Presentation,
  file: File,
}

const FILE_ICON_STYLES = {
  image: 'bg-brand-50 text-brand-700',
  pdf: 'bg-red-50 text-red-700',
  doc: 'bg-brand-50 text-brand-700',
  sheet: 'bg-brand-100 text-brand-800',
  slides: 'bg-ochre-soft text-ochre',
  file: 'bg-page text-muted',
}

export function SharedFilesPanel() {
  const { groupId } = useParams()
  const { user } = useAuth()
  const [files, setFiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const refreshFiles = useCallback(
    async ({ showLoading = false } = {}) => {
      if (showLoading) setIsLoading(true)
      setError('')
      try {
        const nextFiles = await loadGroupFiles(groupId)
        setFiles(nextFiles)
      } catch (err) {
        setError(getWorkspaceErrorMessage(err, 'Unable to load files.'))
      } finally {
        if (showLoading) setIsLoading(false)
      }
    },
    [groupId],
  )

  useEffect(() => {
    refreshFiles({ showLoading: true })
  }, [refreshFiles])

  const socketHandlers = useMemo(
    () => ({
      onFileUploaded: () => {
        refreshFiles().catch(() => {})
      },
      onFileDeleted: () => {
        refreshFiles().catch(() => {})
      },
      onMessageNew: (payload) => {
        if (payload?.message?.type === 'attachment') {
          refreshFiles().catch(() => {})
        }
      },
    }),
    [refreshFiles],
  )

  useWebSocket(DEV_BYPASS_AUTH ? null : groupId, socketHandlers)

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      setError('')
      const nextFiles = await uploadGroupFile(groupId, { file })
      setFiles(nextFiles)
    } catch (uploadError) {
      setError(getWorkspaceErrorMessage(uploadError, 'Unable to upload file.'))
    }
  }

  const handleDelete = async (fileId) => {
    try {
      setError('')
      const nextFiles = await deleteGroupFile(groupId, fileId)
      setFiles(nextFiles)
    } catch (deleteError) {
      setError(getWorkspaceErrorMessage(deleteError, 'Unable to delete file.'))
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <section>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">Shared files</h2>
          <p className="mt-1 text-sm text-muted">
            {files.length} file{files.length === 1 ? '' : 's'} · {formatFileSize(getTotalFileSize(files))}{' '}
            shared with your pod
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-surface transition hover:bg-brand-700"
          >
            <Upload className="h-4 w-4" />
            Upload file
          </button>
        </div>
      </header>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {files.length === 0 ? (
        <div className="py-12">
          <p className="text-sm font-medium text-ink">No files uploaded yet</p>
          <p className="mt-1 max-w-md text-sm text-muted">
            Upload notes and project assets here, or share files in pod chat — they appear in this
            library.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {files.map((file) => {
            const iconType = getFileIconType(file.fileType, file.fileName)
            const Icon = FILE_ICONS[iconType]
            const canDelete = file.uploadedById === user?.id

            return (
              <li
                key={file.id}
                className="flex flex-wrap items-center justify-between gap-4 py-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                      FILE_ICON_STYLES[iconType],
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{file.fileName}</p>
                    <p className="mt-0.5 truncate text-sm text-muted">
                      {formatFileSize(file.fileSize)} · {file.uploadedBy} ·{' '}
                      {formatUploadedAt(file.uploadedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => downloadGroupFile(file)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-ink transition hover:bg-page"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                  {canDelete ? (
                    <button
                      type="button"
                      onClick={() => handleDelete(file.id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-red-50 hover:text-red-700"
                      aria-label={`Delete ${file.fileName}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <p className="border-t border-border pt-3 text-xs text-muted">
        Max upload size {formatFileSize(MAX_SHARED_FILE_SIZE)} per file
      </p>
    </section>
  )
}
