'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { ItemWithTags } from '@/components/items/feed'

interface SearchContextType {
  searchResults: ItemWithTags[] | null
  isSearching: boolean
  setSearchResults: (results: ItemWithTags[] | null) => void
  setIsSearching: (searching: boolean) => void
  clearSearch: () => void
}

export const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchResults, setSearchResults] = useState<ItemWithTags[] | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const clearSearch = useCallback(() => {
    setSearchResults(null)
    setIsSearching(false)
  }, [])

  return (
    <SearchContext.Provider
      value={{ searchResults, isSearching, setSearchResults, setIsSearching, clearSearch }}
    >
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider')
  }
  return context
}
