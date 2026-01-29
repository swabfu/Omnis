/**
 * Global URL configuration for the Omnis application.
 * This is the ONE source of truth for all app URLs used in redirects,
 * authentication flows, and external links.
 */

/**
 * Get the base URL for the application.
 * Uses NEXT_PUBLIC_APP_URL env var if set, otherwise falls back to window.location.origin.
 * Returns localhost:3000 as fallback when neither is available (e.g., SSR).
 */
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || (
  typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
)

/**
 * Get the password reset redirect URL.
 * This URL is used in the password reset email sent by Supabase.
 */
export function getResetPasswordUrl(): string {
  return `${APP_URL}/update-password`
}

/**
 * Get the email confirmation redirect URL.
 * This URL is used after a user confirms their email.
 */
export function getEmailConfirmationUrl(): string {
  return `${APP_URL}/`
}

/**
 * Get the auth callback URL.
 * This URL is used by Supabase OAuth providers to redirect back to the app.
 */
export function getAuthCallbackUrl(): string {
  return `${APP_URL}/auth/callback`
}
