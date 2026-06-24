import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/common/Modal'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'

const editProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  studentRole: z.string().min(2, 'Role or program is required'),
  primaryUniversity: z.string().min(2, 'Primary university is required'),
  secondaryUniversity: z.string().optional(),
  email: z.email('Enter a valid email'),
  location: z.string().min(2, 'Location is required'),
})

export function EditProfileModal({ open, profile, onClose, onSave }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(editProfileSchema),
    defaultValues: profile,
  })

  useEffect(() => {
    if (open) reset(profile)
  }, [open, profile, reset])

  const onSubmit = async (values) => {
    onSave({
      ...values,
      secondaryUniversity: values.secondaryUniversity?.trim() ?? '',
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full name"
          placeholder="Alex Johnson"
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <Input
          label="Role / program"
          placeholder="Computer Science Student"
          error={errors.studentRole?.message}
          {...register('studentRole')}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Primary university"
            placeholder="GCTU"
            error={errors.primaryUniversity?.message}
            {...register('primaryUniversity')}
          />
          <Input
            label="Secondary university (optional)"
            placeholder="Babcock University"
            error={errors.secondaryUniversity?.message}
            {...register('secondaryUniversity')}
          />
        </div>

        <Input
          label="Email"
          type="email"
          placeholder="alexjohnson@email.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Location"
          placeholder="Accra, Ghana"
          error={errors.location?.message}
          {...register('location')}
        />

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
