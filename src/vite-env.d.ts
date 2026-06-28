/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL for the API, e.g. https://api.example.com. Defaults to "/api". */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
