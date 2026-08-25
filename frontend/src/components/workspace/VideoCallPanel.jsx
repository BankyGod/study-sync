import { PhoneOff, Video, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Room } from 'livekit-client'
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoConference,
} from '@livekit/components-react'
import '@livekit/components-styles'
import { useAuth } from '@/hooks/useAuth'
import { useWorkspaceCall } from '@/context/WorkspaceCallContext'
import { canJoinLiveKit, getLiveKitConnectError } from '@/services/workspaceCallService'

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
    registerRoomDisconnect,
  } = useWorkspaceCall()
  const [roomError, setRoomError] = useState('')

  const ready = canJoinLiveKit(activeCall)
  const connectHint = getLiveKitConnectError(activeCall)

  const room = useMemo(() => new Room(), [activeCall?.id, activeCall?.token])

  const canEndForAll =
    !activeCall?.startedBy ||
    String(activeCall.startedBy) === String(user?.id) ||
    String(activeCall.startedBy?.id) === String(user?.id)

  useEffect(() => {
    if (!isCallOpen || !ready) {
      registerRoomDisconnect?.(null)
      return undefined
    }

    registerRoomDisconnect?.(() => {
      room.disconnect()
    })

    return () => {
      registerRoomDisconnect?.(null)
    }
  }, [isCallOpen, ready, registerRoomDisconnect, room])

  useEffect(() => {
    if (!isCallOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isCallOpen])

  useEffect(() => {
    setRoomError('')
  }, [activeCall?.token, activeCall?.url])

  if (!isCallOpen || !activeCall) return null

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-ink text-surface">
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Video className="h-4 w-4 shrink-0" />
            <span className="truncate">{activeCall.title || 'Pod video call'}</span>
          </p>
          <p className="mt-0.5 text-xs text-surface/60">
            LiveKit · {activeCall.roomName || activeCall.id}
          </p>
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

      <div className="relative min-h-0 flex-1 bg-black" data-lk-theme="default">
        {ready ? (
          <LiveKitRoom
            key={`${activeCall.id}-${activeCall.token}`}
            room={room}
            token={activeCall.token}
            serverUrl={activeCall.url}
            connect
            audio
            video
            className="h-full"
            onError={(err) => {
              setRoomError(err?.message || 'Unable to connect to the LiveKit room.')
            }}
          >
            <VideoConference />
            <RoomAudioRenderer />
          </LiveKitRoom>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-base font-semibold">LiveKit unavailable</p>
            <p className="max-w-md text-sm text-surface/70">
              {error ||
                roomError ||
                connectHint ||
                'Need call.url + call.token with livekitConfigured=true from start/join.'}
            </p>
          </div>
        )}

        {roomError && ready ? (
          <div className="absolute inset-x-0 bottom-0 bg-red-600/90 px-4 py-2 text-center text-xs font-medium">
            {roomError}
          </div>
        ) : null}
      </div>

      <footer className="flex flex-wrap items-center justify-center gap-3 border-t border-white/10 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
        <button
          type="button"
          disabled={isBusy}
          onClick={leaveCall}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-amber-500 px-5 text-sm font-semibold text-ink transition hover:bg-amber-400 disabled:opacity-60"
        >
          <PhoneOff className="h-4 w-4" />
          Leave
        </button>
        {canEndForAll ? (
          <button
            type="button"
            disabled={isBusy}
            onClick={endCall}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-red-600 px-5 text-sm font-semibold transition hover:bg-red-500 disabled:opacity-60"
          >
            End for all
          </button>
        ) : null}
      </footer>
    </div>
  )
}
