/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_GRAPHQL_URL: string
  // добавьте другие env переменные по необходимости
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
