import { ROUTES } from '@/utils/constants'

const DEFAULT_DESCRIPTION =
  'StudySync helps students form study pods, collaborate in shared workspaces, and stay on track with coursework.'

// Keep pages crawlable for Lighthouse `is-crawlable`. Private routes are blocked in robots.txt.
const PAGE_ROBOTS = 'index,follow,max-image-preview:large'

const PAGE_SEO = [
  {
    match: (path) => path === ROUTES.LOGIN || path === '/',
    path: ROUTES.LOGIN,
    title: 'Sign in · StudySync',
    description: 'Sign in to StudySync to join study pods, open your workspace, and collaborate with classmates.',
    robots: PAGE_ROBOTS,
    ogType: 'website',
  },
  {
    match: (path) => path === ROUTES.REGISTER,
    path: ROUTES.REGISTER,
    title: 'Create account · StudySync',
    description: 'Create a StudySync student account to find course pods, match with classmates, and study together.',
    robots: PAGE_ROBOTS,
    ogType: 'website',
  },
  {
    match: (path) => path === ROUTES.ADMIN_LOGIN,
    path: ROUTES.ADMIN_LOGIN,
    title: 'Admin sign in · StudySync',
    description: 'Sign in to the StudySync admin portal to manage cohorts, groups, and students.',
    robots: PAGE_ROBOTS,
    ogType: 'website',
  },
  {
    match: (path) => path === ROUTES.ADMIN_REGISTER,
    path: ROUTES.ADMIN_REGISTER,
    title: 'Admin registration · StudySync',
    description: 'Register an instructor or admin account for the StudySync management portal.',
    robots: PAGE_ROBOTS,
    ogType: 'website',
  },
  {
    match: (path) => path === ROUTES.STUDENT_DASHBOARD,
    path: ROUTES.STUDENT_DASHBOARD,
    title: 'Dashboard · StudySync',
    description: 'Your StudySync dashboard with study pods, progress, and upcoming deadlines.',
    robots: PAGE_ROBOTS,
    ogType: 'website',
  },
  {
    match: (path) => path === ROUTES.FIND_GROUPS,
    path: ROUTES.FIND_GROUPS,
    title: 'Find groups · StudySync',
    description: 'Find open study pods for your courses or create a new pod classmates can join.',
    robots: PAGE_ROBOTS,
    ogType: 'website',
  },
  {
    match: (path) => path === ROUTES.PROFILE,
    path: ROUTES.PROFILE,
    title: 'Profile · StudySync',
    description: 'Manage your StudySync profile, courses, availability, and learning preferences.',
    robots: PAGE_ROBOTS,
    ogType: 'profile',
  },
  {
    match: (path) => path === ROUTES.NOTIFICATIONS,
    path: ROUTES.NOTIFICATIONS,
    title: 'Notifications · StudySync',
    description: 'View StudySync notifications for pods, sessions, and workspace activity.',
    robots: PAGE_ROBOTS,
    ogType: 'website',
  },
  {
    match: (path) => path.startsWith('/workspace'),
    path: ROUTES.WORKSPACE_LIST,
    title: 'Workspace · StudySync',
    description: 'Collaborate in your StudySync pod workspace with board, files, chat, and calendar.',
    robots: PAGE_ROBOTS,
    ogType: 'website',
  },
  {
    match: (path) => path === ROUTES.ONBOARDING,
    path: ROUTES.ONBOARDING,
    title: 'Onboarding · StudySync',
    description: 'Set up your StudySync courses, availability, and learning style.',
    robots: PAGE_ROBOTS,
    ogType: 'website',
  },
  {
    match: (path) => path.startsWith('/admin'),
    path: ROUTES.ADMIN_DASHBOARD,
    title: 'Admin · StudySync',
    description: 'StudySync admin tools for cohorts, groups, and student management.',
    robots: PAGE_ROBOTS,
    ogType: 'website',
  },
]

export function getSiteOrigin() {
  const fromEnv = String(import.meta.env.VITE_SITE_URL || '')
    .trim()
    .replace(/\/$/, '')
  if (fromEnv) return fromEnv
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return ''
}

export function getSeoForPath(pathname = '/') {
  const path = pathname.split('?')[0] || '/'
  const match = PAGE_SEO.find((entry) => entry.match(path))
  if (match) {
    return {
      path: match.path,
      title: match.title,
      description: match.description,
      robots: match.robots,
      ogType: match.ogType,
    }
  }
  return {
    path,
    title: 'StudySync',
    description: DEFAULT_DESCRIPTION,
    robots: PAGE_ROBOTS,
    ogType: 'website',
  }
}

export function upsertMetaTag(attrName, attrValue, content) {
  if (typeof document === 'undefined') return
  let el = document.head.querySelector(`meta[${attrName}="${attrValue}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attrName, attrValue)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function upsertLinkTag(rel, href) {
  if (typeof document === 'undefined') return
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export const DEFAULT_SEO_DESCRIPTION = DEFAULT_DESCRIPTION

export const PUBLIC_SITEMAP_PATHS = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.ADMIN_LOGIN,
  ROUTES.ADMIN_REGISTER,
]
