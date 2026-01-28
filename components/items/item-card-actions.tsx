'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Check, Archive, Trash2, FileEdit } from 'lucide-react'
import { ItemStatus } from '@/types/database'
import { BADGE_ICON_SIZE, DROPDOWN_ICON_SIZE, ICON_BUTTON_SIZE_MD } from '@/lib/type-icons'
import { INBOX_STATUS, DONE_STATUS, ARCHIVED_STATUS } from '@/lib/status-icons'

interface ItemCardActionsProps {
  status: ItemStatus
  onEdit: () => void
  onStatusChange: (status: ItemStatus) => void
  onDelete: () => void
  variant?: 'card' | 'list'
}

export function ItemCardActions({ status, onEdit, onStatusChange, onDelete, variant = 'card' }: ItemCardActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            ICON_BUTTON_SIZE_MD,
            'p-0',
            variant === 'card' && 'opacity-0 group-hover:opacity-100 transition-opacity'
          )}
        >
          <MoreVertical className={DROPDOWN_ICON_SIZE} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <FileEdit className={`mr-2 ${BADGE_ICON_SIZE}`} />
          Edit
        </DropdownMenuItem>
        {status !== DONE_STATUS && (
          <DropdownMenuItem onClick={() => onStatusChange('done')}>
            <Check className={`mr-2 ${BADGE_ICON_SIZE}`} />
            Mark as Done
          </DropdownMenuItem>
        )}
        {status !== INBOX_STATUS && (
          <DropdownMenuItem onClick={() => onStatusChange('inbox')}>
            <Check className={`mr-2 ${BADGE_ICON_SIZE}`} />
            Move to Inbox
          </DropdownMenuItem>
        )}
        {status !== ARCHIVED_STATUS && (
          <DropdownMenuItem onClick={() => onStatusChange('archived')}>
            <Archive className={`mr-2 ${BADGE_ICON_SIZE}`} />
            Archive
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onDelete} className="text-destructive">
          <Trash2 className={`mr-2 ${BADGE_ICON_SIZE}`} />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
