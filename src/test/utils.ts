import { mount, VueWrapper } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createPinia, setActivePinia } from 'pinia'
import type { Component } from 'vue'
import type { Project } from '@/types'
import { vi } from 'vitest'

/**
 * Creates a Vuetify instance for testing
 */
export function createVuetifyForTesting() {
  return createVuetify({
    components,
    directives,
  })
}

/**
 * Creates a Pinia instance for testing
 */
export function createPiniaForTesting() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

/**
 * Creates a mock router instance for testing
 */
export function createMockRouter() {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    currentRoute: { value: { path: '/', name: 'home' } },
    resolve: vi.fn(),
    addRoute: vi.fn(),
    removeRoute: vi.fn(),
    hasRoute: vi.fn(),
    getRoutes: vi.fn(),
    beforeEach: vi.fn(),
    beforeResolve: vi.fn(),
    afterEach: vi.fn(),
    onError: vi.fn(),
    isReady: vi.fn().mockResolvedValue(true),
    install: vi.fn(),
  }
}

/**
 * Mount a component with all necessary plugins for testing
 */
export function mountComponent(
  component: Component,
  options: {
    props?: Record<string, any>
    slots?: Record<string, any>
    global?: {
      plugins?: any[]
      mocks?: Record<string, any>
      stubs?: Record<string, any>
    }
  } = {},
): VueWrapper {
  const vuetify = createVuetifyForTesting()
  const pinia = createPiniaForTesting()
  const mockRouter = createMockRouter()

  const defaultGlobal = {
    plugins: [vuetify, pinia],
    mocks: {
      $router: mockRouter,
      $route: { path: '/', name: 'home', params: {}, query: {} },
    },
    stubs: {},
  }

  const mergedOptions = {
    ...options,
    global: {
      ...defaultGlobal,
      ...options.global,
      plugins: [...defaultGlobal.plugins, ...(options.global?.plugins || [])],
      mocks: {
        ...defaultGlobal.mocks,
        ...options.global?.mocks,
      },
    },
  }

  return mount(component, mergedOptions)
}

/**
 * Helper to wait for Vue's nextTick and any pending promises
 */
export async function flushPromises(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0)
  })
}

/**
 * Mock project data for testing
 */
export const mockProject: Project = {
  id: 1,
  title: 'Test Project',
  description: 'A test project for unit testing',
  longDescription: 'A longer description of the test project for unit testing purposes',
  image: 'https://via.placeholder.com/300x200',
  technologies: ['Vue.js', 'TypeScript', 'Vitest'],
  liveUrl: 'https://example.com',
  githubUrl: 'https://github.com/test/test-project',
  featured: true,
  category: 'Frontend',
  year: 2025,
  status: 'completed',
  features: ['Feature 1', 'Feature 2', 'Feature 3'],
  viewport: ['desktop', 'mobile'],
}

/**
 * Mock projects array for testing
 */
export const mockProjects: Project[] = [
  mockProject,
  {
    ...mockProject,
    id: 2,
    title: 'Test Project 2',
    category: 'Full Stack',
    status: 'in-progress',
  },
]
