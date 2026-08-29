import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Users } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Spinner } from '@/components/common/Spinner'
import { CreatePodPrompt } from '@/components/find-groups/CreatePodPrompt'
import { joinStudyGroup, getMatchingErrorMessage } from '@/services/matchingService'
import { buildWorkspacePath } from '@/utils/workspace'
import { cn } from '@/utils/cn'

export function OpenCoursePodsPanel({
  pods = [],
  isLoading = false,
  canJoin = true,
  className,
  /** When empty, optionally offer create for this course */
  createCourse = null,
  createCourseLabel = null,
  createExistingGroups = [],
  onCreated,
  onOpenPodsFound,
}) {
  const navigate = useNavigate()
  const [joiningId, setJoiningId] = useState(null)
  const [error, setError] = useState('')

  const openPods = pods.filter((pod) => (pod.openSlots ?? 0) > 0)

  const handleJoin = async (pod) => {
    if (!canJoin || !pod?.groupId) return
    setJoiningId(pod.groupId)
    setError('')
    try {
      await joinStudyGroup(pod.groupId)
      navigate(buildWorkspacePath(pod.groupId))
    } catch (joinError) {
      setError(getMatchingErrorMessage(joinError) || 'Unable to join this pod.')
      setJoiningId(null)
    }
  }

  if (isLoading) {
    return (
      <section className={cn('rounded-xl border border-border bg-surface p-5', className)}>
        <div className="flex min-h-[88px] items-center justify-center">
          <Spinner />
        </div>
      </section>
    )
  }

  if (openPods.length === 0) {
    if (createCourse) {
      return (
        <CreatePodPrompt
          course={createCourse}
          courseLabel={createCourseLabel}
          existingGroups={createExistingGroups}
          canCreate={canJoin}
          className={className}
          onCreated={onCreated}
          onOpenPodsFound={onOpenPodsFound}
        />
      )
    }

    return (
      <section className={cn('rounded-xl border border-dashed border-border bg-surface/70 p-5', className)}>
        <p className="text-[13px] font-semibold text-ink">No open pods yet</p>
        <p className="mt-1 text-[12px] text-muted">
          None of your courses have a pod with free seats. Select a course below to search — if none
          exist, you can create one for classmates to join.
        </p>
      </section>
    )
  }

  return (
    <section className={cn('space-y-3', className)}>
      <div>
        <h2 className="text-[14px] font-semibold text-ink">Open pods for your courses</h2>
        <p className="mt-0.5 text-[12px] text-muted">
          Join an existing group that still has space — no need to create another until seats are full.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
          {error}
        </p>
      ) : null}

      <ul className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        {openPods.map((pod) => {
          const busy = joiningId === pod.groupId
          return (
            <li
              key={pod.groupId}
              className="flex flex-col gap-3 border-b border-border px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-ink">{pod.title}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted">
                  <span>{pod.courseLabel || pod.courseCode}</span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {pod.memberCount}
                    {pod.maxSize ? `/${pod.maxSize}` : ''} members
                  </span>
                  <span className="font-semibold text-brand-700">
                    {pod.openSlots} seat{pod.openSlots === 1 ? '' : 's'} open
                  </span>
                </p>
              </div>
              <Button
                size="sm"
                disabled={!canJoin || Boolean(joiningId)}
                onClick={() => handleJoin(pod)}
              >
                {busy ? 'Joining…' : 'Join pod'}
                {!busy ? <ArrowRight className="h-3.5 w-3.5" /> : null}
              </Button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
