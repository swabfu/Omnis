'use client'

import { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react'
import { ViewMode } from '@/types/database'
import { STORAGE_KEYS } from '@/lib/storage-keys'

interface ViewModeContextType {
  view: ViewMode
  setView: (view: ViewMode) => void
  /** Register a callback to be called immediately when view changes (for transitions) */
  onTransitionRequest: (callback: (newView: ViewMode) => void) => () => void
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined)
const DEFAULT_VIEW: ViewMode = 'masonry'

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  // Initialize with default to avoid hydration mismatch
  // Sync with localStorage after mount on client only
  const [view, setView] = useState<ViewMode>(DEFAULT_VIEW)
  const [mounted, setMounted] = useState(false)
  const transitionCallbacksRef = useRef<Set<(newView: ViewMode) => void>>(new Set())

  useEffect(() => {
    // Read from localStorage after mount (client-only)
    const saved = localStorage.getItem(STORAGE_KEYS.VIEW_MODE)
    if (saved === 'list' || saved === 'masonry' || saved === 'uniform') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Syncing localStorage to state on mount is valid
      setView(saved)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    // Persist to localStorage on change (client-only)
    if (mounted) {
      localStorage.setItem(STORAGE_KEYS.VIEW_MODE, view)
    }
  }, [view, mounted])

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => {
    // Register/unregister transition callbacks
    const onTransitionRequest = (callback: (newView: ViewMode) => void) => {
      transitionCallbacksRef.current.add(callback)
      return () => {
        transitionCallbacksRef.current.delete(callback)
      }
    }

    // Enhanced setView that triggers transition callbacks immediately
    const setViewWithTransition = (newView: ViewMode) => {
      if (newView === view) return

      // Update state first
      setView(newView)

      // Immediately notify all transition listeners (synchronous)
      transitionCallbacksRef.current.forEach(callback => callback(newView))
    }

    return {
      view,
      setView: setViewWithTransition,
      onTransitionRequest,
    }
  }, [view])

  return (
    <ViewModeContext.Provider value={value}>
      {children}
    </ViewModeContext.Provider>
  )
}

export function useViewMode() {
  const context = useContext(ViewModeContext)
  if (!context) throw new Error('useViewMode must be used within ViewModeProvider')
  return context
}
