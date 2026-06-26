import { GraduationCap, MapPin } from 'lucide-react'
import { ProfileAvatar } from '@/components/profile/ProfileAvatar'

export function ProfileSummaryCard({
  profile,
  userId,
  groupCount = 0,
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
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap items-start gap-4">
          <ProfileAvatar
            userId={userId}
            fullName={profile.fullName}
            size="lg"
            editable
            refreshKey={avatarRefreshKey}
            isUploading={isAvatarUploading}
            onUpload={onAvatarUpload}
            onRemove={onAvatarRemove}
          />
          <div>
            <h2 className="text-lg font-bold tracking-wide text-slate-900 uppercase">
              {profile.fullName}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{profile.studentRole}</p>
            {universities && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                <GraduationCap className="h-4 w-4 shrink-0" />
                {universities}
              </p>
            )}
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <MapPin className="h-4 w-4 shrink-0" />
              {profile.location || 'No location set'}
              {profile.email ? ` · ${profile.email}` : ''}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="text-sm font-semibold text-violet-600 transition hover:text-violet-700"
        >
          Edit Profile
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-violet-50 px-4 py-3">
          <p className="text-2xl font-bold text-slate-900">{groupCount}</p>
          <p className="text-sm text-slate-600">Study groups</p>
        </div>
        <div className="rounded-xl bg-cyan-50 px-4 py-3">
          <p className="text-2xl font-bold text-slate-900">—</p>
          <p className="text-sm text-slate-600">Total sessions</p>
        </div>
        <div className="rounded-xl bg-amber-50 px-4 py-3">
          <p className="text-2xl font-bold text-slate-900">—</p>
          <p className="text-sm text-slate-600">Total study time</p>
        </div>
      </div>
    </section>
  )
}
