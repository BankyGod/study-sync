export {
  buildProfileFromAuthUser,
  fetchUserGroups,
  getProfileInitials,
  getUserGroupsErrorMessage,
  getUserProfileErrorMessage,
  loadUserProfile,
  normalizeUserProfile,
  saveUserProfile,
} from '@/services/usersService'

// Backward-compatible alias
export const DEFAULT_USER_PROFILE = {
  fullName: '',
  studentRole: '',
  primaryUniversity: '',
  secondaryUniversity: '',
  email: '',
  location: '',
}
