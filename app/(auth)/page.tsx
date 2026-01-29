import { ClientFeed } from '@/components/items/client-feed'
import { SearchProvider } from '@/lib/context/search-context'

/**
 * Home page - displays all items with search functionality.
 *
 * Wrapped with SearchProvider to enable full-text search in the header.
 * The layout (Sidebar + Header) is provided by the parent (auth) route group layout.
 */
export default function HomePage() {
  return (
    <SearchProvider>
      <ClientFeed />
    </SearchProvider>
  )
}
