'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  TRANSITION_OUT_DELAY,
  TRANSITION_IN_DELAY,
} from '../timeout-constants'

/**
 * Transition phases for view switching animations
 */
export type TransitionPhase = 'idle' | 'out' | 'in'

/**
 * Configuration options for the transition hook
 */
interface UseTransitionStateOptions {
  /** Delay in ms for fade-out phase (default: TRANSITION_OUT_DELAY) */
  outDelay?: number
  /** Delay in ms for fade-in phase (default: TRANSITION_IN_DELAY) */
  inDelay?: number
  /** Callback when transition starts */
  onTransitionStart?: () => void
  /** Callback when transition completes */
  onTransitionComplete?: () => void
}

/**
 * Result type from useTransitionState hook
 */
interface TransitionStateResult {
  /** Current transition phase */
  phase: TransitionPhase
  /** The value that should currently be displayed (may lag behind actualValue during transitions) */
  displayValue: string
  /** Manually trigger a transition to a new value */
  transitionTo: (newValue: string) => void
  /** Reset to idle immediately without animation */
  reset: () => void
  /** Whether a transition is currently in progress */
  isTransitioning: boolean
}

/**
 * Global transition state hook for handling view switching animations.
 *
 * This hook fixes race conditions that can cause transitions to freeze:
 * 1. Tracks active timeout IDs and cleans them up properly
 * 2. Guards against overlapping transitions
 * 3. Uses a ref for the display value to prevent stale closures
 * 4. Only allows one transition at a time
 *
 * @param initialValue - The initial value to display
 * @param options - Optional configuration for transition behavior
 * @returns Transition state and control functions
 *
 * @example
 * ```tsx
 * const { phase, displayValue, transitionTo } = useTransitionState('masonry')
 *
 * // When user clicks view button
 * const handleViewChange = (newView: ViewMode) => {
 *   transitionTo(newView)
 * }
 *
 * // Render based on displayValue (not the actual view prop)
 * <div className={getAnimationClasses(phase)}>
 *   {displayValue === 'masonry' ? <MasonryView /> : <ListView />}
 * </div>
 * ```
 */
export function useTransitionState(
  initialValue: string,
  options: UseTransitionStateOptions = {}
): TransitionStateResult {
  const {
    outDelay = TRANSITION_OUT_DELAY,
    inDelay = TRANSITION_IN_DELAY,
    onTransitionStart,
    onTransitionComplete,
  } = options

  const [phase, setPhase] = useState<TransitionPhase>('idle')
  const [displayValue, setDisplayValue] = useState(initialValue)
  const [actualValue, setActualValue] = useState(initialValue)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Use refs to track timeouts and prevent stale closures
  const outTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const transitioningRef = useRef(false)

  /**
   * Transition to a new value with fade-out/fade-in animation
   */
  const transitionTo = useCallback((newValue: string) => {
    // Guard: Don't start a new transition if already transitioning
    if (transitioningRef.current) {
      // If the same value is requested during transition, update actual value
      // but don't interrupt the transition
      setActualValue(newValue)
      return
    }

    // Guard: No transition needed if value is the same
    if (newValue === actualValue) {
      return
    }

    // Mark as transitioning
    transitioningRef.current = true
    setIsTransitioning(true)
    onTransitionStart?.()

    // Store the new value we're transitioning to
    setActualValue(newValue)

    // Clear any existing timeouts to prevent race conditions
    if (outTimeoutRef.current) {
      clearTimeout(outTimeoutRef.current)
      outTimeoutRef.current = null
    }
    if (inTimeoutRef.current) {
      clearTimeout(inTimeoutRef.current)
      inTimeoutRef.current = null
    }

    // Phase 1: Fade out
    setPhase('out')

    // Phase 2: After fade-out completes, switch content and fade in
    outTimeoutRef.current = setTimeout(() => {
      // Switch the displayed content
      setDisplayValue(newValue)

      // Phase 3: Fade in
      setPhase('in')

      // Phase 4: After fade-in completes, return to idle
      inTimeoutRef.current = setTimeout(() => {
        setPhase('idle')
        transitioningRef.current = false
        setIsTransitioning(false)
        onTransitionComplete?.()
      }, inDelay)
    }, outDelay)
  }, [actualValue, outDelay, inDelay, onTransitionStart, onTransitionComplete])

  /**
   * Immediately reset to idle state without animation
   * Useful for cleanup or when transitions should be skipped
   */
  const reset = useCallback(() => {
    // Clear any pending timeouts
    if (outTimeoutRef.current) {
      clearTimeout(outTimeoutRef.current)
      outTimeoutRef.current = null
    }
    if (inTimeoutRef.current) {
      clearTimeout(inTimeoutRef.current)
      inTimeoutRef.current = null
    }

    // Reset all state
    setPhase('idle')
    transitioningRef.current = false
    setIsTransitioning(false)

    // Sync display value with actual value
    setDisplayValue(actualValue)
  }, [actualValue])

  /**
   * Update display value when initialValue changes externally
   * This handles cases where the prop changes without calling transitionTo
   */
  useEffect(() => {
    if (initialValue !== actualValue && !isTransitioning) {
      setActualValue(initialValue)
      setDisplayValue(initialValue)
    }
  }, [initialValue, actualValue, isTransitioning])

  /**
   * Cleanup on unmount
   * This is critical to prevent memory leaks and state updates after unmount
   */
  useEffect(() => {
    return () => {
      if (outTimeoutRef.current) {
        clearTimeout(outTimeoutRef.current)
      }
      if (inTimeoutRef.current) {
        clearTimeout(inTimeoutRef.current)
      }
    }
  }, [])

  return {
    phase,
    displayValue,
    transitionTo,
    reset,
    isTransitioning,
  }
}
