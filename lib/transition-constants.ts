// Transition and animation constants

// Feed view transition (for switching between masonry/uniform/list)
export const FEED_TRANSITION_DURATION = 'duration-250'
export const FEED_TRANSITION_TIMING = 'ease-in-out'

// Grid item transitions
export const GRID_TRANSITION_DURATION = 'duration-200'

// Common transitions
export const TRANSITION_COLORS = 'transition-colors'
export const TRANSITION_OPACITY = 'transition-opacity'
export const TRANSITION_ALL = 'transition-all'

// Hover transitions
export const HOVER_TRANSITION = 'hover:transition-opacity'

// Combined transition classes
export const FEED_TRANSITION = `${FEED_TRANSITION_DURATION} ${FEED_TRANSITION_TIMING}`
export const GRID_TRANSITION = `${TRANSITION_OPACITY} ${GRID_TRANSITION_DURATION}`
