'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Inbox, CheckCircle, Archive } from 'lucide-react'
import {
  typeIcons,
  typeColors,
  allItemsIcon,
  NAV_ICON_SIZE,
  NAV_ICON_STROKE_WIDTH,
} from '@/lib/type-icons'
import { statusColors } from '@/lib/status-icons'

const navItems = [
  { name: 'All Items', href: '/', icon: allItemsIcon, color: typeColors.all },
  { name: 'Links', href: '/type/link', icon: typeIcons.link, color: typeColors.link },
  { name: 'Tweets', href: '/type/tweet', icon: typeIcons.tweet, color: typeColors.tweet },
  { name: 'Images', href: '/type/image', icon: typeIcons.image, color: typeColors.image },
  { name: 'Notes', href: '/type/note', icon: typeIcons.note, color: typeColors.note },
]

const statusItems = [
  { name: 'Inbox', href: '/status/inbox', icon: Inbox, color: statusColors.inbox },
  { name: 'Done', href: '/status/done', icon: CheckCircle, color: statusColors.done },
  { name: 'Archived', href: '/status/archived', icon: Archive, color: statusColors.archived },
]

interface NavItemProps {
  href: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  color: string
  name: string
}

function NavItem({ href, icon: Icon, color, name }: NavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
      )}
    >
      <span className={cn('flex items-center justify-center', color)}>
        <Icon className={NAV_ICON_SIZE} strokeWidth={NAV_ICON_STROKE_WIDTH} />
      </span>
      {name}
    </Link>
  )
}

export function SidebarContentTypesNav() {
  return (
    <nav className="space-y-1">
      <p className="mb-2 px-3 text-xs font-semibold text-muted-foreground">
        Content Types
      </p>
      {navItems.map((item) => (
        <NavItem key={item.href} {...item} />
      ))}
    </nav>
  )
}

export function SidebarStatusNav() {
  return (
    <nav className="space-y-1">
      <p className="mb-2 px-3 text-xs font-semibold text-muted-foreground">
        Status
      </p>
      {statusItems.map((item) => (
        <NavItem key={item.href} {...item} />
      ))}
    </nav>
  )
}

export { navItems, statusItems }
