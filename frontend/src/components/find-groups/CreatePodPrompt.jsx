import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users } from 'lucide-react'
import { Button } from '@/components/common/Button'
import {
  canCreatePodForCourse,
  createStudyPod,
  formatPodTitle,
  getMatchingErrorMessage,
  getOpenPods,
  nextPodNumber,
} from '@/services/matchingService'
import { formatCourseName } from '@/utils/onboarding'
import { buildWorkspacePath } from '@/utils/workspace'
import { cn } from '@/utils/cn'

export function CreatePodPrompt({
  course,
  courseLabel,
  existingGroups = [],
  canCreate = true,
  className,
  onCreated,
  onOpenPodsFound,
}) {
  const navigate = useNavigate()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  if (!course?.subject || !course?.courseNumber) return null

  const label = courseLabel || formatCourseName(course)
  const openPods = getOpenPods(existingGroups)
  const allowed = canCreatePodForCourse(existingGroups)
  const podNumber = nextPodNumber(existingGroups)
  const proposedTitle = formatPodTitle(label, podNumber)
  const allFull = existingGroups.length > 0 && openPods.length === 0

  const handleCreate = async () => {
    if (!canCreate || !allowed || isCreating) return
    setIsCreating(true)
    setError('')

    try {
      const created = await createStudyPod(course)
      if (!created?.groupId) {
        throw new Error('Pod was created but no group id was returned.')
      }
      onCreated?.(created)
      navigate(buildWorkspacePath(created.groupId))
    } catch (createError) {
      if (createError?.code === 'OPEN_POD_EXISTS' || createError?.openGroups?.length) {
        onOpenPodsFound?.(createError.openGroups ?? [])
        setError(
          getMatchingErrorMessage(createError) ||
            'An open pod already exists. Join it instead of creating another.',
        )
      } else {
        setError(getMatchingErrorMessage(createError) || 'Unable to create a pod for this course.')
      }
      setIsCreating(false)
    }
  }

  if (!allowed) {
    return (
      <section
        className={cn(
          'rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-4',
          className,
        )}
      >
        <p className="text-[13px] font-semibold text-ink">Open pods available</p>
        <p className="mt-1 text-[12px] text-muted">
          {label} already has a pod with free seats. Join that pod instead of creating another one.
        </p>
      </section>
    )
  }

  return (
    <section
      className={cn(
        'rounded-xl border border-dashed border-border bg-surface px-4 py-5 shadow-sm',
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-ink">
            {allFull ? `All ${label} pods are full` : `No pod found for ${label}`}
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">
            {allFull
              ? `Every existing pod for this course is out of seats. Create ${proposedTitle} so classmates can join the next group.`
              : `Nothing is listed yet for this course. Create ${proposedTitle} and classmates will be able to see and join it.`}
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-soft">
            <Users className="h-3.5 w-3.5" />
            Duplicate pods are blocked until open seats are gone
          </p>
        </div>

        <Button
          type="button"
          className="shrink-0"
          disabled={!canCreate || isCreating}
          onClick={handleCreate}
        >
          <Plus className="h-4 w-4" />
          {isCreating ? 'Creating…' : `Create ${proposedTitle}`}
        </Button>
      </div>

      {error ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
          {error}
        </p>
      ) : null}
    </section>
  )
}
