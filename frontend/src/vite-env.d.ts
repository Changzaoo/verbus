/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL pública do backend em produção (ex.: https://verbus-api.nexusholding.xyz). Vazio em dev. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
