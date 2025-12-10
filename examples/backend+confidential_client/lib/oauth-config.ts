export function getOAuthServerUrl(): string {
  return process.env.XION_OAUTH2_SERVER_URL || 'http://localhost:8787'
}

export function getClientId(): string {
  const clientId = process.env.XION_OAUTH2_CLIENT_ID
  if (!clientId) {
    throw new Error('XION_OAUTH2_CLIENT_ID is not configured')
  }
  return clientId
}

export function getClientSecret(): string {
  const clientSecret = process.env.XION_OAUTH2_CLIENT_SECRET
  if (!clientSecret) {
    throw new Error('XION_OAUTH2_CLIENT_SECRET is not configured')
  }
  return clientSecret
}

export function getRedirectUri(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003'
  return `${appUrl}/api/auth/callback`
}

export async function getOAuthServerInfo(): Promise<{
  issuer: string
  authorization_endpoint: string
  token_endpoint: string
  scopes_supported?: string[]
}> {
  const serverUrl = getOAuthServerUrl()
  const response = await fetch(
    `${serverUrl}/.well-known/oauth-authorization-server`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch OAuth server info')
  }
  return response.json()
}
