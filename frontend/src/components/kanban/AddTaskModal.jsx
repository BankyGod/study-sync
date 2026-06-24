import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/common/Modal'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { cn } from '@/utils/cn'

const addTaskSchema = z.object({
  title: z.string().min(3, 'Task title is required'),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
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

export function AddTaskModal({ open, onClose, onSave, members = [] }) {
  const defaultAssigneeId = members[0]?.id ?? ''

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addTaskSchema),
    defaultValues: {
      title: '',
      dueDate: '',
      assigneeId: defaultAssigneeId,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        title: '',
        dueDate: '',
        assigneeId: members[0]?.id ?? '',
      })
    }
  }, [open, reset, members])

  const onSubmit = async (values) => {
    await onSave({
      title: values.title,
      dueDate: values.dueDate || null,
      assigneeId: values.assigneeId || null,
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Task">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Task title"
          placeholder="Review Chapter 3: Dynamic Programming"
          error={errors.title?.message}
          {...register('title')}
        />

        <Input
          label="Due date (optional)"
          type="date"
          error={errors.dueDate?.message}
          {...register('dueDate')}
        />

        {members.length > 0 && (
          <Select label="Assign to" error={errors.assigneeId?.message} {...register('assigneeId')}>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </Select>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Task'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
