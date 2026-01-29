import { redirect } from 'next/navigation'
import { ClientFeed } from '@/components/items/client-feed'
import { ContentType } from '@/types/database'

interface Props {
  params: Promise<{ type: string }>
}

/**
 * Type page - displays items filtered by content type (link, tweet, image, note).
 *
 * The layout (Sidebar + Header + auth check) is provided by the (auth) route group.
 */
export default async function TypePage({ params }: Props) {
  const { type } = await params

  // Validate type
  const validTypes: ContentType[] = ['link', 'tweet', 'image', 'note']
  if (!validTypes.includes(type as ContentType)) {
    redirect('/')
  }

  return <ClientFeed initialType={type as ContentType} />
}
