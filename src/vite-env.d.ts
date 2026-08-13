/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_APP_TYPE?: string
  readonly VITE_SITE_URL?: string
  readonly VITE_ADMIN_PASSCODE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}