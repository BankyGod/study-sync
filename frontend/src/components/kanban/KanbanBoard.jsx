import { Card } from '@/components/common/Card'

const COLUMNS = [
  { id: 'pending', title: 'Pending' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'completed', title: 'Completed' },
]

export function KanbanBoard({ tasks = [] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {COLUMNS.map((column) => (
        <Card key={column.id} title={column.title} className="min-h-64">
          <ul className="space-y-2">
            {tasks
              .filter((task) => task.status === column.id)
              .map((task) => (
                <li
                  key={task.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm"
                >
                  <p className="font-medium text-slate-900">{task.title}</p>
                  {task.assignee && (
                    <p className="mt-1 text-xs text-slate-500">Assigned to {task.assignee}</p>
                  )}
                </li>
              ))}
            {tasks.filter((task) => task.status === column.id).length === 0 && (
              <li className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                No tasks yet
              </li>
            )}
          </ul>
        </Card>
      ))}
    </div>
  )
}
