import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { ClientFeed } from '@/components/items/client-feed'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ItemStatus } from '@/types/database'

interface Props {
  params: Promise<{ status: string }>
}

export default async function StatusPage({ params }: Props) {
  const { status } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Validate status
  const validStatuses: ItemStatus[] = ['inbox', 'done', 'archived']
  if (!validStatuses.includes(status as ItemStatus)) {
    redirect('/')
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-7xl">
            <ClientFeed initialStatus={status as ItemStatus} />
          </div>
        </div>
      </main>
    </div>
  )
}
