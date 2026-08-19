import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { ProfileSummaryCard } from '@/components/profile/ProfileSummaryCard'
import { EditProfileModal } from '@/components/profile/EditProfileModal'
import { CompleteStudyPreferencesBanner } from '@/components/onboarding/CompleteStudyPreferencesBanner'
import { LearningStyleSelector } from '@/components/profile/LearningStyleSelector'
import { AvailabilityScheduler } from '@/components/profile/AvailabilityScheduler'
import { EnrolledCourses } from '@/components/profile/EnrolledCourses'
import { Button } from '@/components/common/Button'
import { Spinner } from '@/components/common/Spinner'
import { PageHeader, PageShell } from '@/components/layout/PageShell'
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
      <PageShell width="4xl" className="pb-28 lg:pb-9">
        <PageHeader
          eyebrow="Account"
          title="Your profile"
          description="Update how classmates see you and how StudySync matches you into pods."
        />

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

        <div className="mt-8 space-y-8">
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
          <Button
            variant="secondary"
            onClick={() => {
              logout()
              navigate(ROUTES.LOGIN, { replace: true })
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </section>
        </div>
      </PageShell>

      <footer className="fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom,0px))] z-40 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur lg:static lg:bottom-auto lg:z-auto lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
        <div className="mx-auto flex max-w-4xl flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3 lg:border-t lg:border-border lg:pt-6">
          <Button variant="ghost" asChild>
            <Link to={ROUTES.STUDENT_DASHBOARD}>Cancel</Link>
          </Button>
          <Button disabled={isSaving} onClick={handleSaveAll}>
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
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
