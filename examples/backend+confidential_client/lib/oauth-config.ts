export function getOAuthServerUrl(): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_XION_OAUTH2_SERVER_URL || 'http://localhost:8787'
  // check if baseUrl is a valid URL
  try {
    new URL(baseUrl)
  } catch (error) {
    throw new Error('Invalid OAuth server URL')
  }
  return baseUrl
}

export function getAppBaseUrl(req?: {
  headers: {
    host?: string
    'x-forwarded-proto'?: string
    'x-forwarded-host'?: string
  }
}): string {
  // Client-side: use window.location.origin
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  // Server-side: try to get from request headers first
  if (req?.headers?.host) {
    // Determine protocol from headers (support common proxy headers)
    const forwardedProto = req.headers['x-forwarded-proto']
    const protocol = forwardedProto?.split(',')[0]?.trim() || 'http'
    // Use x-forwarded-host if available, otherwise use host
    const host =
      req.headers['x-forwarded-host']?.split(',')[0]?.trim() || req.headers.host
    const baseUrl = `${protocol}://${host}`
    try {
      new URL(baseUrl)
      return baseUrl
    } catch (error) {
      console.error('Invalid App URL from request headers', error)
    }
  }

  // Fallback: use environment variables
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''

  // check if baseUrl is a valid URL
  try {
    new URL(baseUrl)
  } catch (error) {
    throw new Error('Invalid App URL')
  }
  if (baseUrl.endsWith('/')) {
    return baseUrl.slice(0, -1)
  } else {
    return baseUrl
  }
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

export function getRedirectUri(req?: {
  headers: {
    host?: string
    'x-forwarded-proto'?: string
    'x-forwarded-host'?: string
  }
}): string {
  const appUrl = getAppBaseUrl(req)
  return `${appUrl}/api/auth/callback`
}

export async function getOAuthServerInfo(): Promise<{
  issuer: string
  authorization_endpoint: string
  token_endpoint: string
  scopes_supported?: string[]
}> {
  const serverUrl = getOAuthServerUrl()
  const serverInfoUrl = `${serverUrl}/.well-known/oauth-authorization-server`
  const response = await fetch(serverInfoUrl)
  if (!response.ok) {
    throw new Error('Failed to fetch OAuth server info')
  }
  return response.json()
}
