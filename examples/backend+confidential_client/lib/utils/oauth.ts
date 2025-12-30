import type { TokenInfo, OAuthServerInfo } from '@/types'

const STORAGE_KEY_TOKEN = 'xion_oauth_token'
const STORAGE_KEY_EXPIRATION = 'xion_oauth_expiration'

export function getOAuthServerUrl(): string {
  return (
    process.env.NEXT_PUBLIC_XION_OAUTH2_SERVER_URL ||
    'https://oauth2.testnet.burnt.com/'
  )
}

export function getRedirectUri(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/callback`
  }
  return ''
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

export function saveTokenInfo(tokenInfo: TokenInfo): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY_TOKEN, tokenInfo.accessToken)
  localStorage.setItem(STORAGE_KEY_EXPIRATION, tokenInfo.expiration.toString())
}

export function getTokenInfo(): TokenInfo | null {
  if (typeof window === 'undefined') return null

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
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY_TOKEN)
  localStorage.removeItem(STORAGE_KEY_EXPIRATION)
}

export function isAuthenticated(): boolean {
  return getTokenInfo() !== null
}
