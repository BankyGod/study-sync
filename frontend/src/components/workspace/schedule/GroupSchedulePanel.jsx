import { CalendarDays, Clock, Plus, Users, Video } from 'lucide-react'
import { ScheduleSessionList } from '@/components/workspace/ScheduleSessionList'
import { ActiveCallBanner } from '@/components/workspace/ActiveCallBanner'
import { useWorkspaceSchedule } from '@/context/WorkspaceScheduleContext'
import { useWorkspaceCall } from '@/context/WorkspaceCallContext'
import { formatSessionMeta } from '@/services/scheduleSessionService'

export function GroupSchedulePanel() {
  const { sessions, listItems, openScheduleModal } = useWorkspaceSchedule()
  const { startOrJoinCall, isBusy } = useWorkspaceCall()
  const nextSession = sessions[0]
  const nextMeta = nextSession ? formatSessionMeta(nextSession).split(' | ') : []

  const handleJoinCall = () => {
    startOrJoinCall({
      title: nextSession?.title ? `${nextSession.title} call` : 'Pod study call',
    }).catch(() => {})
  }

  return (
    <div className="space-y-8">
      <ActiveCallBanner />

      {nextSession ? (
        <section className="border-b border-border pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
            Next session
          </p>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-semibold text-ink">{nextSession.title}</h2>
              <p className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted">
                {nextMeta[0] ? (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-brand-600" />
                    {nextMeta[0]}
                  </span>
                ) : null}
                {nextMeta[1] ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-brand-600" />
                    {nextMeta[1]}
                  </span>
                ) : null}
                {nextMeta[2] ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Video className="h-4 w-4 text-brand-600" />
                    {nextMeta[2]}
                  </span>
                ) : null}
              </p>
            </div>

            <button
              type="button"
              disabled={isBusy}
              onClick={handleJoinCall}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface transition hover:bg-brand-700 disabled:opacity-60"
            >
              Join session call
            </button>
          </div>
        </section>
      ) : null}

      <section>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">Group schedule</h2>
            <p className="mt-1 text-sm text-muted">
              Upcoming study sessions and meetings for your pod
            </p>
          </div>
          <button
            type="button"
            onClick={openScheduleModal}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-surface transition hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Schedule a session
          </button>
        </div>

        <ScheduleSessionList
          heading=""
          items={listItems}
          showJoin
          onJoin={handleJoinCall}
        />

        {listItems.length > 0 ? (
          <p className="mt-4 flex items-center gap-2 text-xs text-muted">
            <Users className="h-3.5 w-3.5" />
            Sessions are synced with your pod members
          </p>
        ) : null}
      </section>
    </div>
  )
}
