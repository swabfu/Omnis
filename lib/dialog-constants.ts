// Dialog component constants

// Dialog max width (responsive)
export const DIALOG_MAX_WIDTH = 'max-w-[calc(100%-2rem)]'

// Dialog animation duration
export const DIALOG_ANIMATION_DURATION = 'duration-200'

// Dialog enter/exit transitions
export const DIALOG_ENTER = 'data-[state=open]:animate-in'
export const DIALOG_EXIT = 'data-[state=closed]:animate-out'
export const DIALOG_FADE_IN = 'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
export const DIALOG_ZOOM_IN = 'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
export const DIALOG_SLIDE_IN = 'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]'
