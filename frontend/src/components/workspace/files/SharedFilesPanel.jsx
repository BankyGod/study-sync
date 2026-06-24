import { useEffect, useRef, useState } from 'react'
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
import {
  CURRENT_FILE_USER_ID,
  MAX_SHARED_FILE_SIZE,
  deleteGroupFile,
  formatFileSize,
  formatUploadedAt,
  getFileIconType,
  getTotalFileSize,
  loadGroupFiles,
  uploadGroupFile,
} from '@/services/workspaceFileService'
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
  image: 'bg-pink-50 text-pink-600',
  pdf: 'bg-red-50 text-red-600',
  doc: 'bg-sky-50 text-sky-600',
  sheet: 'bg-emerald-50 text-emerald-600',
  slides: 'bg-amber-50 text-amber-600',
  file: 'bg-slate-100 text-slate-600',
}

export function SharedFilesPanel() {
  const { groupId } = useParams()
  const [files, setFiles] = useState(() => loadGroupFiles(groupId))
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    setFiles(loadGroupFiles(groupId))
    setError('')
  }, [groupId])

  const handleUpload = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      setError('')
      const nextFiles = uploadGroupFile(groupId, {
        file,
        uploadedBy: 'Alex',
        uploadedById: CURRENT_FILE_USER_ID,
      })
      setFiles(nextFiles)
    } catch (uploadError) {
      setError(uploadError.message || 'Unable to upload file.')
    }
  }

  const handleDelete = (fileId) => {
    try {
      setError('')
      const nextFiles = deleteGroupFile(groupId, fileId)
      setFiles(nextFiles)
    } catch (deleteError) {
      setError(deleteError.message || 'Unable to delete file.')
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Shared Files</h2>
          <p className="mt-1 text-sm text-slate-500">
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
            className="session-start-btn inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            <Upload className="h-4 w-4" />
            Upload File
          </button>
        </div>
      </div>

      {error && (
        <p className="border-b border-red-100 bg-red-50 px-6 py-2 text-sm text-red-600">{error}</p>
      )}

      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 text-violet-600">
            <Upload className="h-6 w-6" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-700">No files uploaded yet</p>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Upload notes, assignments, and project assets for your study group.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {files.map((file) => {
            const iconType = getFileIconType(file.fileType, file.fileName)
            const Icon = FILE_ICONS[iconType]
            const canDelete = file.uploadedById === CURRENT_FILE_USER_ID

            return (
              <li
                key={file.id}
                className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 transition hover:bg-slate-50/80"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                      FILE_ICON_STYLES[iconType],
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{file.fileName}</p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {formatFileSize(file.fileSize)} · Uploaded by {file.uploadedBy} ·{' '}
                      {formatUploadedAt(file.uploadedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(file.id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      aria-label={`Delete ${file.fileName}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <p className="border-t border-slate-100 px-6 py-3 text-center text-xs text-slate-400">
        Max upload size {formatFileSize(MAX_SHARED_FILE_SIZE)} per file
      </p>
    </section>
  )
}
