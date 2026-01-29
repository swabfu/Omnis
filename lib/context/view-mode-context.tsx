'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { ViewMode } from '@/types/database'

interface ViewModeContextType {
  view: ViewMode
  setView: (view: ViewMode) => void
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined)

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<ViewMode>(() => {
    // Read from localStorage on mount (global persistence)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('omnis:view-mode')
      return (saved === 'list' || saved === 'masonry' || saved === 'uniform') ? saved : 'masonry'
    }
    return 'masonry'
  })

  useEffect(() => {
    // Persist to localStorage on change
    localStorage.setItem('omnis:view-mode', view)
  }, [view])

  return (
    <ViewModeContext.Provider value={{ view, setView }}>
      {children}
    </ViewModeContext.Provider>
  )
}

export function useViewMode() {
  const context = useContext(ViewModeContext)
  if (!context) throw new Error('useViewMode must be used within ViewModeProvider')
  return context
}
