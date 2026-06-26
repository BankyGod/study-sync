import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/utils/cn'
import { ROUTES } from '@/utils/constants'

const subtitles = {
  board: 'Collaborate and progress with your study team.',
  files: 'Collaborate with your group and study smarter together.',
  chat: 'Message your team in real time.',
  calendar: 'Collaborate and study with your classmates.',
}

export function WorkspaceHeader({ title, courseLabel }) {
  const location = useLocation()

  const view = location.pathname.includes('/files')
    ? 'files'
    : location.pathname.includes('/chat')
      ? 'chat'
      : location.pathname.includes('/calendar')
        ? 'calendar'
        : 'board'

  return (
    <header className={cn('shrink-0', view === 'chat' ? 'mb-2' : 'mb-6')}>
      <Link
        to={ROUTES.WORKSPACE_LIST}
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-violet-700"
      >
        <ArrowLeft className="h-4 w-4" />
        All pods
      </Link>
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {courseLabel && <p className="mt-1 text-sm font-medium text-violet-600">{courseLabel}</p>}
      <p className="mt-1 text-sm text-slate-500">{subtitles[view]}</p>
    </header>
  )
}
