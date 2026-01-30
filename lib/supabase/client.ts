import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'
import { env } from '@/lib/env'

export function createClient() {
  return createBrowserClient<Database>(
    env.supabaseUrl,
    env.supabaseAnonKey
  )
}
