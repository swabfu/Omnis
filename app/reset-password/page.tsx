'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { BADGE_ICON_SIZE, SUCCESS_ICON_SIZE } from '@/lib/type-icons'
import { statusColors } from '@/lib/status-icons'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [debugInfo, setDebugInfo] = useState('')
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setDebugInfo('')

    try {
      setDebugInfo('Sending reset email...')
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })

      if (error) {
        setDebugInfo(`Error: ${error.message}`)
        setError(error.message)
      } else {
        setDebugInfo(`Success! Data: ${JSON.stringify(data)}`)
        setSuccess(true)
      }
    } catch (err) {
      setDebugInfo(`Exception: ${err}`)
      setError('An unexpected error occurred')
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We sent a password reset link to your email address.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle className={`${SUCCESS_ICON_SIZE} ${statusColors.done} mb-4`} />
              <p className="text-center text-muted-foreground">
                Click the link in the email to reset your password.
              </p>
            </div>
            <div className="mt-4 text-center text-sm">
              <a href="/login" className="text-primary hover:underline">
                Back to login
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Reset your password</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className={BADGE_ICON_SIZE} />
                {error}
              </div>
            )}
            {debugInfo && (
              <div className="p-2 bg-muted rounded text-xs text-muted-foreground">
                {debugInfo}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className={`mr-2 ${BADGE_ICON_SIZE} animate-spin`} /> : null}
              Send Reset Link
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <a href="/login" className="text-primary hover:underline">
              Back to login
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
