import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  fetchCurrentUser,
  getStoredToken,
  getStoredUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from '@/services/authService'
import { disconnectSocket } from '@/services/websocketService'
import { DEV_BYPASS_AUTH, DEV_MOCK_USER } from '@/utils/constants'

const AuthContext = createContext(null)

function getInitialUser() {
  return getStoredUser() ?? (DEV_BYPASS_AUTH ? DEV_MOCK_USER : null)
}

function getInitialToken() {
  return getStoredToken() ?? (DEV_BYPASS_AUTH ? 'dev-token' : null)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser)
  const [token, setToken] = useState(getInitialToken)
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (credentials) => {
    setIsLoading(true)
    try {
      const data = await loginRequest(credentials)
      setUser(data.user)
      setToken(data.token)
      return data
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (payload) => {
    setIsLoading(true)
    try {
      const data = await registerRequest(payload)
      setUser(data.user)
      setToken(data.token)
      return data
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    logoutRequest()
    disconnectSocket()
    if (DEV_BYPASS_AUTH) {
      setUser(DEV_MOCK_USER)
      setToken('dev-token')
      return
    }
    setUser(null)
    setToken(null)
  }, [])

  const refreshUser = useCallback(async () => {
    if (!getStoredToken()) return null
    setIsLoading(true)
    try {
      const currentUser = await fetchCurrentUser()
      setUser(currentUser)
      return currentUser
    } catch {
      logout()
      return null
    } finally {
      setIsLoading(false)
    }
  }, [logout])

  const value = useMemo(
    () => ({
      user: user ?? (DEV_BYPASS_AUTH ? DEV_MOCK_USER : null),
      token: token ?? (DEV_BYPASS_AUTH ? 'dev-token' : null),
      isAuthenticated: DEV_BYPASS_AUTH || Boolean(token && user),
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, isLoading, login, register, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}
