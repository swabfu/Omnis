'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ContentType, ItemStatus, Database } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { EditItemDialog } from './edit-item-dialog'
import { ItemCardActions } from './item-card-actions'
import { ItemCardContent } from './item-card-content'
import { ItemCardLabels } from './item-card-labels'
import { TITLE_LINE_CLAMP, TEXT_MUTED } from '@/lib/text-style-constants'
import { LINK_TYPE } from '@/lib/type-icons'

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

  const isList = variant === 'list'

  // List view
  if (isList) {
    return (
      <>
        <Card className="group transition-all hover:shadow-md">
          <div className="flex items-center gap-3 px-3 py-2">
            {/* Labels */}
            <div className="flex-shrink-0">
              <ItemCardLabels type={type} status={status} tags={tags} />
            </div>

            {/* Title/content */}
            <div className="flex-1 min-w-0">
              {title && type !== 'tweet' ? (
                <h3 className="font-medium text-sm truncate">
                  {type === LINK_TYPE && url ? (
                    <Link
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors"
                    >
                      {title}
                    </Link>
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
            <ItemCardActions
              status={status}
              onEdit={() => setEditDialogOpen(true)}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              variant="list"
            />
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
            <ItemCardLabels type={type} status={status} tags={tags} />
            <ItemCardActions
              status={status}
              onEdit={() => setEditDialogOpen(true)}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              variant="card"
            />
          </div>

          {/* Title */}
          {title && type !== 'tweet' && (
            <h3 className={cn('font-semibold mb-2', TITLE_LINE_CLAMP)}>
              {type === LINK_TYPE && url ? (
                <Link
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  {title}
                </Link>
              ) : (
                title
              )}
            </h3>
          )}

          {/* Content */}
          <ItemCardContent
            type={type}
            url={url}
            description={description}
            content={content}
            image_path={image_path}
          />

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
