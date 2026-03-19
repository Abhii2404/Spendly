'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface RefetchContextType {
  refetchDashboard: () => void
  setRefetchDashboard: (fn: () => void) => void
}

const RefetchContext = createContext<RefetchContextType | undefined>(undefined)

export function RefetchProvider({ children }: { children: ReactNode }) {
  const [refetchDashboardFn, setRefetchDashboardFn] = useState<() => void>(() => () => {})

  const setRefetchDashboard = (fn: () => void) => {
    setRefetchDashboardFn(() => fn)
  }

  return (
    <RefetchContext.Provider value={{ refetchDashboard: refetchDashboardFn, setRefetchDashboard }}>
      {children}
    </RefetchContext.Provider>
  )
}

export function useRefetch() {
  const context = useContext(RefetchContext)
  if (context === undefined) {
    throw new Error('useRefetch must be used within a RefetchProvider')
  }
  return context
}
