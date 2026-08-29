import { useEffect, useMemo, useState } from 'react'
import { Room } from 'livekit-client'
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoConference,
} from '@livekit/components-react'
import '@livekit/components-styles'

/**
 * LiveKit UI — loaded only when a call panel is open (keeps dashboard bundle lean).
 */
export default function LiveKitCallRoom({
  activeCall,
  roomError,
  onRoomError,
  registerRoomDisconnect,
}) {
  const room = useMemo(
    () => new Room(),
    // Recreate room when call identity/token changes
    [activeCall?.id, activeCall?.token],
  )

  useEffect(() => {
    registerRoomDisconnect?.(() => {
      room.disconnect()
    })
    return () => {
      registerRoomDisconnect?.(null)
    }
  }, [registerRoomDisconnect, room])

  return (
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
        onRoomError?.(err?.message || 'Unable to connect to the LiveKit room.')
      }}
    >
      <VideoConference />
      <RoomAudioRenderer />
      {roomError ? (
        <div className="absolute inset-x-0 bottom-0 bg-red-600/90 px-4 py-2 text-center text-xs font-medium">
          {roomError}
        </div>
      ) : null}
    </LiveKitRoom>
  )
}
