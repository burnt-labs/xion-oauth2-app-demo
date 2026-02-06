export interface TokenInfo {
  accessToken: string
  expiresIn: number
  expiration: number
  tokenType?: string
  refreshToken?: string
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

export interface Authenticator {
  id: string
  type: string
  index: number
  data: Record<string, unknown>
}

export interface Balance {
  amount: string
  denom: string
  microAmount: string
}

export interface MeResponse {
  id: string
  authenticators: Authenticator[]
  balances: {
    xion: Balance
    usdc: Balance
  }
}
