/// <reference path="../.astro/types.d.ts" />

// Side-effect font imports have no .d.ts shipped upstream
declare module '@fontsource-variable/inter'
declare module '@fontsource-variable/inter-tight'
declare module '@fontsource/ibm-plex-mono'

interface ImportMetaEnv {
  readonly PUBLIC_CF_BEACON_TOKEN?: string
  readonly PUBLIC_WEB3FORMS_KEY?: string
  readonly PUBLIC_GA4_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
