/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONFIG_SERVICE_URL?: string
  readonly VITE_CATALOG_SERVICE_URL?: string
  // добавить больше переменных по необходимости
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
