/**
 * Timeout and delay constants used throughout the application.
 * Centralized to avoid magic numbers and enable easy adjustments.
 */

/** Delay before hiding success messages (e.g., login success) */
export const SUCCESS_MESSAGE_TIMEOUT = 5000

/** Delay for fade-out transition when switching views */
export const TRANSITION_OUT_DELAY = 250

/** Delay for fade-in transition when switching views */
export const TRANSITION_IN_DELAY = 300

/** Debounce delay for fetching URL metadata */
export const METADATA_DEBOUNCE_DELAY = 500
