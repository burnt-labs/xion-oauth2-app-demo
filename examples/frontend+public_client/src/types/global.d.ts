/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_XION_OAUTH2_SERVER_URL?: string
  readonly VITE_XION_OAUTH2_CLIENT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
