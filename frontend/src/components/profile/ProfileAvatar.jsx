import { useEffect, useRef, useState } from 'react'
import { Camera, Loader2, Trash2 } from 'lucide-react'
import {
  getProfileInitials,
  loadDisplayableAvatarSrc,
  readCachedUserAvatar,
  revokeUserAvatarObjectUrl,
} from '@/services/usersService'
import { DEV_BYPASS_AUTH } from '@/utils/constants'
import { cn } from '@/utils/cn'

const SIZE_CLASSES = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-14 w-14 text-sm',
  lg: 'h-16 w-16 text-xl sm:h-20 sm:w-20 sm:text-2xl',
  xl: 'h-24 w-24 text-2xl',
}

const CAMERA_SIZES = {
  sm: 'h-6 w-6',
  md: 'h-7 w-7',
  lg: 'h-8 w-8 sm:h-9 sm:w-9',
  xl: 'h-9 w-9',
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
  const [src, setSrc] = useState(null)
  const [failed, setFailed] = useState(false)
  const [hasPhoto, setHasPhoto] = useState(false)
  const fileInputRef = useRef(null)
  const objectUrlRef = useRef(null)
  const initials = getProfileInitials(fullName)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setFailed(false)

      if (objectUrlRef.current) {
        revokeUserAvatarObjectUrl(objectUrlRef.current)
        objectUrlRef.current = null
      }

      const fallback =
        !avatarUrl && DEV_BYPASS_AUTH ? readCachedUserAvatar(userId) : null
      const nextUrl = avatarUrl || fallback

      if (!nextUrl) {
        if (!cancelled) {
          setSrc(null)
          setHasPhoto(false)
        }
        return
      }

      // Instant paint for data URLs / blob previews
      if (nextUrl.startsWith('data:') || nextUrl.startsWith('blob:')) {
        if (!cancelled) {
          setSrc(nextUrl)
          setHasPhoto(true)
        }
        return
      }

      const displaySrc = await loadDisplayableAvatarSrc(nextUrl, refreshKey)
      if (cancelled) {
        revokeUserAvatarObjectUrl(displaySrc)
        return
      }

      if (displaySrc?.startsWith('blob:')) {
        objectUrlRef.current = displaySrc
      }

      setSrc(displaySrc)
      setHasPhoto(Boolean(displaySrc))
      setFailed(!displaySrc)
    }

    load()

    return () => {
      cancelled = true
      if (objectUrlRef.current) {
        revokeUserAvatarObjectUrl(objectUrlRef.current)
        objectUrlRef.current = null
      }
    }
  }, [avatarUrl, userId, refreshKey])

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file && onUpload) {
      onUpload(file)
    }
  }

  const showInitials = !src || failed

  return (
    <div className={cn('relative shrink-0', editable && 'pb-1 pr-1', className)}>
      <div
        className={cn(
          'relative overflow-hidden rounded-full bg-brand-600 font-bold text-white shadow-sm',
          SIZE_CLASSES[size] ?? SIZE_CLASSES.lg,
          editable && 'ring-2 ring-white',
        )}
      >
        {showInitials ? (
          <span className="flex h-full w-full select-none items-center justify-center">
            {initials || '?'}
          </span>
        ) : (
          <img
            src={src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => {
              setFailed(true)
              setSrc(null)
              setHasPhoto(false)
            }}
          />
        )}

        {isUploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
        ) : null}
      </div>

      {editable ? (
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
            className={cn(
              'absolute bottom-0 right-0 z-10 flex items-center justify-center rounded-full border-2 border-white bg-brand-600 text-white shadow-sm transition',
              'hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300',
              'disabled:opacity-60',
              CAMERA_SIZES[size] ?? CAMERA_SIZES.lg,
            )}
            aria-label="Upload profile photo"
          >
            <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </>
      ) : null}

      {editable && hasPhoto && onRemove && !isUploading ? (
        <button
          type="button"
          onClick={onRemove}
          className="mt-3 flex min-h-9 w-full items-center justify-center gap-1 rounded-lg px-1 text-[11px] font-medium text-muted transition hover:bg-red-50 hover:text-red-700 sm:text-xs"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove
        </button>
      ) : null}
    </div>
  )
}
