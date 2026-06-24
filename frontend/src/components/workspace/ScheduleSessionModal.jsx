import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/common/Modal'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { MEETING_TYPES } from '@/services/scheduleSessionService'
import { cn } from '@/utils/cn'

const scheduleSessionSchema = z
  .object({
    title: z.string().min(3, 'Session title is required'),
    date: z.string().min(1, 'Date is required'),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    meetingType: z.enum(MEETING_TYPES),
    agenda: z.string().optional(),
  })
  .refine((values) => values.endTime > values.startTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  })

const defaultValues = {
  title: '',
  date: '',
  startTime: '12:00',
  endTime: '14:00',
  meetingType: MEETING_TYPES[0],
  agenda: '',
}

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

export function ScheduleSessionModal({ open, onClose, onSave }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(scheduleSessionSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return
    reset({
      ...defaultValues,
      date: new Date().toISOString().slice(0, 10),
    })
  }, [open, reset])

  const onSubmit = async (values) => {
    onSave({
      title: values.title.trim(),
      date: values.date,
      startTime: values.startTime,
      endTime: values.endTime,
      meetingType: values.meetingType,
      agenda: values.agenda?.trim() ?? '',
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Schedule a Session">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Session title"
          placeholder="Study Session - Dynamic Programming"
          error={errors.title?.message}
          {...register('title')}
        />

        <Input
          label="Date"
          type="date"
          error={errors.date?.message}
          {...register('date')}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Start time"
            type="time"
            error={errors.startTime?.message}
            {...register('startTime')}
          />
          <Input
            label="End time"
            type="time"
            error={errors.endTime?.message}
            {...register('endTime')}
          />
        </div>

        <Select label="Meeting type" error={errors.meetingType?.message} {...register('meetingType')}>
          {MEETING_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>

        <div className="space-y-1.5">
          <label htmlFor="agenda" className="block text-sm font-medium text-slate-700">
            Agenda (optional)
          </label>
          <textarea
            id="agenda"
            rows={3}
            placeholder="Topics to cover, prep materials, goals..."
            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            {...register('agenda')}
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Scheduling...' : 'Schedule Session'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
