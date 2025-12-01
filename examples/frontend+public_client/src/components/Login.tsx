import { useState } from 'react'
import { Button } from './ui/Button'
import { startAuthorization } from '@/utils/oauth'

export function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    try {
      setIsLoading(true)
      setError('')
      await startAuthorization()
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
            <p>This demo uses standard OAuth2 authorization flow</p>
            <p className="mt-1">to authenticate and access Xion network APIs</p>
          </div>
        </div>
      </div>
    </div>
  )
}
