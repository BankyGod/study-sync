export const MAX_AVAILABILITY_SLOTS = 5

export const AVAILABILITY_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

export const AVAILABILITY_TIMES = ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM']

export const DEFAULT_AVAILABILITY = [
  'Mon-8 AM',
  'Tue-10 AM',
  'Wed-12 PM',
  'Thu-2 PM',
  'Fri-4 PM',
]

export const ONBOARDING_STEPS = [
  { id: 'style', label: 'Style' },
  { id: 'availability', label: 'Availability' },
  { id: 'courses', label: 'Courses' },
  { id: 'preferences', label: 'Preferences' },
]

export const COURSE_SUBJECTS = [
  'Biology',
  'Mathematics',
  'Physics',
  'Computer Science',
  'Chemistry',
  'Engineering',
  'Economics',
  'Psychology',
]

export const DEFAULT_COURSES = [
  { id: '1', subject: 'Biology', courseNumber: '101' },
  { id: '2', subject: '', courseNumber: '' },
]

export const DEFAULT_STUDY_PREFERENCES = {
  groupSize: 'small',
  timeCommitment: 'medium',
  difficulty: 'advanced',
}

export const GROUP_SIZE_OPTIONS = [
  { id: 'small', label: 'Small', description: '2-3 people' },
  { id: 'medium', label: 'Medium', description: '4-6 people' },
  { id: 'large', label: 'Large', description: '7+ people' },
]

export const TIME_COMMITMENT_OPTIONS = [
  { id: 'low', label: 'Low', description: '1-3 hours' },
  { id: 'medium', label: 'Medium', description: '4-7 hours' },
  { id: 'high', label: 'High', description: '8+ hours' },
]

export const DIFFICULTY_OPTIONS = [
  { id: 'beginner', label: 'Beginner', description: 'New to the subject' },
  { id: 'intermediate', label: 'Intermediate', description: 'Some prior knowledge' },
  { id: 'advanced', label: 'Advanced', description: 'Deep understanding' },
]

export const LEARNING_STYLE_OPTIONS = [
  {
    id: 'visual',
    label: 'Visual',
    description: 'I learn best through images, diagrams, and videos.',
  },
  {
    id: 'auditory',
    label: 'Auditory',
    description: 'I learn best through listening, speaking, and discussion.',
  },
  {
    id: 'reading',
    label: 'Reading/Writing',
    description: 'I learn best through reading text and taking notes.',
  },
  {
    id: 'kinesthetic',
    label: 'Kinesthetic',
    description: 'I learn best through hands-on activities and practice.',
  },
]

export function getValidCourses(courses = []) {
  return courses.filter((course) => course.subject?.trim() && course.courseNumber?.trim())
}

export function formatCourseName(course) {
  return `${course.subject.trim()} ${course.courseNumber.trim()}`
}

export function getPrimaryCourse(courses = []) {
  const valid = getValidCourses(courses)
  return valid[0] ?? null
}

export function buildStudyGroupTitle(course) {
  if (!course) return 'Study Group'
  return `${formatCourseName(course)} Study Group`
}

export function courseToGroupId(course) {
  if (!course) return 'demo'
  return formatCourseName(course).toLowerCase().replace(/\s+/g, '-')
}
