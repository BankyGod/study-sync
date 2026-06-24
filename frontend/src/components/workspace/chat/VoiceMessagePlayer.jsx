import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { formatVoiceDuration } from '@/hooks/useVoiceRecorder'
import { getStoredToken } from '@/services/authService'
import { cn } from '@/utils/cn'

export function VoiceMessagePlayer({ src, durationSec, isOwnMessage }) {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [playbackSrc, setPlaybackSrc] = useState(src)

  useEffect(() => {
    let objectUrl

    async function prepareSrc() {
      if (!src) {
        setPlaybackSrc('')
        return
      }

      if (!src.startsWith('http')) {
        setPlaybackSrc(src)
        return
      }

      const token = getStoredToken()
      if (!token) {
        setPlaybackSrc(src)
        return
      }

      try {
        const response = await fetch(src, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) {
          setPlaybackSrc(src)
          return
        }
        const blob = await response.blob()
        objectUrl = URL.createObjectURL(blob)
        setPlaybackSrc(objectUrl)
      } catch {
        setPlaybackSrc(src)
      }
    }

    prepareSrc()

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [src])

  const togglePlayback = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      return
    }

    try {
      await audio.play()
      setIsPlaying(true)
    } catch {
      setIsPlaying(false)
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return undefined

    const handleTimeUpdate = () => {
      if (!audio.duration) return
      setProgress((audio.currentTime / audio.duration) * 100)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
      audio.currentTime = 0
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [playbackSrc])

  return (
    <div
      className={cn(
        'inline-flex min-w-[220px] max-w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm shadow-sm',
        isOwnMessage
          ? 'rounded-br-md bg-violet-600 text-white'
          : 'rounded-bl-md border border-slate-200/80 bg-slate-50 text-slate-800',
      )}
    >
      <button
        type="button"
        onClick={togglePlayback}
        disabled={!playbackSrc}
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition',
          isOwnMessage
            ? 'bg-white/20 text-white hover:bg-white/30'
            : 'bg-violet-100 text-violet-600 hover:bg-violet-200',
        )}
        aria-label={isPlaying ? 'Pause voice message' : 'Play voice message'}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
      </button>

      <div className="min-w-0 flex-1">
        <div
          className={cn(
            'h-1.5 overflow-hidden rounded-full',
            isOwnMessage ? 'bg-white/25' : 'bg-slate-200',
          )}
        >
          <div
            className={cn(
              'h-full rounded-full transition-all',
              isOwnMessage ? 'bg-white' : 'bg-violet-500',
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className={cn('mt-1 text-xs', isOwnMessage ? 'text-violet-100' : 'text-slate-500')}>
          Voice message · {formatVoiceDuration(durationSec)}
        </p>
      </div>

      <audio ref={audioRef} src={playbackSrc} preload="metadata" className="hidden" />
    </div>
  )
}
