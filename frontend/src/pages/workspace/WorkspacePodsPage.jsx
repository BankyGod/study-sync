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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-violet-600">Workspace</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Your Study Pods</h1>
          <p className="mt-2 max-w-2xl text-slate-500">
            Choose a pod to open its board, chat, shared files, and group schedule.
          </p>
        </div>

        <Link
          to={ROUTES.FIND_GROUPS}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
        >
          <Plus className="h-4 w-4" />
          Join New Pod
        </Link>
      </header>

      {error && (
        <p className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="flex min-h-[280px] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 text-violet-600">
            <Users className="h-7 w-7" />
          </div>
          <p className="mt-4 text-base font-semibold text-slate-800">No pods yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Once you are matched into a study group, it will show up here. You can then open the
            full workspace for that pod.
          </p>
          <Link
            to={ROUTES.FIND_GROUPS}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Find a Study Group
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {groups.map((pod) => (
            <PodCard
              key={pod.id ?? pod.groupId}
              to={buildWorkspacePath(pod.groupId)}
              title={pod.title}
              members={pod.members ?? []}
              progress={pod.progress ?? 0}
              accent={pod.accent ?? 'blue'}
            />
          ))}
        </div>
      )}
    </div>
  )
}
