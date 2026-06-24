import { createContext, useContext, useEffect, useRef, useState } from 'react'

const SessionTimerContext = createContext(null)

function formatElapsed(seconds) {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return [hrs, mins, secs].map((n) => String(n).padStart(2, '0')).join(':')
}

export function SessionTimerProvider({ children }) {
  const [elapsed, setElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!isRunning) return undefined

    intervalRef.current = window.setInterval(() => {
      setElapsed((value) => value + 1)
    }, 1000)

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [isRunning])

  const value = {
    display: formatElapsed(elapsed),
    isRunning,
    toggle: () => setIsRunning((running) => !running),
    reset: () => {
      setIsRunning(false)
      setElapsed(0)
    },
  }

  return <SessionTimerContext.Provider value={value}>{children}</SessionTimerContext.Provider>
}

export function useSessionTimer() {
  const context = useContext(SessionTimerContext)
  if (!context) {
    throw new Error('useSessionTimer must be used within SessionTimerProvider')
  }
  return context
}
