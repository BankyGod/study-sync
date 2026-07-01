import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { STORAGE_KEYS } from '@/utils/constants'

/**
 * After Render (or similar) serves 404.html for a deep link, we land on `/` and
 * restore the intended client route here.
 */
export function SpaPathRecovery() {
  const navigate = useNavigate()

  useEffect(() => {
    let savedPath = null

    try {
      savedPath = sessionStorage.getItem(STORAGE_KEYS.SPA_PATH_RECOVERY)
      if (savedPath) {
        sessionStorage.removeItem(STORAGE_KEYS.SPA_PATH_RECOVERY)
      }
    } catch {
      savedPath = null
    }

    if (!savedPath || savedPath === '/' || savedPath === '/index.html') {
      return
    }

    navigate(savedPath, { replace: true })
  }, [navigate])

  return null
}
