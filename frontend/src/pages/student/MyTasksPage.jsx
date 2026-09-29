import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Check, ClipboardCheck, FileUp, Play } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { DocumentSubmitModal } from '@/components/kanban/DocumentSubmitModal'
import { useAuth } from '@/hooks/useAuth'
import { fetchUserGroups, getUserGroupsErrorMessage } from '@/services/usersService'
import {
  REVIEW_STATUS,
  formatTaskFooter,
  getCompletionBlocker,
  getPendingStep,
  getTaskSubmissions,
  isAwaitingApproval,
  isDocumentTask,
  isTaskDone,
  loadMyAssignedTasks,
  progressGroupTask,
  uploadGroupTaskDocument,
} from '@/services/workspaceTaskService'
import { getWorkspaceErrorMessage } from '@/utils/workspaceErrors'
import { ROUTES } from '@/utils/constants'
import { buildWorkspacePath } from '@/utils/workspace'
import { cn } from '@/utils/cn'

const SECTIONS = [
  { id: 'todo', label: 'To do' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'completed', label: 'Done' },
]

const tagStyles = {
  urgent: 'bg-red-50 text-red-700',
  soon: 'bg-amber-50 text-amber-800',
  later: 'bg-page text-muted',
}

function SummaryTile({ label, value, tone }) {
  return (
    <div className="dash-kpi">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className={cn('font-display text-2xl font-semibold tabular-nums text-ink', tone)}>
        {value}
      </p>
    </div>
  )
}

function MyTaskRow({ task, isBusy, onProgress, onOpenSubmit }) {
  const isDocument = isDocumentTask(task)
  const blocker = isDocument && task.status === 'todo' ? getCompletionBlocker(task) : null
  const uploads = getTaskSubmissions(task)

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="break-words text-sm font-medium text-ink">{task.title}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          <Link
            to={buildWorkspacePath(task.groupId)}
            className="inline-flex items-center gap-0.5 font-medium text-brand-700 hover:text-brand-800"
          >
            {task.groupTitle}
            <ArrowUpRight className="h-3 w-3" />
          </Link>
          <span>{formatTaskFooter(task)}</span>
          {task.dueTag ? (
            <span
              className={cn(
                'rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
                tagStyles[task.dueTagVariant] ?? tagStyles.later,
              )}
            >
              {task.dueTag}
            </span>
          ) : null}
          {isDocumentTask(task) ? (
            <span className="rounded-md bg-violet-50 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700">
              Document · {uploads.length} uploaded
            </span>
          ) : null}
          {isAwaitingApproval(task) ? (
            <span className="rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700">
              Waiting for leader to approve {getPendingStep(task) === 'complete' ? 'Done' : 'start'}
            </span>
          ) : null}
        </p>
        {!isAwaitingApproval(task) &&
        task.status !== 'completed' &&
        task.reviewStatus === REVIEW_STATUS.CHANGES_REQUESTED ? (
          <p className="mt-1.5 rounded-md bg-ochre-soft/60 px-2 py-1 text-xs text-ochre">
            Leader declined the last step{task.reviewNote ? `: ${task.reviewNote}` : '.'}
          </p>
        ) : null}
        {blocker && task.status !== 'completed' && !isAwaitingApproval(task) ? (
          <p className="mt-1 text-[11px] text-muted">{blocker}</p>
        ) : null}
      </div>

      {task.status !== 'completed' && !task.pendingRegressRequest && !isAwaitingApproval(task) ? (
        <div className="flex shrink-0 gap-2">
          {task.status === 'todo' ? (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onProgress(task, 'start')}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-border bg-page px-3 text-xs font-semibold text-ink transition hover:bg-brand-50 disabled:opacity-60"
            >
              <Play className="h-3.5 w-3.5" />
              Start
            </button>
          ) : null}
          <button
            type="button"
            disabled={isBusy || Boolean(blocker)}
            title={blocker ?? undefined}
            onClick={() => (isDocument ? onOpenSubmit(task) : onProgress(task, 'complete'))}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-brand-600 px-3 text-xs font-semibold text-surface transition hover:bg-brand-700 disabled:opacity-50"
          >
            {isDocument ? <FileUp className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
            {isDocument ? 'Submit document' : 'Done'}
          </button>
        </div>
      ) : null}

      {task.pendingRegressRequest ? (
        <span className="shrink-0 rounded-md bg-ochre-soft px-2 py-1 text-[11px] font-semibold text-ochre">
          Move-back pending
        </span>
      ) : null}
    </li>
  )
}

