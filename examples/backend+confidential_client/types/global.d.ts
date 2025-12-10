// Next.js environment variable type definitions

declare namespace NodeJS {
  interface ProcessEnv {
    // OAuth2 Server Configuration
    readonly XION_OAUTH2_SERVER_URL?: string

    // OAuth2 Client Configuration (Confidential Client)
    readonly XION_OAUTH2_CLIENT_ID?: string
    readonly XION_OAUTH2_CLIENT_SECRET?: string

    // Application URL (used for redirect URI)
    readonly NEXT_PUBLIC_APP_URL?: string

    // OAuth2 Server URL (accessible from client)
    readonly NEXT_PUBLIC_XION_OAUTH2_SERVER_URL?: string
  }
}
