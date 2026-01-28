'use client'

import { cn } from '@/lib/utils'
import { Tweet } from 'react-tweet'
import { createClient } from '@/lib/supabase/client'
import { ContentType } from '@/types/database'
import { TEXT_SM, TEXT_MUTED, DESCRIPTION_LINE_CLAMP } from '@/lib/text-style-constants'
import { SMALL_ICON_SIZE } from '@/lib/type-icons'
import { NOTE_TYPE, TWEET_TYPE, IMAGE_TYPE, LINK_TYPE } from '@/lib/type-icons'

interface ItemCardContentProps {
  type: ContentType
  url: string | null
  description: string | null
  content: string | null
  image_path: string | null
}

export function ItemCardContent({ type, url, description, content, image_path }: ItemCardContentProps) {
  const supabase = createClient()

  // Note content
  if (type === NOTE_TYPE) {
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    )
  }

  // Tweet embed
  if (type === TWEET_TYPE && url) {
    const tweetId = url.match(/(twitter|x)\.com\/\w+\/status\/(\d+)/)?.[2]
    if (tweetId) {
      return <Tweet id={tweetId} />
    }
  }

  // Link or tweet URL
  if (type === LINK_TYPE || type === TWEET_TYPE) {
    return (
      <a
        href={url || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        {description && (
          <p className={cn(TEXT_SM, TEXT_MUTED, DESCRIPTION_LINE_CLAMP, 'mb-3')}>
            {description}
          </p>
        )}
        <div className="flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
          <span className="truncate">{url}</span>
          <svg className={SMALL_ICON_SIZE} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      </a>
    )
  }

  // Image
  if (type === IMAGE_TYPE && image_path) {
    const { data: { publicUrl } } = supabase.storage
      .from('items')
      .getPublicUrl(image_path)

    return (
      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={publicUrl}
          alt="Image"
          className="object-cover w-full h-full"
        />
      </div>
    )
  }

  return null
}
