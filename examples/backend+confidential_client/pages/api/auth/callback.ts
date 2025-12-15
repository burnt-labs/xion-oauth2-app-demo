import type { NextApiRequest, NextApiResponse } from 'next'
import {
  getOAuthServerInfo,
  getClientId,
  getClientSecret,
  getRedirectUri,
} from '@/lib/oauth-config'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { code, state, error, error_description } = req.query

  // Handle OAuth errors
  if (error) {
    return res.redirect(
      `/?error=${encodeURIComponent(
        error as string
      )}&error_description=${encodeURIComponent(
        (error_description as string) || ''
      )}`
    )
  }

  if (!code) {
    return res.redirect('/?error=no_code')
  }

  // Verify state parameter
  const storedState = req.cookies.oauth_state
  if (!storedState || storedState !== state) {
    res.setHeader('Set-Cookie', [
      'oauth_state=; Path=/; Max-Age=0',
      'oauth_code_verifier=; Path=/; Max-Age=0',
      'oauth_use_pkce=; Path=/; Max-Age=0',
    ])
    return res.redirect('/?error=invalid_state')
  }

  // Check if PKCE was used in the authorization request
  const usePkce = req.cookies.oauth_use_pkce === 'true'
  // Retrieve PKCE code verifier only if PKCE was used
  const codeVerifier = usePkce ? req.cookies.oauth_code_verifier : undefined

  try {
    const serverInfo = await getOAuthServerInfo()
    const clientId = getClientId()
    const clientSecret = getClientSecret()
    const redirectUri = getRedirectUri(req)

    // Prepare token request parameters
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code as string,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    })

    // Include PKCE code_verifier only if PKCE was used in authorization request
    if (usePkce && codeVerifier) {
      params.set('code_verifier', codeVerifier)
    }

    // Exchange authorization code for access token using Confidential Client flow
    // Using client_id and client_secret as form parameters (OAuth2 standard)
    const tokenResponse = await fetch(serverInfo.token_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse
        .json()
        .catch(() => ({ error: 'Token exchange failed' }))
      const errorMessage = errorData.error
        ? `[${errorData.error}] ${errorData.error_description}`
        : 'Token exchange failed'
      throw new Error(errorMessage)
    }

    const tokens = await tokenResponse.json()
    const expiresIn = tokens.expires_in || 3600
    const expiration = Date.now() + expiresIn * 1000

    // Clear state and PKCE cookies
    res.setHeader('Set-Cookie', [
      'oauth_state=; Path=/; Max-Age=0',
      'oauth_code_verifier=; Path=/; Max-Age=0',
      'oauth_use_pkce=; Path=/; Max-Age=0',
    ])

    // Redirect to callback page with token info in URL hash (client-side will handle storage)
    // Using hash instead of query to avoid exposing token in server logs
    const tokenData = encodeURIComponent(
      JSON.stringify({
        access_token: tokens.access_token,
        expires_in: expiresIn,
        expiration,
        token_type: tokens.token_type || 'Bearer',
      })
    )
    res.redirect(`/callback?token=${tokenData}`)
  } catch (error) {
    console.error('Callback error:', error)
    res.setHeader('Set-Cookie', [
      'oauth_state=; Path=/; Max-Age=0',
      'oauth_code_verifier=; Path=/; Max-Age=0',
      'oauth_use_pkce=; Path=/; Max-Age=0',
    ])
    res.redirect(
      `/?error=${encodeURIComponent(
        error instanceof Error ? error.message : 'Token exchange failed'
      )}`
    )
  }
}
