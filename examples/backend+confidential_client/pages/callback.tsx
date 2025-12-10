import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { saveTokenInfo } from '@/lib/utils/oauth'
import { Button } from '@/components/ui/Button'
import type { TokenInfo } from '@/types'

export default function Callback() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const handleCallback = () => {
      const { token, error: errorParam, error_description } = router.query

      if (errorParam) {
        setError(
          `Authorization error: ${errorParam}${
            error_description ? ` - ${error_description}` : ''
          }`
        )
        setIsLoading(false)
        return
      }

      if (!token) {
        setError('No token received')
        setIsLoading(false)
        return
      }

      try {
        // Decode and parse token data
        const tokenData = JSON.parse(decodeURIComponent(token as string))
        const tokenInfo: TokenInfo = {
          accessToken: tokenData.access_token,
          expiresIn: tokenData.expires_in || 3600,
          expiration: tokenData.expiration || Date.now() + 3600 * 1000,
          tokenType: tokenData.token_type,
        }

        // Save token to localStorage
        saveTokenInfo(tokenInfo)

        // Redirect to dashboard
        router.push('/dashboard')
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to process callback'
        )
        setIsLoading(false)
      }
    }

    if (router.isReady) {
      handleCallback()
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 text-lg text-muted-foreground">
            Processing authorization...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md space-y-4">
          <div className="rounded-md border border-destructive bg-destructive/10 p-4">
            <h2 className="mb-2 text-lg font-semibold text-destructive">
              Authorization Failed
            </h2>
            <p className="text-sm text-destructive">{error}</p>
          </div>
          <Button fullWidth onClick={() => router.push('/')}>
            Return to Login
          </Button>
        </div>
      </div>
    )
  }

  return null
}
