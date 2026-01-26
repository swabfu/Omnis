import { ReactNode } from 'react'

interface MasonryGridProps {
  children: ReactNode
  columns?: number
}

export function MasonryGrid({ children, columns = 3 }: MasonryGridProps) {
  return (
    <div
      className="masonry-grid transition-opacity duration-200"
      style={{
        columnCount: columns,
        columnGap: '1rem',
      }}
    >
      {children}
    </div>
  )
}

export function MasonryItem({ children }: { children: ReactNode }) {
  return (
    <div style={{ breakInside: 'avoid', marginBottom: '1rem' }}>
      {children}
    </div>
  )
}
