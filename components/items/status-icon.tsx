'use client'

import { ItemStatus } from '@/types/database'
import { statusIcons, statusBadgeColors, statusLabels, STATUS_BADGE_ICON_SIZE, STATUS_BADGE_STROKE_WIDTH } from '@/lib/status-icons'
import { cn } from '@/lib/utils'

interface StatusIconProps {
  status: ItemStatus
  showLabel?: boolean
  className?: string
}

export function StatusIcon({ status, showLabel = false, className }: StatusIconProps) {
  const Icon = statusIcons[status]
  const colorClass = statusBadgeColors[status]
  const label = statusLabels[status]

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center gap-1.5 px-2 py-1 rounded-md',
        colorClass,
        className
      )}
      title={label}
    >
      <Icon className={STATUS_BADGE_ICON_SIZE} strokeWidth={STATUS_BADGE_STROKE_WIDTH} />
      {showLabel && <span className="text-xs font-medium">{label}</span>}
    </div>
  )
}
