import { useEffect, useRef, useState } from 'react'
import { Camera, Loader2, Trash2 } from 'lucide-react'
import { getProfileInitials, readCachedUserAvatar } from '@/services/usersService'
import { DEV_BYPASS_AUTH } from '@/utils/constants'
import { cn } from '@/utils/cn'

const SIZE_CLASSES = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-14 w-14 text-sm',
  lg: 'h-20 w-20 text-2xl',
  xl: 'h-24 w-24 text-2xl',
}

export function ProfileAvatar({
  userId,
  fullName = '',
  avatarUrl = null,
  size = 'lg',
  className,
  editable = false,
  refreshKey = 0,
  onUpload,
  onRemove,
  isUploading = false,
}) {
  const [src, setSrc] = useState(() => avatarUrl || (DEV_BYPASS_AUTH ? readCachedUserAvatar(userId) : null))
  const [hasPhoto, setHasPhoto] = useState(Boolean(avatarUrl || (DEV_BYPASS_AUTH && readCachedUserAvatar(userId))))
  const fileInputRef = useRef(null)
  const initials = getProfileInitials(fullName)

  useEffect(() => {
    if (avatarUrl) {
      setSrc(avatarUrl)
      setHasPhoto(true)
      return
    }

    if (DEV_BYPASS_AUTH) {
      const cached = readCachedUserAvatar(userId)
      setSrc(cached)
      setHasPhoto(Boolean(cached))
      return
    }

    setSrc(null)
    setHasPhoto(false)
  }, [avatarUrl, userId, refreshKey])

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file && onUpload) {
      onUpload(file)
    }
  }

  const showInitials = !src

  return (
    <div className={cn('relative shrink-0', className)}>
      <div
        className={cn(
          'relative overflow-hidden rounded-full bg-sky-500 font-bold text-white',
          SIZE_CLASSES[size] ?? SIZE_CLASSES.lg,
          editable && 'ring-2 ring-white ring-offset-2 ring-offset-white',
        )}
      >
        {showInitials ? (
          <span className="flex h-full w-full items-center justify-center">{initials || 'A'}</span>
        ) : (
          <img src={src} alt="" className="h-full w-full object-cover" />
        )}

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
        )}
      </div>

      {editable && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-violet-600 text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-60"
            aria-label="Upload profile photo"
          >
            <Camera className="h-4 w-4" />
          </button>
        </>
      )}

      {editable && hasPhoto && onRemove && !isUploading && (
        <button
          type="button"
          onClick={onRemove}
          className="mt-2 flex w-full items-center justify-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove photo
        </button>
      )}
    </div>
  )
}
