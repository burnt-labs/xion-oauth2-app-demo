import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Button } from './ui/Button'

export function Login() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check for error in query params
    const { error: errorParam, error_description } = router.query
    if (errorParam) {
      setError(
        `Authorization error: ${errorParam}${
          error_description ? ` - ${error_description}` : ''
        }`
      )
    }
  }, [router.query])

  const handleLogin = async () => {
    try {
      setIsLoading(true)
      setError('')
      // Redirect to backend login endpoint
      window.location.href = '/api/auth/login'
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to start authorization'
      )
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-[60px] sm:text-[90px] md:text-[120px] leading-[50px] sm:leading-[75px] md:leading-[96px] font-black text-foreground">
            XION OAUTH2 DEMO
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Sign in with OAuth2 to access Xion network features
          </p>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="rounded-md border border-destructive bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button
            fullWidth
            onClick={handleLogin}
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? 'Redirecting...' : 'Sign in with OAuth2'}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>This demo uses Confidential Client OAuth2 flow</p>
            <p className="mt-1">with server-side token exchange</p>
          </div>
        </div>
      </div>
    </div>
  )
}
