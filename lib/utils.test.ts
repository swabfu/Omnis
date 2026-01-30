import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn (class name utility)', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('removes false values', () => {
    expect(cn('foo', false, 'bar', undefined, 'baz')).toBe('foo bar baz')
  })

  it('handles empty input', () => {
    expect(cn()).toBe('')
  })

  it('handles Tailwind conflict resolution', () => {
    // Tailwind merge should resolve conflicting classes
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})
