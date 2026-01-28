import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import { TagFeed } from './tag-feed'

interface Props {
  params: Promise<{ id: string }>
}

export default async function TagPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { id } = await params

  // Get tag info
  const { data: tag } = await supabase
    .from('tags')
    .select('*')
    .eq('id', id)
    .single()

  if (!tag) {
    redirect('/')
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <div className="flex items-center gap-2">
                <span className="text-2xl">#</span>
                <h1 className="text-3xl font-bold">{tag.name}</h1>
              </div>
              <p className="text-muted-foreground mt-1">
                Items tagged with &ldquo;{tag.name}&rdquo;
              </p>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
              <TagFeed tagId={id} />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  )
}
