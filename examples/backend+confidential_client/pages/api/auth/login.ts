import type { NextApiRequest, NextApiResponse } from 'next'
import {
  getOAuthServerInfo,
  getClientId,
  getRedirectUri,
} from '@/lib/oauth-config'
import { createHash } from 'crypto'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const serverInfo = await getOAuthServerInfo()
    const clientId = getClientId()
    const redirectUri = getRedirectUri(req)

    // Generate state parameter for CSRF protection
    const state = generateRandomString()

    // Check if PKCE should be used (when code_challenge is sent)
    const usePkce = false // Set to true when uncommenting code_challenge lines below

    // Generate PKCE code verifier and challenge only if PKCE is used
    let codeVerifier: string | undefined
    let codeChallenge: string | undefined
    if (usePkce) {
      codeVerifier = generateCodeVerifier()
      codeChallenge = generateCodeChallenge(codeVerifier)
    }

    // Store state and PKCE verifier in cookies (in production, use httpOnly, secure cookies)
    const cookies = [
      `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
    ]
    if (codeVerifier) {
      cookies.push(
        `oauth_code_verifier=${codeVerifier}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`
      )
      cookies.push(
        `oauth_use_pkce=true; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`
      )
    }
    res.setHeader('Set-Cookie', cookies)

    // Build authorization URL with PKCE parameters
    const authUrl = new URL(serverInfo.authorization_endpoint)
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', 'xion:transactions:submit')
    authUrl.searchParams.set('state', state)
    if (usePkce && codeChallenge) {
      authUrl.searchParams.set('code_challenge', codeChallenge)
      authUrl.searchParams.set('code_challenge_method', 'S256')
    }

    res.redirect(authUrl.toString())
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : 'Failed to start authorization',
    })
  }
}

function generateRandomString(): string {
  const array = new Uint8Array(32)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }
  return Buffer.from(array)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

function generateCodeVerifier(): string {
  return generateRandomString()
}

function generateCodeChallenge(verifier: string): string {
  const hash = createHash('sha256').update(verifier).digest('base64')
  return hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}
