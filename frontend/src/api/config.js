export const DEFAULT_PROD_API_BASE = 'https://studysync-backend-5i2a.onrender.com/api'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? DEFAULT_PROD_API_BASE : '/api')
