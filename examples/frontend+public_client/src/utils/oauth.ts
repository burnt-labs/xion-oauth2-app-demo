import type { TokenInfo, OAuthServerInfo } from '@/types'

const STORAGE_KEY_TOKEN = 'xion_oauth_token'
const STORAGE_KEY_EXPIRATION = 'xion_oauth_expiration'
const STORAGE_KEY_CODE_VERIFIER = 'xion_oauth_code_verifier'
const STORAGE_KEY_STATE = 'xion_oauth_state'

export function getOAuthServerUrl(): string {
  return import.meta.env.VITE_XION_OAUTH2_SERVER_URL || 'http://localhost:8787'
}

export function getClientId(): string {
  return import.meta.env.VITE_XION_OAUTH2_CLIENT_ID || ''
}

export function getRedirectUri(): string {
  return `${window.location.origin}/callback`
}

export async function getOAuthServerInfo(): Promise<OAuthServerInfo> {
  const serverUrl = getOAuthServerUrl()
  const response = await fetch(
    `${serverUrl}/.well-known/oauth-authorization-server`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch OAuth server info')
  }
  return response.json()
}

export function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

export async function startAuthorization(): Promise<void> {
  const serverInfo = await getOAuthServerInfo()
  const clientId = getClientId()
  const redirectUri = getRedirectUri()

  if (!clientId) {
    throw new Error('Client ID is not configured')
  }

  // Generate PKCE code verifier and challenge for Public Client
  const codeVerifier = generateCodeVerifier()
  sessionStorage.setItem(STORAGE_KEY_CODE_VERIFIER, codeVerifier)

  const codeChallenge = await generateCodeChallenge(codeVerifier)

  // Generate state parameter for CSRF protection
  const state = generateCodeVerifier()
  sessionStorage.setItem(STORAGE_KEY_STATE, state)

  // Build authorization URL with PKCE parameters
  const authUrl = new URL(serverInfo.authorization_endpoint)
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('code_challenge', codeChallenge)
  authUrl.searchParams.set('code_challenge_method', 'S256')
  authUrl.searchParams.set('scope', 'xion:transactions:submit')
  authUrl.searchParams.set('state', state)

  window.location.href = authUrl.toString()
}

export async function exchangeCodeForToken(
  code: string,
  state?: string
): Promise<TokenInfo> {
  const serverInfo = await getOAuthServerInfo()
  const clientId = getClientId()
  const redirectUri = getRedirectUri()

  // Retrieve PKCE code verifier from session storage
  const codeVerifier = sessionStorage.getItem(STORAGE_KEY_CODE_VERIFIER)
  if (!codeVerifier) {
    throw new Error(
      'Code verifier not found. Please restart the authorization flow.'
    )
  }

  // Verify state parameter for CSRF protection (if provided)
  if (state) {
    const storedState = sessionStorage.getItem(STORAGE_KEY_STATE)
    if (!storedState || storedState !== state) {
      sessionStorage.removeItem(STORAGE_KEY_CODE_VERIFIER)
      sessionStorage.removeItem(STORAGE_KEY_STATE)
      throw new Error('Invalid state parameter. Possible CSRF attack.')
    }
  }

  // Exchange authorization code for access token using PKCE
  // Public Client: no client_secret required, uses code_verifier instead
  const response = await fetch(serverInfo.token_endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier, // PKCE: code verifier replaces client_secret for Public Clients
      client_id: clientId,
    }),
  })

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: 'Token exchange failed' }))
    sessionStorage.removeItem(STORAGE_KEY_CODE_VERIFIER)
    sessionStorage.removeItem(STORAGE_KEY_STATE)
    throw new Error(error.error || 'Token exchange failed')
  }

  const tokens = await response.json()
  const expiresIn = tokens.expires_in || 3600
  const expiration = Date.now() + expiresIn * 1000

  const tokenInfo: TokenInfo = {
    accessToken: tokens.access_token,
    expiresIn,
    expiration,
    tokenType: tokens.token_type,
  }

  saveTokenInfo(tokenInfo)

  // Clean up PKCE and state from session storage
  sessionStorage.removeItem(STORAGE_KEY_CODE_VERIFIER)
  sessionStorage.removeItem(STORAGE_KEY_STATE)

  return tokenInfo
}

export function saveTokenInfo(tokenInfo: TokenInfo): void {
  localStorage.setItem(STORAGE_KEY_TOKEN, tokenInfo.accessToken)
  localStorage.setItem(STORAGE_KEY_EXPIRATION, tokenInfo.expiration.toString())
}

export function getTokenInfo(): TokenInfo | null {
  const accessToken = localStorage.getItem(STORAGE_KEY_TOKEN)
  const expiration = localStorage.getItem(STORAGE_KEY_EXPIRATION)

  if (!accessToken || !expiration) {
    return null
  }

  const expirationTime = parseInt(expiration, 10)

  if (Date.now() >= expirationTime) {
    clearTokenInfo()
    return null
  }

  const expiresIn = Math.floor((expirationTime - Date.now()) / 1000)

  return {
    accessToken,
    expiration: expirationTime,
    expiresIn: expiresIn > 0 ? expiresIn : 0,
  }
}

export function clearTokenInfo(): void {
  localStorage.removeItem(STORAGE_KEY_TOKEN)
  localStorage.removeItem(STORAGE_KEY_EXPIRATION)
}

export function isAuthenticated(): boolean {
  return getTokenInfo() !== null
}