export function MyTasksPage() {
  const { user } = useAuth()
  const [groups, setGroups] = useState([])
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyTaskId, setBusyTaskId] = useState(null)
  const [podFilter, setPodFilter] = useState('')

  const reloadTasks = useCallback(
    async (nextGroups) => {
      const list = await loadMyAssignedTasks(nextGroups, user?.id)
      setTasks(list)
    },
    [user?.id],
  )

  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      setError('')
      try {
        const nextGroups = await fetchUserGroups()
        if (cancelled) return
        setGroups(nextGroups)
        const list = await loadMyAssignedTasks(nextGroups, user?.id)
        if (!cancelled) setTasks(list)
      } catch (loadError) {
        if (!cancelled) setError(getUserGroupsErrorMessage(loadError))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const [submitKey, setSubmitKey] = useState(null)

  const needsApprovalFor = (groupId) => {
    const group = groups.find((item) => String(item.groupId ?? item.id) === String(groupId))
    const leaderId = group?.leaderId ?? group?.leader?.id ?? null
    return Boolean(leaderId) && String(leaderId) !== String(user?.id)
  }

  const handleProgress = async (task, action) => {
    setBusyTaskId(task.id)
    try {
      await progressGroupTask(task.groupId, task.id, action, {
        requiresReview: needsApprovalFor(task.groupId),
      })
      await reloadTasks(groups)
      return true
    } catch (progressError) {
      window.alert(getWorkspaceErrorMessage(progressError, 'Unable to update task progress.'))
      return false
    } finally {
      setBusyTaskId(null)
    }
  }

  const handleUpload = async (task, file) => {
    try {
      await uploadGroupTaskDocument(task.groupId, task.id, file)
      await reloadTasks(groups)
      return true
    } catch (uploadError) {
      window.alert(getWorkspaceErrorMessage(uploadError, 'Unable to upload the document.'))
      return false
    }
  }

  const submitTask = submitKey
    ? (tasks.find(
        (task) =>
          String(task.groupId) === String(submitKey.groupId) &&
          String(task.id) === String(submitKey.id),
      ) ?? null)
    : null

  const visibleTasks = useMemo(
    () => (podFilter ? tasks.filter((task) => String(task.groupId) === podFilter) : tasks),
    [podFilter, tasks],
  )

  const summary = useMemo(() => {
    const count = (status) => visibleTasks.filter((task) => task.status === status).length
    const completed = visibleTasks.filter(isTaskDone).length
    const total = visibleTasks.length
    return {
      todo: count('todo'),
      inProgress: count('in_progress'),
      completed,
      overdue: visibleTasks.filter((task) => task.isOverdue).length,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100),
      total,
    }
  }, [visibleTasks])

  return (
    <div className="ss-shell space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            Tasks
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
            My tasks
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            Everything assigned to you across your study pods.
          </p>
        </div>
        {groups.length > 1 ? (
          <label className="block">
            <span className="sr-only">Filter by pod</span>
            <select
              className="h-10 rounded-lg border border-border bg-surface px-3 text-[13px]"
              value={podFilter}
              onChange={(event) => setPodFilter(event.target.value)}
            >
              <option value="">All pods</option>
              {groups.map((group) => {
                const id = String(group.groupId ?? group.id)
                return (
                  <option key={id} value={id}>
                    {group.title}
                  </option>
                )
              })}
            </select>
          </label>
        ) : null}
      </header>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <div className="space-y-3" aria-busy="true" aria-label="Loading tasks">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[0, 1, 2, 3].map((key) => (
              <div key={key} className="dash-kpi h-[76px] animate-pulse" />
            ))}
          </div>
          <div className="dash-card h-40 animate-pulse" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="ss-empty">
          <ClipboardCheck className="mx-auto h-6 w-6 text-brand-700" />
          <p className="mt-2 text-[14px] font-semibold text-ink">No tasks assigned to you</p>
          <p className="mx-auto mt-1 max-w-sm text-[12px] text-muted">
            When someone in your pod assigns you a task, it shows up here.
          </p>
          <div className="mt-4 flex justify-center">
            <Button asChild size="sm">
              <Link to={ROUTES.WORKSPACE_LIST}>Open workspace</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryTile label="To do" value={summary.todo} />
            <SummaryTile label="In progress" value={summary.inProgress} />
            <SummaryTile label="Done" value={`${summary.percent}%`} tone="text-brand-700" />
            <SummaryTile
              label="Overdue"
              value={summary.overdue}
              tone={summary.overdue > 0 ? 'text-red-600' : undefined}
            />
          </div>

          {SECTIONS.map((section) => {
            const sectionTasks = visibleTasks.filter((task) => task.status === section.id)
            return (
              <section key={section.id} className="dash-card p-4">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <h2 className="text-[13px] font-semibold text-ink">{section.label}</h2>
                  <span className="ss-chip">{sectionTasks.length}</span>
                </div>
                {sectionTasks.length === 0 ? (
                  <p className="py-3 text-[12px] text-muted">Nothing here.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {sectionTasks.map((task) => (
                      <MyTaskRow
                        key={`${task.groupId}:${task.id}`}
                        task={task}
                        isBusy={busyTaskId === task.id}
                        onProgress={handleProgress}
                        onOpenSubmit={(item) => setSubmitKey({ groupId: item.groupId, id: item.id })}
                      />
                    ))}
                  </ul>
                )}
              </section>
            )
          })}
        </>
      )}

      {submitTask ? (
        <DocumentSubmitModal
          task={submitTask}
          needsApproval={needsApprovalFor(submitTask.groupId)}
          onUpload={(file) => handleUpload(submitTask, file)}
          onSubmit={() => handleProgress(submitTask, 'complete')}
          onClose={() => setSubmitKey(null)}
        />
      ) : null}
    </div>
  )
}
