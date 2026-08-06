import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Plus, Users } from 'lucide-react'
import { PodCard } from '@/components/dashboard/PodCard'
import { Spinner } from '@/components/common/Spinner'
import { fetchUserGroups, getUserGroupsErrorMessage } from '@/services/usersService'
import { ROUTES } from '@/utils/constants'
import { buildWorkspacePath } from '@/utils/workspace'

export function WorkspacePodsPage() {
  const [groups, setGroups] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError('')

      try {
        const nextGroups = await fetchUserGroups()
        if (!cancelled) {
          setGroups(nextGroups)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(getUserGroupsErrorMessage(loadError))
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Workspace</p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Your study pods
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Open a pod for its board, chat, files, and schedule.
          </p>
        </div>

        <Link
          to={ROUTES.FIND_GROUPS}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-surface transition hover:bg-brand-700 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Join pod
        </Link>
      </header>

      {error ? (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="mt-8">
        {isLoading ? (
          <div className="flex min-h-[220px] items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface px-6 py-12">
            <Users className="h-6 w-6 text-brand-600" />
            <p className="mt-4 font-display text-lg font-semibold text-ink">No pods yet</p>
            <p className="mt-1 max-w-md text-sm text-muted">
              Once you are matched into a study group, it will show up here.
            </p>
            <Link
              to={ROUTES.FIND_GROUPS}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-surface"
            >
              Find a study group
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            {groups.map((pod) => (
              <PodCard
                key={pod.id ?? pod.groupId}
                to={buildWorkspacePath(pod.groupId)}
                title={pod.title}
                members={pod.members ?? []}
                progress={pod.progress ?? 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
