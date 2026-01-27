// Tag color constants - used across tag selector, tag manager, and sidebar

export const PRESET_TAG_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e',
] as const

export const DEFAULT_TAG_COLOR = '#3b82f6'

// Opacity values for tag backgrounds (hex + opacity = 2-digit hex)
// 15% opacity = "15", 40% opacity = "40"
export const TAG_BG_OPACITY = '15'
export const TAG_BORDER_OPACITY = '40'
