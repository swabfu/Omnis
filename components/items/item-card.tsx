'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreVertical,
  ExternalLink,
  Check,
  Archive,
  Trash2,
  FileEdit,
  Tag,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ContentType, ItemStatus, Database } from '@/types/database'
import { Tweet } from 'react-tweet'
import { createClient } from '@/lib/supabase/client'
import { EditItemDialog } from './edit-item-dialog'
import { StatusIcon } from './status-icon'
import {
  typeIcons,
  typeColors,
  BADGE_ICON_SIZE,
  BADGE_ICON_STROKE_WIDTH,
  SMALL_ICON_SIZE,
  LABEL_ICON_SIZE,
  LABEL_ICON_STROKE_WIDTH,
  DROPDOWN_ICON_SIZE,
} from '@/lib/type-icons'
import { DEFAULT_TAG_COLOR } from '@/lib/tag-colors'

type Item = Database['public']['Tables']['items']['Row']

interface Tag {
  id: string
  name: string
  color?: string
}

interface ItemWithTags extends Item {
  tags: Tag[]
}

interface ItemCardProps {
  id: string
  type: ContentType
  url: string | null
  title: string | null
  description: string | null
  content: string | null
  image_path: string | null
  status: ItemStatus
  created_at: string
  tags?: Tag[]
  onDelete?: (id: string) => void
  onStatusChange?: (id: string, status: ItemStatus) => void
  onItemUpdated?: () => void
  variant?: 'card' | 'list'
}

export function ItemCard({
  id,
  type,
  url,
  title,
  description,
  content,
  image_path,
  status,
  created_at,
  tags = [],
  onDelete,
  onStatusChange,
  onItemUpdated,
  variant = 'card',
}: ItemCardProps) {
  const TypeIcon = typeIcons[type]
  const typeColor = typeColors[type]
  const supabase = createClient()
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const item: ItemWithTags = {
    id,
    type,
    url,
    title,
    description,
    content,
    image_path,
    status,
    created_at,
    tags: tags || [],
    user_id: '',
    embedding: null,
  }

  const handleStatusChange = (newStatus: ItemStatus) => {
    onStatusChange?.(id, newStatus)
  }

  const handleDelete = () => {
    if (confirm('Delete this item?')) {
      onDelete?.(id)
    }
  }

  const renderContent = () => {
    if (type === 'note') {
      return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap">{content}</p>
        </div>
      )
    }

    if (type === 'tweet' && url) {
      const tweetId = url.match(/(twitter|x)\.com\/\w+\/status\/(\d+)/)?.[2]
      if (tweetId) {
        return <Tweet id={tweetId} />
      }
    }

    if (type === 'link' || type === 'tweet') {
      return (
        <a
          href={url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="block group"
        >
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
              {description}
            </p>
          )}
          <div className="flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
            <span className="truncate">{url}</span>
            <ExternalLink className={SMALL_ICON_SIZE} />
          </div>
        </a>
      )
    }

    if (type === 'image' && image_path) {
      const { data: { publicUrl } } = supabase.storage
        .from('items')
        .getPublicUrl(image_path)

      return (
        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={publicUrl}
            alt={title || 'Image'}
            className="object-cover w-full h-full"
          />
        </div>
      )
    }

    return null
  }

  const isList = variant === 'list'

  // Consistent label rendering - all icons are h-4.5 w-4.5 (18px) with thick strokes
  const renderLabels = () => (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Type icon */}
      <div
        className={cn('flex items-center justify-center px-2 py-1 rounded-md', typeColor)}
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
          <Tag className={BADGE_ICON_SIZE} strokeWidth={BADGE_ICON_STROKE_WIDTH} />
          <span>{tag.name}</span>
        </div>
      ))}
    </div>
  )

  // List view
  if (isList) {
    return (
      <>
        <Card className="group transition-all hover:shadow-md">
          <div className="flex items-center gap-3 px-3 py-2">
            {/* Labels */}
            <div className="flex-shrink-0">
              {renderLabels()}
            </div>

            {/* Title/content */}
            <div className="flex-1 min-w-0">
              {title && type !== 'tweet' ? (
                <h3 className="font-medium text-sm truncate">
                  {type === 'link' && url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors"
                    >
                      {title}
                    </a>
                  ) : (
                    title
                  )}
                </h3>
              ) : (description || content) ? (
                <p className="text-sm text-muted-foreground truncate">
                  {description || content}
                </p>
              ) : (
                <span className="text-sm text-muted-foreground italic">No title</span>
              )}
            </div>

            {/* Date */}
            <time dateTime={created_at} className="text-xs text-muted-foreground flex-shrink-0 whitespace-nowrap">
              {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
            </time>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <MoreVertical className={DROPDOWN_ICON_SIZE} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                  <FileEdit className={`mr-2 ${BADGE_ICON_SIZE}`} />
                  Edit
                </DropdownMenuItem>
                {status !== 'done' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('done')}>
                    <Check className={`mr-2 ${BADGE_ICON_SIZE}`} />
                    Mark as Done
                  </DropdownMenuItem>
                )}
                {status !== 'inbox' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('inbox')}>
                    <Check className={`mr-2 ${BADGE_ICON_SIZE}`} />
                    Move to Inbox
                  </DropdownMenuItem>
                )}
                {status !== 'archived' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('archived')}>
                    <Archive className={`mr-2 ${BADGE_ICON_SIZE}`} />
                    Archive
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className={`mr-2 ${BADGE_ICON_SIZE}`} />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>

        <EditItemDialog
          item={item}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onItemUpdated={onItemUpdated || (() => {})}
        />
      </>
    )
  }

  // Card view (masonry/grid)
  return (
    <>
      <Card className="group overflow-hidden transition-all hover:shadow-md">
        <CardContent className="p-4">
          {/* Header - labels and menu */}
          <div className="flex items-start justify-between mb-3">
            {renderLabels()}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className={DROPDOWN_ICON_SIZE} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                  <FileEdit className={`mr-2 ${BADGE_ICON_SIZE}`} />
                  Edit
                </DropdownMenuItem>
                {status !== 'done' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('done')}>
                    <Check className={`mr-2 ${BADGE_ICON_SIZE}`} />
                    Mark as Done
                  </DropdownMenuItem>
                )}
                {status !== 'inbox' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('inbox')}>
                    <Check className={`mr-2 ${BADGE_ICON_SIZE}`} />
                    Move to Inbox
                  </DropdownMenuItem>
                )}
                {status !== 'archived' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('archived')}>
                    <Archive className={`mr-2 ${BADGE_ICON_SIZE}`} />
                    Archive
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className={`mr-2 ${BADGE_ICON_SIZE}`} />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Title */}
          {title && type !== 'tweet' && (
            <h3 className="font-semibold mb-2 line-clamp-2">
              {type === 'link' && url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  {title}
                </a>
              ) : (
                title
              )}
            </h3>
          )}

          {/* Content */}
          {renderContent()}

          {/* Footer - date */}
          <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
            <time dateTime={created_at}>
              {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
            </time>
          </div>
        </CardContent>
      </Card>

      <EditItemDialog
        item={item}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onItemUpdated={onItemUpdated || (() => {})}
      />
    </>
  )
}
