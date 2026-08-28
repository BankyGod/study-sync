import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'studysync.sidebar.collapsed'

const SidebarContext = createContext(null)

export function SidebarProvider({ children }) {
  const [collapsed, setCollapsedState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed))
    } catch {
      // ignore storage errors
    }
  }, [collapsed])

  const toggle = useCallback(() => {
    setCollapsedState((value) => !value)
  }, [])

  const setCollapsed = useCallback((value) => {
    setCollapsedState(value)
  }, [])

  return (
    <SidebarContext.Provider value={{ collapsed, toggle, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }
  return context
}
