import { useLocation } from 'react-router-dom'

const subtitles = {
  board: 'Collaborate and progress with your study team.',
  files: 'Collaborate with your group and study smarter together.',
  chat: 'Message your team in real time.',
  calendar: 'Collaborate and study with your classmates.',
}

export function WorkspaceHeader({ title }) {
  const location = useLocation()

  const view = location.pathname.includes('/files')
    ? 'files'
    : location.pathname.includes('/chat')
      ? 'chat'
      : location.pathname.includes('/calendar')
        ? 'calendar'
        : 'board'

  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">{subtitles[view]}</p>
    </header>
  )
}
