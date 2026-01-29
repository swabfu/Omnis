import { redirect } from 'next/navigation'
import { ClientFeed } from '@/components/items/client-feed'
import { ItemStatus } from '@/types/database'

interface Props {
  params: Promise<{ status: string }>
}

/**
 * Status page - displays items filtered by status (inbox, done, archived).
 *
 * The layout (Sidebar + Header + auth check) is provided by the (auth) route group.
 */
export default async function StatusPage({ params }: Props) {
  const { status } = await params

  // Validate status
  const validStatuses: ItemStatus[] = ['inbox', 'done', 'archived']
  if (!validStatuses.includes(status as ItemStatus)) {
    redirect('/')
  }

  return <ClientFeed initialStatus={status as ItemStatus} />
}
