import { CalendarDays, Clock, Plus, Users, Video } from 'lucide-react'
import { ScheduleSessionList } from '@/components/workspace/ScheduleSessionList'
import { useWorkspaceSchedule } from '@/context/WorkspaceScheduleContext'
import { formatSessionMeta } from '@/services/scheduleSessionService'

export function GroupSchedulePanel() {
  const { sessions, listItems, openScheduleModal } = useWorkspaceSchedule()
  const nextSession = sessions[0]
  const nextMeta = nextSession ? formatSessionMeta(nextSession).split(' | ') : []

  return (
    <div className="space-y-6">
      {nextSession && (
        <section className="overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 via-white to-teal-50 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
                Next session
              </p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">{nextSession.title}</h2>
              <p className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                {nextMeta[0] && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-violet-500" />
                    {nextMeta[0]}
                  </span>
                )}
                {nextMeta[1] && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-violet-500" />
                    {nextMeta[1]}
                  </span>
                )}
                {nextMeta[2] && (
                  <span className="inline-flex items-center gap-1.5">
                    <Video className="h-4 w-4 text-violet-500" />
                    {nextMeta[2]}
                  </span>
                )}
              </p>
            </div>

            <button
              type="button"
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              Join Session
            </button>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Group Schedule</h2>
            <p className="mt-1 text-sm text-slate-500">
              Upcoming study sessions and meetings for your pod
            </p>
          </div>
          <button
            type="button"
            onClick={openScheduleModal}
            className="session-start-btn inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Schedule a Session
          </button>
        </div>

        <ScheduleSessionList heading="" items={listItems} showJoin />

        {listItems.length > 0 && (
          <p className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <Users className="h-3.5 w-3.5" />
            Sessions are synced with your pod members
          </p>
        )}
      </section>
    </div>
  )
}
