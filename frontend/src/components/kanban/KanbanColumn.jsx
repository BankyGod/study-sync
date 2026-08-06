import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { SortableTaskCard } from '@/components/kanban/SortableTaskCard'
import { cn } from '@/utils/cn'

const columnStyles = {
  todo: { dot: 'bg-ochre', label: 'To do' },
  in_progress: { dot: 'bg-brand-500', label: 'In progress' },
  completed: { dot: 'bg-brand-700', label: 'Completed' },
}

export function KanbanColumn({ columnId, tasks, showAddTask = false, onAddTask }) {
  const style = columnStyles[columnId]
  const { setNodeRef, isOver } = useDroppable({ id: columnId })

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <header className="mb-3 flex items-center gap-2 border-b border-border pb-2">
        <span className={cn('h-2 w-2 rounded-full', style.dot)} />
        <h3 className="text-sm font-semibold text-ink">{style.label}</h3>
        <span className="ml-auto text-xs text-muted">{tasks.length}</span>
      </header>

      <div
        ref={setNodeRef}
        className={cn(
          'flex min-h-[120px] flex-1 flex-col gap-2 rounded-lg p-1 transition-colors',
          isOver && 'bg-brand-50/70 ring-1 ring-brand-200',
        )}
      >
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {showAddTask && (
          <button
            type="button"
            onClick={onAddTask}
            className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2.5 text-sm font-medium text-muted transition hover:border-brand-400 hover:bg-page hover:text-ink"
          >
            <Plus className="h-4 w-4" />
            Add task
          </button>
        )}
      </div>
    </section>
  )
}
