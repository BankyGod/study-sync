import { KanbanColumn } from '@/components/kanban/KanbanColumn'

const demoColumns = {
  todo: [
    {
      id: 't1',
      title: 'Review Chapter 3: Dynamic Programming',
      footer: 'Due: Oct 20',
      variant: 'highlight',
      assignee: { initials: 'AO', name: 'Alex', color: 'bg-sky-500' },
    },
    {
      id: 't2',
      title: 'Solve practice problems set 4',
      footer: 'Due: Oct 22',
      variant: 'default',
      assignee: { initials: 'SJ', name: 'Sarah', color: 'bg-violet-500' },
    },
  ],
  in_progress: [
    {
      id: 't3',
      title: "Implement Dijkstra's algorithm",
      footer: 'Due: Oct 18',
      variant: 'default',
      assignee: { initials: 'MP', name: 'Mike P.', color: 'bg-emerald-500' },
    },
    {
      id: 't4',
      title: 'Discuss Bellman-Ford algorithm',
      footer: 'Due: Oct 19',
      variant: 'default',
      assignee: { initials: 'EJ', name: 'Emma J.', color: 'bg-amber-500' },
    },
  ],
  completed: [
    {
      id: 't5',
      title: 'Study Big O notation complexity',
      footer: 'Done: Oct 15',
      variant: 'completed',
      assignee: { initials: 'AO', name: 'Alex', color: 'bg-sky-500' },
    },
    {
      id: 't6',
      title: 'Read chapter 2: Sorting algorithms',
      footer: 'Done: Oct 16',
      variant: 'completed',
      assignee: { initials: 'SJ', name: 'Sarah', color: 'bg-violet-500' },
    },
  ],
}

export function WorkspaceKanban({ columns = demoColumns }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <KanbanColumn columnId="todo" tasks={columns.todo} showAddTask />
      <KanbanColumn columnId="in_progress" tasks={columns.in_progress} />
      <KanbanColumn columnId="completed" tasks={columns.completed} />
    </div>
  )
}
