import { useCallback, useEffect, useRef, useState } from 'react'

const DEFAULT_MAX_DURATION_SEC = 120

function getSupportedMimeType() {
  if (typeof MediaRecorder === 'undefined') return ''

  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']
  return types.find((type) => MediaRecorder.isTypeSupported(type)) ?? ''
}

export function formatVoiceDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function useVoiceRecorder({ maxDurationSec = DEFAULT_MAX_DURATION_SEC, onRecorded }) {
  const [isRecording, setIsRecording] = useState(false)
  const [durationSec, setDurationSec] = useState(0)
  const [error, setError] = useState('')

  const mediaRecorderRef = useRef(null)
  const mediaStreamRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const durationRef = useRef(0)

  const cleanupStream = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop())
    mediaStreamRef.current = null
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const resetRecordingState = useCallback(() => {
    stopTimer()
    cleanupStream()
    mediaRecorderRef.current = null
    chunksRef.current = []
    durationRef.current = 0
    setIsRecording(false)
    setDurationSec(0)
  }, [cleanupStream, stopTimer])

  const finishRecording = useCallback(
    async (shouldSend) => {
      const recorder = mediaRecorderRef.current
      if (!recorder) return

      const mimeType = recorder.mimeType || getSupportedMimeType() || 'audio/webm'
      const recordedDuration = durationRef.current

      const blob = await new Promise((resolve) => {
        recorder.onstop = () => {
          const nextBlob = chunksRef.current.length
            ? new Blob(chunksRef.current, { type: mimeType })
            : null
          resolve(nextBlob)
        }

        if (recorder.state !== 'inactive') {
          recorder.stop()
        } else {
          resolve(null)
        }
      })

      resetRecordingState()

      if (!shouldSend || !blob || blob.size === 0) return

      const extension = mimeType.includes('mp4') ? 'm4a' : 'webm'
      const fileName = `voice-note-${Date.now()}.${extension}`
      const file = new File([blob], fileName, { type: mimeType })

      await onRecorded?.({ file, durationSec: recordedDuration, mimeType })
    },
    [onRecorded, resetRecordingState],
  )

  const startRecording = useCallback(async () => {
    if (isRecording) return

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Voice recording is not supported in this browser.')
      return
    }

    try {
      setError('')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = getSupportedMimeType()

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)

      chunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }

      mediaStreamRef.current = stream
      mediaRecorderRef.current = recorder
      recorder.start()
      durationRef.current = 0
      setIsRecording(true)
      setDurationSec(0)

      timerRef.current = window.setInterval(() => {
        durationRef.current += 1
        setDurationSec(durationRef.current)

        if (durationRef.current >= maxDurationSec) {
          finishRecording(true)
        }
      }, 1000)
    } catch {
      cleanupStream()
      setError('Microphone access is required to record voice messages.')
    }
  }, [cleanupStream, finishRecording, isRecording, maxDurationSec])

  const cancelRecording = useCallback(() => {
    finishRecording(false)
    setError('')
  }, [finishRecording])

  const sendRecording = useCallback(() => {
    finishRecording(true)
  }, [finishRecording])

  useEffect(() => () => resetRecordingState(), [resetRecordingState])

  return {
    isRecording,
    durationSec,
    error,
    setError,
    startRecording,
    cancelRecording,
    sendRecording,
  }
}
