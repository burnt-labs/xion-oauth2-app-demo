import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { exchangeCodeForToken } from '@/utils/oauth'
import { Button } from './ui/Button'

export function Callback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const errorParam = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      if (errorParam) {
        setError(
          `Authorization error: ${errorParam}${errorDescription ? ` - ${errorDescription}` : ''}`
        )
        setIsLoading(false)
        return
      }

      if (!code) {
        setError('No authorization code received')
        setIsLoading(false)
        return
      }

      try {
        // Exchange authorization code for access token using PKCE
        // This is the Public Client flow - no client_secret needed
        await exchangeCodeForToken(code, state || undefined)
        navigate('/dashboard', { replace: true })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to exchange code for token')
        setIsLoading(false)
      }
    }

    handleCallback()
  }, [searchParams, navigate])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 text-lg text-muted-foreground">Processing authorization...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md space-y-4">
          <div className="rounded-md border border-destructive bg-destructive/10 p-4">
            <h2 className="mb-2 text-lg font-semibold text-destructive">Authorization Failed</h2>
            <p className="text-sm text-destructive">{error}</p>
          </div>
          <Button fullWidth onClick={() => navigate('/')}>
            Return to Login
          </Button>
        </div>
      </div>
    )
  }

  return null
}

