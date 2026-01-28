'use client'

import { ContentType, ItemStatus } from '@/types/database'
import { StatusIcon } from './status-icon'
import {
  typeIcons,
  typeColors,
  BADGE_ICON_SIZE,
  BADGE_ICON_STROKE_WIDTH,
  LABEL_ICON_SIZE,
  LABEL_ICON_STROKE_WIDTH,
} from '@/lib/type-icons'
import { DEFAULT_TAG_COLOR } from '@/lib/tag-colors'
import { Tag as TagIcon } from 'lucide-react'

interface Tag {
  id: string
  name: string
  color?: string
}

interface ItemCardLabelsProps {
  type: ContentType
  status: ItemStatus
  tags: Tag[]
}

export function ItemCardLabels({ type, status, tags }: ItemCardLabelsProps) {
  const TypeIcon = typeIcons[type]
  const typeColor = typeColors[type]

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Type icon */}
      <div
        className="flex items-center justify-center px-2 py-1 rounded-md"
        style={{ color: typeColor }}
        title={type}
      >
        <TypeIcon className={LABEL_ICON_SIZE} strokeWidth={LABEL_ICON_STROKE_WIDTH} />
      </div>

      {/* Status icon */}
      <StatusIcon status={status} />

      {/* Tags */}
      {tags.map((tag) => (
        <div
          key={tag.id}
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium"
          style={{
            backgroundColor: `${tag.color || DEFAULT_TAG_COLOR}15`,
            color: `${tag.color || DEFAULT_TAG_COLOR}`,
          }}
          title={tag.name}
        >
          <TagIcon className={BADGE_ICON_SIZE} strokeWidth={BADGE_ICON_STROKE_WIDTH} />
          <span>{tag.name}</span>
        </div>
      ))}
    </div>
  )
}
