import { PhoneOff, Video, X } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useWorkspaceCall } from '@/context/WorkspaceCallContext'

function buildEmbedUrl(roomUrl, displayName) {
  if (!roomUrl) return null

  try {
    const url = new URL(roomUrl)
    if (url.hostname.includes('jit.si') || url.hostname.includes('jitsi')) {
      url.searchParams.set('userInfo.displayName', displayName || 'StudySync')
      url.searchParams.set('config.prejoinConfig.enabled', 'false')
      url.searchParams.set('config.disableDeepLinking', 'true')
    }
    return url.toString()
  } catch {
    return roomUrl
  }
}

export function VideoCallPanel() {
  const { user } = useAuth()
  const {
    activeCall,
    isCallOpen,
    isBusy,
    error,
    leaveCall,
    endCall,
    closeCallPanel,
  } = useWorkspaceCall()

  const embedUrl = useMemo(
    () => buildEmbedUrl(activeCall?.roomUrl, user?.name),
    [activeCall?.roomUrl, user?.name],
  )

  useEffect(() => {
    if (!isCallOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isCallOpen])

  if (!isCallOpen || !activeCall) return null

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-ink/95 text-surface">
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Video className="h-4 w-4 shrink-0" />
            <span className="truncate">{activeCall.title || 'Pod video call'}</span>
          </p>
          <p className="mt-0.5 text-xs text-surface/60">Live pod call</p>
        </div>
        <button
          type="button"
          onClick={closeCallPanel}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 transition hover:bg-white/10"
          aria-label="Minimize call"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="relative min-h-0 flex-1 bg-black">
        {embedUrl ? (
          <iframe
            title={activeCall.title || 'Pod video call'}
            src={embedUrl}
            allow="camera; microphone; display-capture; autoplay; clipboard-write"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-base font-semibold">Meeting room unavailable</p>
            <p className="max-w-md text-sm text-surface/70">
              {error || 'This call has no embeddable room URL yet. Try leaving and joining again.'}
            </p>
          </div>
        )}
      </div>

      <footer className="flex flex-wrap items-center justify-center gap-3 border-t border-white/10 px-4 py-4 sm:px-6">
        <button
          type="button"
          disabled={isBusy}
          onClick={leaveCall}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-amber-500 px-5 text-sm font-semibold text-ink transition hover:bg-amber-400 disabled:opacity-60"
        >
          <PhoneOff className="h-4 w-4" />
          Leave
        </button>
        <button
          type="button"
          disabled={isBusy}
          onClick={endCall}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-red-600 px-5 text-sm font-semibold transition hover:bg-red-500 disabled:opacity-60"
        >
          End for all
        </button>
      </footer>
    </div>
  )
}
