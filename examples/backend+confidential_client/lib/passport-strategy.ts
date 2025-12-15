import { Strategy as OAuth2Strategy } from 'passport-oauth2'
import type { StrategyOptions, VerifyCallback } from 'passport-oauth2'
import {
  getClientId,
  getClientSecret,
  getRedirectUri,
  getOAuthServerInfo,
} from './oauth-config'

/**
 * Creates an OAuth2 strategy for Passport.js
 * Note: This is a reference implementation. The current project uses direct fetch calls
 * instead of Passport.js for simplicity with Next.js API routes.
 */
export async function createOAuth2Strategy(): Promise<OAuth2Strategy> {
  const serverInfo = await getOAuthServerInfo()

  const options: StrategyOptions = {
    authorizationURL: serverInfo.authorization_endpoint,
    tokenURL: serverInfo.token_endpoint,
    clientID: getClientId(),
    clientSecret: getClientSecret(),
    callbackURL: getRedirectUri(),
    scope: 'xion:transactions:submit',
  }

  return new OAuth2Strategy(
    options,
    (
      accessToken: string,
      refreshToken: string,
      profile: unknown,
      done: VerifyCallback
    ) => {
      try {
        // Store token info in the user object
        const user = {
          accessToken,
          refreshToken,
          profile,
        }
        return done(null, user)
      } catch (error) {
        return done(error as Error, false)
      }
    }
  )
}
