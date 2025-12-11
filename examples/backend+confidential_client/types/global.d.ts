// Next.js environment variable type definitions

declare namespace NodeJS {
  interface ProcessEnv {
    // OAuth2 Client Configuration (Confidential Client)
    readonly XION_OAUTH2_CLIENT_ID?: string
    readonly XION_OAUTH2_CLIENT_SECRET?: string

    // OAuth2 Server URL (accessible from client)
    readonly NEXT_PUBLIC_XION_OAUTH2_SERVER_URL?: string
  }
}
