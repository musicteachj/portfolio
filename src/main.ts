// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Material Design Icons
import '@mdi/font/css/materialdesignicons.css'

// Custom styles
import './assets/main.css'

// Types
import type { ThemeDefinition } from 'vuetify'

// "Professional Navy" — light-first, developer-authentic palette.
// Accent blue (#2563EB) is reserved for primary CTAs and active states.
const lightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    primary: '#0F172A',
    secondary: '#334155',
    accent: '#2563EB',
    error: '#DC2626',
    info: '#2563EB',
    success: '#059669',
    warning: '#D97706',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    'surface-variant': '#F1F5F9',
    'on-surface-variant': '#475569',
  },
  variables: {
    'border-color': '#0F172A',
    'border-opacity': 0.1,
    'high-emphasis-opacity': 0.9,
    'medium-emphasis-opacity': 0.62,
    'theme-border': '#E2E8F0',
    'theme-on-surface-muted': '#64748B',
  },
}

const darkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    accent: '#3B82F6',
    error: '#EF4444',
    info: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    background: '#0F172A',
    surface: '#1E293B',
    'surface-variant': '#273549',
    'on-surface-variant': '#CBD5E1',
  },
  variables: {
    'border-color': '#F8FAFC',
    'border-opacity': 0.12,
    'high-emphasis-opacity': 0.92,
    'medium-emphasis-opacity': 0.68,
    'theme-border': '#334155',
    'theme-on-surface-muted': '#94A3B8',
  },
}

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: lightTheme,
      dark: darkTheme,
    },
  },
  defaults: {
    VCard: { rounded: 'lg', elevation: 0 },
    VBtn: { rounded: 'lg' },
    VChip: { rounded: 'sm', variant: 'tonal' },
    VTextField: { variant: 'outlined', rounded: 'lg' },
    VTextarea: { variant: 'outlined', rounded: 'lg' },
    VAppBar: { elevation: 0 },
    VTimelineItem: { dotColor: 'primary' },
  },
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(vuetify)

app.mount('#app')
