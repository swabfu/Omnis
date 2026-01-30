'use client'

import { Header } from './header'
import { useContext } from 'react'
import { SearchContext } from '@/lib/context/search-context'

/**
 * Header component that integrates with SearchContext.
 *
 * When used within SearchProvider, shows full search functionality.
 * When used without SearchProvider, shows disabled search input.
 */
export function SearchHeader() {
  const search = useContext(SearchContext)

  if (!search) {
    // No SearchProvider - render Header without search props
    return <Header />
  }

  return (
    <Header
      onSearchResults={search.setSearchResults}
      onSearchClear={search.clearSearch}
      isSearching={search.isSearching}
    />
  )
}
