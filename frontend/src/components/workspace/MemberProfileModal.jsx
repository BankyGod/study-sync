import { Link } from 'react-router-dom'
import { GraduationCap, MapPin } from 'lucide-react'
import { Modal } from '@/components/common/Modal'
import { Spinner } from '@/components/common/Spinner'
import { ReliabilityPanel } from '@/components/reliability/ReliabilityPanel'
import { ProfileAvatar } from '@/components/profile/ProfileAvatar'
import { ROUTES } from '@/utils/constants'

export function MemberProfileModal({
  open,
  onClose,
  member,
  profile,
  reliability,
  isLoading,
  isOwnProfile,
}) {
  const displayName = profile?.fullName || member?.name || 'Pod member'
  const role = profile?.studentRole || member?.major || member?.role || 'Study group member'
  const universities = [profile?.primaryUniversity, profile?.secondaryUniversity]
    .filter(Boolean)
    .join(' · ')
  const location = profile?.location
  const email = profile?.email

  return (
    <Modal open={open} onClose={onClose} title="Member profile" className="max-w-md">
      {isLoading ? (
        <div className="flex min-h-[180px] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-start gap-4">
            <ProfileAvatar
              userId={member?.id}
              fullName={displayName}
              avatarUrl={member?.avatarUrl}
              size="md"
            />
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-slate-900">{displayName}</h3>
              <p className="mt-1 text-sm text-slate-600">{role}</p>
              {universities && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                  <GraduationCap className="h-4 w-4 shrink-0" />
                  {universities}
                </p>
              )}
              {(location || email) && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {[location, email].filter(Boolean).join(' · ') || 'No location set'}
                </p>
              )}
            </div>
          </div>

          {!profile && member && (
            <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              This member has limited profile details visible to the pod. More information may appear
              once they update their profile.
            </p>
          )}

          {reliability ? (
            <ReliabilityPanel reliability={reliability} scopeLabel="In this pod" />
          ) : null}

          {isOwnProfile && (
            <Link
              to={ROUTES.PROFILE}
              onClick={onClose}
              className="inline-flex w-full items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              Edit your profile
            </Link>
          )}
        </div>
      )}
    </Modal>
  )
}
