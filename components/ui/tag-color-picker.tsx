'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  ACTION_ICON_STROKE_WIDTH,
  TAG_COLOR_BUTTON_SIZE,
  TAG_COLOR_PICKER_SIZE_LG,
  TAG_COLOR_PICKER_SIZE,
} from '@/lib/type-icons'
import { PRESET_TAG_COLORS, DEFAULT_TAG_COLOR } from '@/lib/tag-colors'

export type TagColorPickerVariant = 'dialog' | 'popover' | 'sidebar'

interface TagColorPickerProps {
  selectedColor: string
  onColorChange: (color: string) => void
  variant?: TagColorPickerVariant
  onClose?: () => void
}

/**
 * Reusable color picker for tag creation and editing.
 *
 * Variants:
 * - 'dialog': Uses Check icon for selected state, larger layout (for TagManagerDialog)
 * - 'popover': Compact layout, auto-closes on selection (for TagSelector)
 * - 'sidebar': Compact layout, NO auto-save (for SidebarTagItem - requires explicit Save button)
 */
export function TagColorPicker({
  selectedColor,
  onColorChange,
  variant = 'dialog',
  onClose,
}: TagColorPickerProps) {
  const isDialog = variant === 'dialog'
  const isSidebar = variant === 'sidebar'
  const buttonSize = isDialog ? TAG_COLOR_PICKER_SIZE_LG : TAG_COLOR_PICKER_SIZE
  const inputHeight = isDialog ? 'h-8' : 'h-7'

  // Layout classes per variant
  const presetGridClass = isDialog ? 'flex flex-wrap gap-2' : 'grid grid-cols-9 gap-1.5'

  const handleColorSelect = (color: string) => {
    onColorChange(color)
    // Only auto-close for dialog and popover variants, NOT sidebar
    if (!isSidebar) {
      onClose?.()
    }
  }

  const isSelected = (color: string) => selectedColor === color

  return (
    <div className="space-y-2">
      {/* Preset colors */}
      <div className={presetGridClass}>
        {PRESET_TAG_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => handleColorSelect(color)}
            className={cn(
              TAG_COLOR_BUTTON_SIZE,
              'rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus:ring-transparent focus:ring-offset-0'
            )}
            style={{
              backgroundColor: color,
              borderColor: isSelected(color)
                ? 'hsl(var(--background))'
                : 'transparent',
              boxShadow: isSelected(color)
                ? `0 0 0 2px ${color}`
                : undefined,
            }}
          >
            {isDialog && isSelected(color) && (
              <Check
                className="h-4 w-4 mx-auto"
                strokeWidth={ACTION_ICON_STROKE_WIDTH}
                style={{ color: 'white' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Custom color picker */}
      <div className="flex items-center gap-2 pt-1 border-t">
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => onColorChange(e.target.value)}
          className={cn(buttonSize, 'cursor-pointer rounded border')}
        />
        <Input
          type="text"
          value={selectedColor}
          onChange={(e) => onColorChange(e.target.value)}
          className={cn(inputHeight, 'flex-1 text-xs font-mono')}
          placeholder={DEFAULT_TAG_COLOR}
        />
      </div>
    </div>
  )
}
