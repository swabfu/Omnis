import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClientFeed } from '@/components/items/client-feed'

interface Props {
  params: Promise<{ id: string }>
}

/**
 * Tag page - displays items filtered by a specific tag.
 *
 * The layout (Sidebar + Header + auth check) is provided by the (auth) route group.
 */
export default async function TagPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // Get tag info
  const { data: tag } = await supabase
    .from('tags')
    .select('*')
    .eq('id', id)
    .single()

  if (!tag) {
    redirect('/')
  }

  return <ClientFeed initialTagId={id} initialTagName={tag.name} />
}
