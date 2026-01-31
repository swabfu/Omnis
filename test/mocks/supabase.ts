import { vi } from 'vitest'

// Mock tag data
export const mockTags = [
  { id: '1', user_id: 'user-1', name: 'work', color: 'blue', sort_order: 0 },
  { id: '2', user_id: 'user-1', name: 'personal', color: 'green', sort_order: 1 },
  { id: '3', user_id: 'user-1', name: 'urgent', color: 'red', sort_order: 2 },
]

// Mock item data
export const mockItems = [
  {
    id: '1',
    user_id: 'user-1',
    type: 'link',
    title: 'Example Link',
    url: 'https://example.com',
    content: null,
    status: 'inbox',
    created_at: '2025-01-01T00:00:00Z',
    embedding: null,
    tags: [mockTags[0]],
  },
  {
    id: '2',
    user_id: 'user-1',
    type: 'note',
    title: null,
    url: null,
    content: 'Quick note',
    status: 'done',
    created_at: '2025-01-02T00:00:00Z',
    embedding: null,
    tags: [],
  },
]

// Mock Supabase client
export const mockSupabaseClient = {
  from: vi.fn((table: string) => {
    const data = table === 'tags' ? mockTags : table === 'items' ? mockItems : []
    return {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data, error: null })),
          in: vi.fn(() => Promise.resolve({ data, error: null })),
        })),
        order: vi.fn(() => Promise.resolve({ data, error: null })),
      })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test mock needs flexibility
      insert: vi.fn((item: any) => Promise.resolve({
        data: { ...item, id: 'new-id', created_at: new Date().toISOString() },
        error: null,
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: mockTags[0], error: null })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    }
  }),
  auth: {
    getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'user-1' } }, error: null })),
  },
}

// Helper to create a mock item with overrides
export function createMockItem(overrides: Partial<typeof mockItems[0]> = {}) {
  return {
    id: '1',
    user_id: 'user-1',
    type: 'link' as const,
    title: 'Example Link',
    url: 'https://example.com',
    content: null,
    status: 'inbox' as const,
    created_at: '2025-01-01T00:00:00Z',
    embedding: null,
    tags: [],
    ...overrides,
  }
}

// Helper to create mock tags with overrides
export function createMockTag(overrides: Partial<typeof mockTags[0]> = {}) {
  return {
    id: '1',
    user_id: 'user-1',
    name: 'test-tag',
    color: 'blue',
    sort_order: 0,
    ...overrides,
  }
}
