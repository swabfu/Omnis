/**
 * Environment variable validation and configuration.
 *
 * This module validates required environment variables when accessed.
 *
 * IMPORTANT: Must access process.env properties directly (not via dynamic lookup)
 * so Next.js can inline them at build time for client-side code.
 */

function getEnvVar(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Please check your .env.local file and ensure all required variables are set.`
    )
  }
  return value
}

/**
 * Environment variables with lazy validation.
 *
 * Access properties directly (not via brackets) so Next.js can inline
 * NEXT_PUBLIC_* vars at build time for client-side bundles.
 */
export const env = {
  get supabaseUrl() {
    return getEnvVar('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL)
  },
  get supabaseAnonKey() {
    return getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  },
}
