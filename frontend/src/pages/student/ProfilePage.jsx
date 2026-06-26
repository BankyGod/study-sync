import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProfileSummaryCard } from '@/components/profile/ProfileSummaryCard'
import { EditProfileModal } from '@/components/profile/EditProfileModal'
import { LearningStyleSelector } from '@/components/profile/LearningStyleSelector'
import { AvailabilityScheduler } from '@/components/profile/AvailabilityScheduler'
import { EnrolledCourses } from '@/components/profile/EnrolledCourses'
import { Spinner } from '@/components/common/Spinner'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/utils/constants'
import {
  fetchUserGroups,
  getAvatarUploadErrorMessage,
  getUserProfileErrorMessage,
  loadUserProfile,
  saveUserProfile,
  uploadUserAvatar,
  deleteUserAvatar,
} from '@/services/usersService'
import {
  getOnboardingErrorMessage,
  loadOnboardingProfile,
  mergeOnboardingProfile,
  saveOnboardingProfile,
  setCachedOnboardingProfile,
} from '@/services/onboardingProfileService'

export function ProfilePage() {
  const { user, refreshAvatar, avatarVersion } = useAuth()
  const [profile, setProfile] = useState(null)
  const [groupCount, setGroupCount] = useState(0)
  const [onboarding, setOnboarding] = useState(mergeOnboardingProfile(null))
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAvatarUploading, setIsAvatarUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError('')

      try {
        const [displayProfile, onboardingProfile, groups] = await Promise.all([
          loadUserProfile(),
          loadOnboardingProfile(),
          fetchUserGroups().catch(() => []),
        ])

        if (!cancelled) {
          setProfile(displayProfile)
          setGroupCount(groups.length)
          if (onboardingProfile) {
            setCachedOnboardingProfile(onboardingProfile)
            setOnboarding(mergeOnboardingProfile(onboardingProfile))
          }
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(getUserProfileErrorMessage(loadError))
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [user?.id])

  const handleSaveProfile = async (updatedProfile) => {
    setIsSaving(true)
    setError('')
    setSuccess('')
    try {
      const saved = await saveUserProfile(updatedProfile)
      setProfile(saved)
      setIsEditOpen(false)
      setSuccess('Profile updated.')
    } catch (saveError) {
      setError(
        saveError.message?.includes('required')
          ? saveError.message
          : getUserProfileErrorMessage(saveError),
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarUpload = async (file) => {
    setIsAvatarUploading(true)
    setError('')
    setSuccess('')
    try {
      await uploadUserAvatar(file)
      refreshAvatar()
      setSuccess('Profile photo updated.')
    } catch (uploadError) {
      setError(getAvatarUploadErrorMessage(uploadError))
    } finally {
      setIsAvatarUploading(false)
    }
  }

  const handleAvatarRemove = async () => {
    setIsAvatarUploading(true)
    setError('')
    setSuccess('')
    try {
      await deleteUserAvatar()
      refreshAvatar()
      setSuccess('Profile photo removed.')
    } catch (removeError) {
      setError(getAvatarUploadErrorMessage(removeError))
    } finally {
      setIsAvatarUploading(false)
    }
  }

  const handleSaveAll = async () => {
    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      const [savedProfile, savedOnboarding, groups] = await Promise.all([
        saveUserProfile(profile),
        saveOnboardingProfile(onboarding),
        fetchUserGroups(),
      ])

      setProfile(savedProfile)
      setGroupCount(groups.length)
      setCachedOnboardingProfile(savedOnboarding)
      setOnboarding(mergeOnboardingProfile(savedOnboarding))
      setSuccess('Profile and study preferences saved.')
    } catch (saveError) {
      const message =
        saveError.message?.includes('Select') || saveError.message?.includes('Add')
          ? saveError.message
          : saveError.response?.data?.error?.code === 'VALIDATION_ERROR' ||
              saveError.config?.url?.includes('onboarding')
            ? getOnboardingErrorMessage(saveError)
            : getUserProfileErrorMessage(saveError)
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center text-sm text-red-600">
        {error || 'Profile unavailable.'}
      </div>
    )
  }

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <header>
          <h1 className="text-3xl font-bold text-slate-900">Profile Setup</h1>
          <p className="mt-2 text-slate-500">Personalize your profile with the details below.</p>
        </header>

        {error && (
          <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </p>
        )}

        <ProfileSummaryCard
          profile={profile}
          userId={user?.id}
          groupCount={groupCount}
          avatarRefreshKey={avatarVersion}
          isAvatarUploading={isAvatarUploading}
          onEdit={() => setIsEditOpen(true)}
          onAvatarUpload={handleAvatarUpload}
          onAvatarRemove={handleAvatarRemove}
        />

        <LearningStyleSelector
          value={onboarding.learningStyle}
          onChange={(learningStyle) => setOnboarding((prev) => ({ ...prev, learningStyle }))}
        />

        <AvailabilityScheduler
          value={onboarding.availability}
          onChange={(availability) => setOnboarding((prev) => ({ ...prev, availability }))}
        />

        <EnrolledCourses
          value={onboarding.courses}
          onChange={(courses) => setOnboarding((prev) => ({ ...prev, courses }))}
        />

        <footer className="flex justify-end gap-4 pt-2">
          <Link
            to={ROUTES.STUDENT_DASHBOARD}
            className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            Cancel
          </Link>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveAll}
            className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
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
