export const UNIVERSITIES = [
  'Ghana Communication Technology University (GCTU)',
  'University of Ghana',
  'KNUST',
  'Ashesi University',
  'Babcock University',
]

export const ACADEMIC_PROGRAMS = [
  'BSc. Information Technology',
  'BSc. Computer Science',
  'BSc. Business Administration',
  'BSc. Electrical Engineering',
  'BSc. Mathematics',
  'BSc. Data Science',
]

export const ACADEMIC_LEVELS = ['100', '200', '300', '400']

export const AUTH_BACKGROUND_IMAGE = '/images/auth-campus-study.jpg'

function capitalize(value = '') {
  if (!value) return ''
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

/**
 * Backend register still requires academic fields for all roles.
 * Instructors only enter email/password in the UI; we fill the rest.
 */
export function buildInstructorRegisterPayload({ email, password }) {
  const local = String(email).split('@')[0] || 'instructor'
  const parts = local.split(/[._-]+/).filter(Boolean)
  const firstName = capitalize(parts[0]) || 'Instructor'
  const lastName = capitalize(parts.slice(1).join(' ')) || 'Admin'

  return {
    firstName,
    lastName,
    studentId: `INST-${Date.now().toString(36).toUpperCase()}`,
    email,
    phone: '',
    university: UNIVERSITIES[0],
    program: 'Instructor',
    level: '400',
    role: 'instructor',
    password,
  }
}
