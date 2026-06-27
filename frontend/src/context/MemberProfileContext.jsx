import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { MemberProfileModal } from '@/components/workspace/MemberProfileModal'
import { useAuth } from '@/hooks/useAuth'
import { useWorkspace } from '@/context/WorkspaceContext'
import { fetchUserReliability } from '@/services/reliabilityService'
import { fetchMemberProfile } from '@/services/usersService'

const MemberProfileContext = createContext(null)

export function MemberProfileProvider({ children }) {
  const { user } = useAuth()
  const { groupId, members } = useWorkspace()
  const [memberId, setMemberId] = useState(null)
  const [profile, setProfile] = useState(null)
  const [reliability, setReliability] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const member = useMemo(
    () => members.find((item) => item.id === memberId) ?? null,
    [members, memberId],
  )

  const openMemberProfile = useCallback((id) => {
    if (!id) return
    setMemberId(id)
  }, [])

  const closeMemberProfile = useCallback(() => {
    setMemberId(null)
    setProfile(null)
    setReliability(null)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!memberId) return undefined

    let cancelled = false

    async function loadProfile() {
      setIsLoading(true)
      setProfile(null)
      setReliability(null)

      try {
        const [nextProfile, nextReliability] = await Promise.all([
          fetchMemberProfile(memberId),
          fetchUserReliability(memberId, groupId).catch(() => null),
        ])

        if (!cancelled) {
          setProfile(nextProfile)
          setReliability(nextReliability)
        }
      } catch {
        if (!cancelled) {
          setProfile(null)
          setReliability(null)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      cancelled = true
    }
  }, [memberId, groupId])

  const value = useMemo(
    () => ({
      openMemberProfile,
      closeMemberProfile,
    }),
    [openMemberProfile, closeMemberProfile],
  )

  return (
    <MemberProfileContext.Provider value={value}>
      {children}
      <MemberProfileModal
        open={Boolean(memberId)}
        onClose={closeMemberProfile}
        member={member}
        profile={profile}
        reliability={reliability}
        isLoading={isLoading}
        isOwnProfile={memberId === user?.id}
      />
    </MemberProfileContext.Provider>
  )
}

export function useMemberProfile() {
  const context = useContext(MemberProfileContext)
  if (!context) {
    throw new Error('useMemberProfile must be used within MemberProfileProvider')
  }
  return context
}
