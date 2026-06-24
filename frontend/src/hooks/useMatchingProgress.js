import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MATCHING_STEPS } from '@/components/find-groups/MatchingProgress'
import {
  buildMatchingRequest,
  fetchMatchingJob,
  getMatchingErrorMessage,
  isMatchingComplete,
  isMatchingFailed,
  isMatchingWaiting,
  isNoEnrolledStudentsError,
  startMatching,
  validateMatchingRequest,
} from '@/services/matchingService'
import { NO_ENROLLED_STUDENTS_MESSAGE } from '@/utils/matchingErrors'

const STEP_COMPLETE_AT = [20, 40, 65, 85, 100]
const STEP_ORDER = MATCHING_STEPS.map((step) => step.id)
const POLL_INTERVAL_MS = 500

function progressFromJob(job) {
  if (typeof job?.progress === 'number') {
    return job.progress
  }

  const stepIndex = STEP_ORDER.indexOf(job?.currentStep)
  if (stepIndex >= 0) {
    return STEP_COMPLETE_AT[stepIndex]
  }

  return 0
}

function applyJobResult(job, { setProgress, setMatch, setError, setIsWaitingForPeers, profileReady }) {
  if (isMatchingWaiting(job)) {
    setIsWaitingForPeers(true)
    setError(NO_ENROLLED_STUDENTS_MESSAGE)
    setProgress(progressFromJob(job) || STEP_COMPLETE_AT[0])
    return 'waiting'
  }

  setProgress(progressFromJob(job))

  if (isMatchingComplete(job)) {
    setMatch(job.match)
    return 'completed'
  }

  if (isMatchingFailed(job)) {
    const jobError = { message: job.error, code: job.errorCode }
    setIsWaitingForPeers(isNoEnrolledStudentsError(jobError))
    setError(getMatchingErrorMessage(jobError, { profileReady }))
    return 'failed'
  }

  return 'running'
}

export function useMatchingProgress({ active = true, profileReady = true, runKey = 0 } = {}) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(null)
  const [match, setMatch] = useState(null)
  const [error, setError] = useState(null)
  const [isWaitingForPeers, setIsWaitingForPeers] = useState(false)
  const jobIdRef = useRef(null)

  const reset = useCallback(() => {
    jobIdRef.current = null
    setProgress(0)
    setCurrentStep(null)
    setMatch(null)
    setError(null)
    setIsWaitingForPeers(false)
  }, [])

  useEffect(() => {
    if (!active || !profileReady) return undefined

    let cancelled = false
    let pollTimer

    async function run() {
      try {
        const request = buildMatchingRequest()
        const validationError = validateMatchingRequest(request)

        if (validationError) {
          setError(validationError)
          return
        }

        const started = await startMatching()
        if (cancelled) return

        if (started.currentStep) {
          setCurrentStep(started.currentStep)
        }

        const initialStatus = applyJobResult(started, {
          setProgress,
          setMatch,
          setError,
          setIsWaitingForPeers,
          profileReady,
        })

        if (initialStatus !== 'running') {
          return
        }

        jobIdRef.current = started.jobId

        const poll = async () => {
          if (!jobIdRef.current || cancelled) return

          const job = await fetchMatchingJob(jobIdRef.current)
          if (cancelled) return

          if (job.currentStep) {
            setCurrentStep(job.currentStep)
          }

          const status = applyJobResult(job, {
            setProgress,
            setMatch,
            setError,
            setIsWaitingForPeers,
            profileReady,
          })

          if (status === 'running') {
            pollTimer = window.setTimeout(poll, POLL_INTERVAL_MS)
          }
        }

        poll()
      } catch (err) {
        if (!cancelled) {
          setIsWaitingForPeers(isNoEnrolledStudentsError(err))
          setError(getMatchingErrorMessage(err, { profileReady }))
        }
      }
    }

    run()

    return () => {
      cancelled = true
      if (pollTimer) window.clearTimeout(pollTimer)
    }
  }, [active, profileReady, runKey])

  const steps = useMemo(() => {
    const activeStepIndex = currentStep ? STEP_ORDER.indexOf(currentStep) : -1

    return MATCHING_STEPS.map((step, index) => {
      const completeAt = STEP_COMPLETE_AT[index]
      const startAt = index === 0 ? 0 : STEP_COMPLETE_AT[index - 1]

      let status = 'pending'

      if (isWaitingForPeers && index === 0) {
        status = 'active'
      } else if (activeStepIndex >= 0) {
        if (index < activeStepIndex) {
          status = 'completed'
        } else if (index === activeStepIndex) {
          status = match ? 'completed' : 'active'
        }
      } else if (progress >= completeAt) {
        status = 'completed'
      } else if (progress >= startAt) {
        status = 'active'
      }

      return { ...step, status }
    })
  }, [progress, currentStep, isWaitingForPeers, match])

  return {
    progress,
    steps,
    currentStep,
    match,
    error,
    isWaitingForPeers,
    isComplete: Boolean(match),
    reset,
  }
}
