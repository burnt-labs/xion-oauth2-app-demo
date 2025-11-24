export interface TokenInfo {
  accessToken: string
  expiresIn: number
  expiration: number
  tokenType?: string
}

export interface OAuthServerInfo {
  issuer: string
  authorization_endpoint: string
  token_endpoint: string
  scopes_supported?: string[]
}

export interface ApiResponse<T = unknown> {
  success?: boolean
  message?: string
  error?: string
  data?: T
}
