import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ProfileSummaryCard } from '@/components/profile/ProfileSummaryCard'
import { EditProfileModal } from '@/components/profile/EditProfileModal'
import { LearningStyleSelector } from '@/components/profile/LearningStyleSelector'
import { AvailabilityScheduler } from '@/components/profile/AvailabilityScheduler'
import { EnrolledCourses } from '@/components/profile/EnrolledCourses'
import { ROUTES } from '@/utils/constants'
import { loadUserProfile, saveUserProfile } from '@/services/userProfileService'

export function ProfilePage() {
  const [profile, setProfile] = useState(loadUserProfile)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const handleSaveProfile = (updatedProfile) => {
    const saved = saveUserProfile(updatedProfile)
    setProfile(saved)
  }

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <header>
          <h1 className="text-3xl font-bold text-slate-900">Profile Setup</h1>
          <p className="mt-2 text-slate-500">Personalize your profile with the details below.</p>
        </header>

        <ProfileSummaryCard profile={profile} onEdit={() => setIsEditOpen(true)} />
        <LearningStyleSelector />
        <AvailabilityScheduler />
        <EnrolledCourses />

        <footer className="flex justify-end gap-4 pt-2">
          <Link
            to={ROUTES.STUDENT_DASHBOARD}
            className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={() => saveUserProfile(profile)}
            className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
          >
            Save Changes
          </button>
        </footer>
      </div>

      <EditProfileModal
        open={isEditOpen}
        profile={profile}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveProfile}
      />
    </>
  )
}
