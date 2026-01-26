'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Link2,
  MessageSquare,
  Image as ImageIcon,
  FileText,
  Inbox,
  CheckCircle,
  Archive,
  Tag,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { AddItemDialog } from '@/components/items/add-item-dialog'
import { Database } from '@/types/database'

type Tag = Database['public']['Tables']['tags']['Row']

const navItems = [
  { name: 'All Items', href: '/', icon: Inbox },
  { name: 'Links', href: '/type/link', icon: Link2 },
  { name: 'Tweets', href: '/type/tweet', icon: MessageSquare },
  { name: 'Images', href: '/type/image', icon: ImageIcon },
  { name: 'Notes', href: '/type/note', icon: FileText },
]

const statusItems = [
  { name: 'Inbox', href: '/status/inbox', icon: Inbox },
  { name: 'Done', href: '/status/done', icon: CheckCircle },
  { name: 'Archived', href: '/status/archived', icon: Archive },
]

export function Sidebar() {
  const pathname = usePathname()
  const [tags, setTags] = useState<Tag[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    const { data } = await supabase
      .from('tags')
      .select('*')
      .order('name')

    if (data) {
      setTags(data)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      {/* Header */}
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-lg font-bold text-primary-foreground">O</span>
        </div>
        <span className="text-lg font-semibold">Omnis</span>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        {/* Add Button */}
        <AddItemDialog />

        <Separator className="my-4" />

        {/* Navigation */}
        <nav className="space-y-1">
          <p className="mb-2 px-3 text-xs font-semibold text-muted-foreground">
            Content Types
          </p>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <Separator className="my-4" />

        {/* Status Filters */}
        <nav className="space-y-1">
          <p className="mb-2 px-3 text-xs font-semibold text-muted-foreground">
            Status
          </p>
          {statusItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <Separator className="my-4" />

        {/* Tags */}
        <nav className="space-y-1">
          <div className="flex items-center justify-between px-3">
            <p className="text-xs font-semibold text-muted-foreground">Tags</p>
            <Badge variant="secondary" className="text-xs">
              {tags.length}
            </Badge>
          </div>
          {tags.length > 0 ? (
            <div className="space-y-1">
              {tags.slice(0, 8).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.id}`}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors',
                    pathname === `/tag/${tag.id}`
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                  )}
                >
                  <Tag className="h-3 w-3" />
                  <span className="truncate">{tag.name}</span>
                </Link>
              ))}
              {tags.length > 8 && (
                <Link
                  href="/tags"
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent/50"
                >
                  View all {tags.length} tags
                </Link>
              )}
            </div>
          ) : (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              No tags yet
            </p>
          )}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
