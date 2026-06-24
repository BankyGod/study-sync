import { useEffect, useMemo, useState } from 'react'
import { MATCHING_STEPS } from '@/components/find-groups/MatchingProgress'

/** Progress % at which each step is marked completed. */
const STEP_COMPLETE_AT = [20, 40, 65, 85, 100]

/**
 * Simulates matching progress for the UI until the backend WebSocket/API drives real state.
 * Replace with API-driven `useMatchingProgress` when the matching engine is connected.
 */
export function useSimulatedMatchingProgress({ targetProgress = 64, active = true } = {}) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!active) return undefined

    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= targetProgress) return current
        return current + 1
      })
    }, 45)

    return () => window.clearInterval(interval)
  }, [active, targetProgress])

  const steps = useMemo(() => {
    return MATCHING_STEPS.map((step, index) => {
      const completeAt = STEP_COMPLETE_AT[index]
      const startAt = index === 0 ? 0 : STEP_COMPLETE_AT[index - 1]

      let status = 'pending'
      if (progress >= completeAt) {
        status = 'completed'
      } else if (progress >= startAt) {
        status = 'active'
      }

      return { ...step, status }
    })
  }, [progress])

  return { progress, steps, isComplete: progress >= targetProgress }
}
