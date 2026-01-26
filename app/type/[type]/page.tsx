import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { ClientFeed } from '@/components/items/client-feed'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ContentType } from '@/types/database'

interface Props {
  params: Promise<{ type: string }>
}

export default async function TypePage({ params }: Props) {
  const { type } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Validate type
  const validTypes: ContentType[] = ['link', 'tweet', 'image', 'note']
  if (!validTypes.includes(type as ContentType)) {
    redirect('/')
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-7xl">
            <ClientFeed initialType={type as ContentType} />
          </div>
        </div>
      </main>
    </div>
  )
}
