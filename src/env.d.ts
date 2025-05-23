/// <reference types="vite/client" />

// Vue single file component declarations
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Vuetify declarations
declare module 'vuetify/components' {
  const components: any
  export = components
}

declare module 'vuetify/directives' {
  const directives: any
  export = directives
}

// Environment variable declarations
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_URL: string
  readonly VITE_CONTACT_EMAIL: string
  readonly BASE_URL: string
  readonly MODE: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
