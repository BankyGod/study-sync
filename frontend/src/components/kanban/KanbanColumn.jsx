import { Plus } from 'lucide-react'
import { TaskCard } from '@/components/kanban/TaskCard'
import { cn } from '@/utils/cn'

const columnStyles = {
  todo: { dot: 'bg-amber-400', label: 'To Do' },
  in_progress: { dot: 'bg-sky-500', label: 'In Progress' },
  completed: { dot: 'bg-emerald-500', label: 'Completed' },
}

export function KanbanColumn({ columnId, tasks, showAddTask = false }) {
  const style = columnStyles[columnId]

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <header className="mb-4 flex items-center gap-2">
        <span className={cn('h-2.5 w-2.5 rounded-full', style.dot)} />
        <h3 className="text-sm font-semibold text-slate-800">{style.label}</h3>
        <span className="ml-auto text-xs text-slate-400">{tasks.length}</span>
      </header>

      <div className="flex flex-1 flex-col gap-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            title={task.title}
            footer={task.footer}
            assignee={task.assignee}
            variant={task.variant}
          />
        ))}

        {showAddTask && (
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-3 text-sm font-medium text-slate-500 transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-700"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        )}
      </div>
    </section>
  )
}
