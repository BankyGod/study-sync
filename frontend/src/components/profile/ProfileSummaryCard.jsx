import { GraduationCap, MapPin, Mail } from 'lucide-react'
import { ProfileAvatar } from '@/components/profile/ProfileAvatar'

export function ProfileSummaryCard({
  profile,
  userId,
  avatarUrl,
  groupCount = 0,
  reliability = null,
  avatarRefreshKey = 0,
  isAvatarUploading = false,
  onEdit,
  onAvatarUpload,
  onAvatarRemove,
}) {
  const universities = [profile.primaryUniversity, profile.secondaryUniversity]
    .filter(Boolean)
    .join(' · ')

  return (
    <section className="border-b border-border pb-6 sm:pb-8">
      <div className="flex items-start gap-4">
        <ProfileAvatar
          userId={userId}
          fullName={profile.fullName}
          avatarUrl={avatarUrl}
          size="lg"
          editable
          refreshKey={avatarRefreshKey}
          isUploading={isAvatarUploading}
          onUpload={onAvatarUpload}
          onRemove={onAvatarRemove}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="break-words font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                {profile.fullName}
              </h2>
              <p className="mt-1 text-sm text-muted">{profile.studentRole}</p>
            </div>
            <button
              type="button"
              onClick={onEdit}
              className="hidden min-h-10 shrink-0 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-ink transition hover:bg-page sm:inline-flex sm:items-center"
            >
              Edit profile
            </button>
          </div>

          {universities ? (
            <p className="mt-3 flex min-w-0 items-start gap-1.5 text-sm text-muted">
              <GraduationCap className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="min-w-0 break-words">{universities}</span>
            </p>
          ) : null}

          <p className="mt-1.5 flex min-w-0 items-start gap-1.5 text-sm text-muted">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="min-w-0 break-words">{profile.location || 'No location set'}</span>
          </p>

          {profile.email ? (
            <p className="mt-1.5 flex min-w-0 items-start gap-1.5 text-sm text-muted">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="min-w-0 break-all">{profile.email}</span>
            </p>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={onEdit}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-page sm:hidden"
      >
        Edit profile
      </button>

      <dl className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4">
        <div className="rounded-lg border border-border bg-surface px-3 py-3 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted sm:text-xs">
            Study groups
          </dt>
          <dd className="mt-1 font-display text-xl font-semibold text-ink sm:text-2xl">
            {groupCount}
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-surface px-3 py-3 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted sm:text-xs">
            Reliability
          </dt>
          <dd className="mt-1 font-display text-xl font-semibold text-ink sm:text-2xl">
            {reliability?.score != null ? `${reliability.score}%` : 'Building'}
          </dd>
          <p className="mt-0.5 text-[11px] leading-snug text-muted sm:text-xs">
            {reliability?.score != null
              ? reliability.label || 'Current score'
              : `${reliability?.tasksScored ?? 0}/3 scored tasks`}
          </p>
        </div>
      </dl>
    </section>
  )
}
