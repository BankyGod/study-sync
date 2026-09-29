import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/common/Modal'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { FileUp, ListChecks } from 'lucide-react'
import {
  TASK_PRIORITIES,
  TASK_TYPES,
  TASK_TYPE_OPTIONS,
} from '@/services/workspaceTaskService'
import { cn } from '@/utils/cn'

const taskSchema = z.object({
  title: z.string().min(3, 'Task title is required'),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
  priority: z.string().optional(),
  taskType: z.string().optional(),
})

function Select({ label, error, className, id, children, ...props }) {
  const selectId = id || props.name

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100',
          error && 'border-red-400 focus:border-red-400 focus:ring-red-100',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function AddTaskModal({
  open,
  onClose,
  onSave,
  members = [],
  task = null,
  canChangeAssignee = true,
  canSetSchedule = true,
}) {
  const isEdit = Boolean(task)
  const canChooseType = !isEdit || canSetSchedule

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      dueDate: '',
      assigneeId: '',
      priority: '',
      taskType: TASK_TYPES.STANDARD,
    },
  })

  useEffect(() => {
    if (!open) return

    reset({
      title: task?.title ?? '',
      dueDate: task?.dueDate ?? '',
      assigneeId: task?.assignee?.id ?? members[0]?.id ?? '',
      priority: task?.priority ?? '',
      taskType: task?.taskType ?? TASK_TYPES.STANDARD,
    })
  }, [open, reset, task, members])

  const selectedType = watch('taskType')

  const onSubmit = async (values) => {
    await onSave({
      title: values.title,
      dueDate: values.dueDate || null,
      assigneeId: values.assigneeId || null,
      priority: values.priority || null,
      taskType: canChooseType ? values.taskType || TASK_TYPES.STANDARD : undefined,
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Task' : 'Add Task'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Task title"
          placeholder="Review Chapter 3: Dynamic Programming"
          error={errors.title?.message}
          {...register('title')}
        />

        <fieldset disabled={!canChooseType}>
          <legend className="mb-1.5 block text-sm font-medium text-slate-700">Task type</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {TASK_TYPE_OPTIONS.map((option) => {
              const Icon = option.value === TASK_TYPES.DOCUMENT ? FileUp : ListChecks
              const selected = selectedType === option.value
              return (
                <label
                  key={option.value}
                  className={cn(
                    'flex cursor-pointer gap-2.5 rounded-lg border p-3 transition',
                    selected
                      ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-100'
                      : 'border-slate-200 hover:bg-slate-50',
                    !canChooseType && 'cursor-not-allowed opacity-70',
                  )}
                >
                  <input
                    type="radio"
                    value={option.value}
                    className="sr-only"
                    {...register('taskType')}
                  />
                  <Icon
                    className={cn(
                      'mt-0.5 h-4 w-4 shrink-0',
                      selected ? 'text-brand-700' : 'text-slate-400',
                    )}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink">{option.label}</span>
                    <span className="mt-0.5 block text-xs text-muted">{option.description}</span>
                  </span>
                </label>
              )
            })}
          </div>
          {!canChooseType ? (
            <p className="mt-1.5 text-xs text-muted">Only the group leader can change the task type.</p>
          ) : null}
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Due date (optional)"
            type="date"
            disabled={!canSetSchedule}
            error={errors.dueDate?.message}
            {...register('dueDate')}
          />
          <Select label="Priority" disabled={!canSetSchedule} {...register('priority')}>
            <option value="">None</option>
            {TASK_PRIORITIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        {!canSetSchedule ? (
          <p className="-mt-2 text-xs text-muted">Only the group leader sets due dates and priority.</p>
        ) : null}

        {members.length > 0 && canChangeAssignee ? (
          <Select
            label={isEdit ? 'Reassign to' : 'Assign to'}
            error={errors.assigneeId?.message}
            {...register('assigneeId')}
          >
            <option value="">Unassigned</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </Select>
        ) : null}

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEdit ? 'Save changes' : 'Add Task'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
