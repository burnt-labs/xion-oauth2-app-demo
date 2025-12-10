import type { NextApiRequest, NextApiResponse } from 'next'
import {
  getOAuthServerInfo,
  getClientId,
  getRedirectUri,
} from '@/lib/oauth-config'

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
    const redirectUri = getRedirectUri()

    // Generate state parameter for CSRF protection
    const state = generateRandomString()

    // Store state in a cookie (in production, use httpOnly, secure cookies)
    res.setHeader(
      'Set-Cookie',
      `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`
    )

    // Build authorization URL
    const authUrl = new URL(serverInfo.authorization_endpoint)
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', 'xion:transactions:submit')
    authUrl.searchParams.set('state', state)

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
