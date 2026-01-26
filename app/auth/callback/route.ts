import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Get the correct URL for redirect
      const headersList = await headers()
      const host = headersList.get('host') || headersList.get('x-forwarded-host')
      const protocol = headersList.get('x-forwarded-proto') || 'https'

      // Build the URL from the actual host
      const baseUrl = `${protocol}://${host}`

      // If this is a password reset flow, redirect to update-password
      if (type === 'recovery') {
        return NextResponse.redirect(`${baseUrl}/update-password`)
      }

      return NextResponse.redirect(`${baseUrl}${next}`)
    }
  }

  // Return the user to an error page with instructions
  const { origin } = new URL(request.url)
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
