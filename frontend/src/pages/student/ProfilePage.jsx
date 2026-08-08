import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { ProfileSummaryCard } from '@/components/profile/ProfileSummaryCard'
import { EditProfileModal } from '@/components/profile/EditProfileModal'
import { CompleteStudyPreferencesBanner } from '@/components/onboarding/CompleteStudyPreferencesBanner'
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
import { fetchMyReliability } from '@/services/reliabilityService'
import {
  getOnboardingErrorMessage,
  isOnboardingProfileSaved,
  loadOnboardingProfile,
  mergeOnboardingProfile,
  saveOnboardingProfile,
  setCachedOnboardingProfile,
} from '@/services/onboardingProfileService'

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, refreshAvatar, avatarVersion, updateUser, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [groupCount, setGroupCount] = useState(0)
  const [reliability, setReliability] = useState(null)
  const [onboarding, setOnboarding] = useState(mergeOnboardingProfile(null))
  const [hasSavedProfile, setHasSavedProfile] = useState(true)
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
        const [displayProfile, onboardingProfile, groups, reliabilityData] = await Promise.all([
          loadUserProfile(),
          loadOnboardingProfile(),
          fetchUserGroups().catch(() => []),
          fetchMyReliability().catch(() => null),
        ])

        if (!cancelled) {
          setProfile(displayProfile)
          setGroupCount(groups.length)
          setReliability(reliabilityData)
          setHasSavedProfile(isOnboardingProfileSaved(onboardingProfile))
          if (onboardingProfile) {
            setCachedOnboardingProfile(onboardingProfile)
            setOnboarding(mergeOnboardingProfile(onboardingProfile))
          } else {
            setOnboarding(mergeOnboardingProfile(null))
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
      const data = await uploadUserAvatar(file)
      updateUser({ avatarUrl: data.avatarUrl ?? null })
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
      updateUser({ avatarUrl: null })
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
      setHasSavedProfile(true)
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
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 pb-24 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8 lg:pb-8">
        <header className="border-b border-border pb-5 sm:pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Account</p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Your profile
          </h1>
          <p className="mt-2 text-sm text-muted">
            Update how classmates see you and how StudySync matches you into pods.
          </p>
        </header>

        {error && (
          <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </p>
        )}

        {!hasSavedProfile ? (
          <CompleteStudyPreferencesBanner
            returnTo={ROUTES.PROFILE}
            description="Use the guided setup to add your learning style, availability, courses, and study preferences. You can still edit individual sections below after finishing."
          />
        ) : null}

        <ProfileSummaryCard
          profile={profile}
          userId={user?.id}
          avatarUrl={user?.avatarUrl}
          groupCount={groupCount}
          reliability={reliability}
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

        <section className="border-t border-border pt-6">
          <button
            type="button"
            onClick={() => {
              logout()
              navigate(ROUTES.LOGIN, { replace: true })
            }}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-page sm:w-auto"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </section>
      </div>

      <footer className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] z-40 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur lg:static lg:bottom-auto lg:z-auto lg:mx-auto lg:max-w-4xl lg:border-0 lg:bg-transparent lg:px-8 lg:py-0 lg:pb-8 lg:backdrop-blur-none">
        <div className="mx-auto flex max-w-4xl flex-col-reverse gap-2 border-border sm:flex-row sm:justify-end sm:gap-3 lg:border-t lg:pt-6">
          <Link
            to={ROUTES.STUDENT_DASHBOARD}
            className="inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-muted transition hover:text-ink"
          >
            Cancel
          </Link>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveAll}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-surface transition hover:bg-brand-700 disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </footer>

      <EditProfileModal
        open={isEditOpen}
        profile={profile}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveProfile}
      />
    </>
  )
}
