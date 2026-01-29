import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { SearchHeader } from '@/components/layout/search-header'

export interface AuthLayoutProps {
  children: React.ReactNode
}

/**
 * Shared layout for all authenticated pages.
 *
 * This layout:
 * - Checks authentication and redirects to /login if not authenticated
 * - Renders the shared Sidebar and Header (with search support)
 * - Provides the main content area with consistent styling
 *
 * Pages in the (auth) route group only need to render their content component.
 * For search functionality, wrap content with SearchProvider on specific pages.
 */
export default async function AuthenticatedLayout({ children }: AuthLayoutProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <SearchHeader />
        <div className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
