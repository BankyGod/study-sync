import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getSeoForPath, getSiteOrigin, upsertLinkTag, upsertMetaTag } from '@/utils/seo'

/**
 * Keeps document title, description, canonical, and social tags in sync with the route.
 */
export function SeoManager() {
  const { pathname } = useLocation()

  useEffect(() => {
    const origin = getSiteOrigin()
    const seo = getSeoForPath(pathname)
    const canonical = `${origin}${seo.path}`
    const shareImage = `${origin}/favicon.svg`

    document.title = seo.title

    upsertMetaTag('name', 'description', seo.description)
    upsertMetaTag('name', 'robots', seo.robots)
    upsertMetaTag('property', 'og:title', seo.title)
    upsertMetaTag('property', 'og:description', seo.description)
    upsertMetaTag('property', 'og:url', canonical)
    upsertMetaTag('property', 'og:type', seo.ogType)
    upsertMetaTag('property', 'og:site_name', 'StudySync')
    upsertMetaTag('property', 'og:image', shareImage)
    upsertMetaTag('name', 'twitter:card', 'summary')
    upsertMetaTag('name', 'twitter:title', seo.title)
    upsertMetaTag('name', 'twitter:description', seo.description)
    upsertMetaTag('name', 'twitter:image', shareImage)
    upsertLinkTag('canonical', canonical)
  }, [pathname])

  return null
}
