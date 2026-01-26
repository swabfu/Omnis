'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Link2,
  Image as ImageIcon,
  FileText,
  MessageSquare,
  MoreVertical,
  ExternalLink,
  Check,
  Archive,
  Trash2,
  FileEdit,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ContentType, ItemStatus, Database } from '@/types/database'
import { Tweet } from 'react-tweet'
import { createClient } from '@/lib/supabase/client'
import { EditItemDialog } from './edit-item-dialog'

type Item = Database['public']['Tables']['items']['Row']

interface Tag {
  id: string
  name: string
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
}

const typeIcons = {
  link: Link2,
  tweet: MessageSquare,
  image: ImageIcon,
  note: FileText,
}

const typeColors = {
  link: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  tweet: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
  image: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  note: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
}

const statusColors = {
  inbox: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  done: 'bg-green-500/10 text-green-500 border-green-500/20',
  archived: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
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
}: ItemCardProps) {
  const Icon = typeIcons[type]
  const supabase = createClient()
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  // Build item object for edit dialog
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
    // Note type
    if (type === 'note') {
      return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap">{content}</p>
        </div>
      )
    }

    // Tweet type
    if (type === 'tweet' && url) {
      const tweetId = url.match(/(twitter|x)\.com\/\w+\/status\/(\d+)/)?.[2]
      if (tweetId) {
        return <Tweet id={tweetId} />
      }
    }

    // Link type with OG data
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
            <ExternalLink className="ml-1 h-3 w-3 flex-shrink-0" />
          </div>
        </a>
      )
    }

    // Image type
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

  return (
    <>
      <Card className="group overflow-hidden transition-all hover:shadow-md">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-md ${typeColors[type].split(' ')[0]}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <Badge variant="outline" className={statusColors[status]}>
                {status}
              </Badge>
              {tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                  <FileEdit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                {status !== 'done' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('done')}>
                    <Check className="mr-2 h-4 w-4" />
                    Mark as Done
                  </DropdownMenuItem>
                )}
                {status !== 'inbox' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('inbox')}>
                    <Check className="mr-2 h-4 w-4" />
                    Move to Inbox
                  </DropdownMenuItem>
                )}
                {status !== 'archived' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('archived')}>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
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

          {/* Footer */}
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
