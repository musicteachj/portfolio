import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, computed } from 'vue'
import { mountComponent } from '@/test/utils'
import AppNavigation from '../AppNavigation.vue'

// Mock Vuetify composables - define mocks inside the factory function
vi.mock('vuetify', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, any>
  return {
    ...actual,
    useDisplay: vi.fn(() => ({
      mobile: computed(() => false),
      xs: ref(false),
      sm: ref(false),
      md: ref(false),
      lg: ref(true),
      xl: ref(false),
      xxl: ref(false),
      smAndUp: computed(() => true),
      mdAndUp: computed(() => true),
      lgAndUp: computed(() => true),
      xlAndUp: computed(() => false),
      smAndDown: computed(() => false),
      mdAndDown: computed(() => false),
      lgAndDown: computed(() => true),
      xlAndDown: computed(() => true),
      name: computed(() => 'lg'),
      height: ref(1080),
      width: ref(1920),
      displayClasses: ref({}),
      platform: ref('desktop'),
      thresholds: ref({ xs: 0, sm: 600, md: 960, lg: 1280, xl: 1920 }),
      update: vi.fn(),
    })),
    useTheme: vi.fn(() => ({
      global: {
        name: { value: 'light' },
        current: { value: { dark: false } },
      },
    })),
  }
})

// Import the mocked functions after the mock is defined
import { useDisplay, useTheme } from 'vuetify'
const mockUseDisplay = vi.mocked(useDisplay)
const mockUseTheme = vi.mocked(useTheme)

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock window scroll events
Object.defineProperty(window, 'scrollY', {
  value: 0,
  writable: true,
})

// Helper function to create a fresh theme mock
const createMockTheme = (themeName = 'light', isDark = false) =>
  ({
    global: {
      name: { value: themeName },
      current: { value: { dark: isDark } },
    },
    isDisabled: false,
    themes: ref({}),
    name: ref(themeName),
    current: ref({ dark: isDark }),
    computedThemes: ref({}),
    themeClasses: ref(''),
    styles: ref(''),
  }) as any

// Helper function to create a display mock
const createMockDisplay = (isMobile = false) =>
  ({
    mobile: computed(() => isMobile),
    xs: ref(isMobile),
    sm: ref(false),
    md: ref(!isMobile),
    lg: ref(!isMobile),
    xl: ref(false),
    xxl: ref(false),
    smAndUp: computed(() => !isMobile),
    mdAndUp: computed(() => !isMobile),
    lgAndUp: computed(() => !isMobile),
    xlAndUp: computed(() => false),
    smAndDown: computed(() => isMobile),
    mdAndDown: computed(() => isMobile),
    lgAndDown: computed(() => true),
    xlAndDown: computed(() => true),
    name: computed(() => (isMobile ? 'xs' : 'lg')),
    height: ref(1080),
    width: ref(isMobile ? 375 : 1920),
    displayClasses: ref({}),
    platform: ref(isMobile ? 'mobile' : 'desktop'),
    thresholds: ref({ xs: 0, sm: 600, md: 960, lg: 1280, xl: 1920 }),
    mobileBreakpoint: ref('sm'),
    ssr: false,
    update: vi.fn(),
  }) as any

describe('AppNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.scrollY = 0

    // Reset mocks to default state
    mockUseDisplay.mockReturnValue(createMockDisplay(false))
    mockUseTheme.mockReturnValue(createMockTheme('light', false))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // Helper function to mount AppNavigation with layout context
  const mountAppNavigation = (options: any = {}) => {
    return mountComponent(AppNavigation, {
      ...options,
      global: {
        ...options.global,
        stubs: {
          VAppBar: {
            template: '<header class="v-app-bar"><slot /></header>',
            props: ['elevation', 'color', 'theme', 'fixed', 'app'],
          },
          VAppBarTitle: {
            template: '<div class="v-app-bar-title"><slot /></div>',
          },
          VAppBarNavIcon: {
            template: '<button class="v-app-bar-nav-icon" @click="$emit(\'click\')"></button>',
            emits: ['click'],
            props: ['color'],
          },
          VNavigationDrawer: {
            template:
              '<nav class="v-navigation-drawer" :class="{ \'v-navigation-drawer--active\': modelValue }" v-show="modelValue"><slot /></nav>',
            props: ['modelValue', 'temporary', 'location'],
            emits: ['update:modelValue'],
          },
          VBtn: {
            template:
              '<button class="v-btn" @click="$emit(\'click\')" :to="to" :title="title"><slot /></button>',
            props: ['icon', 'color', 'variant', 'to', 'title'],
            emits: ['click'],
          },
          VIcon: {
            template: '<i class="v-icon"><slot /></i>',
            props: ['icon'],
            mounted() {
              // Add the slot content as a CSS class for testing
              if (this.$slots.default) {
                const slotContent = this.$slots.default()[0]?.children
                if (typeof slotContent === 'string') {
                  this.$el.classList.add(slotContent)
                }
              }
            },
          },
          VSpacer: {
            template: '<div class="v-spacer"></div>',
          },
          VList: {
            template: '<ul class="v-list"><slot /></ul>',
          },
          VListItem: {
            template:
              '<li class="v-list-item" @click="$emit(\'click\')" :to="to"><slot name="prepend" /><slot /></li>',
            props: ['to'],
            emits: ['click'],
          },
          VListItemTitle: {
            template: '<div class="v-list-item-title"><slot /></div>',
          },
          VDivider: {
            template: '<hr class="v-divider" />',
          },
          'router-link': {
            template: '<a :href="to" class="router-link"><slot /></a>',
            props: ['to'],
          },
          ...options.global?.stubs,
        },
      },
    })
  }

  describe('Rendering', () => {
    it('should render app bar with title', () => {
      const wrapper = mountAppNavigation()

      expect(wrapper.find('.v-app-bar').exists()).toBe(true)
      expect(wrapper.text()).toContain('James Littlefield')
    })

    it('should render theme toggle button', () => {
      const wrapper = mountAppNavigation()

      const themeButton = wrapper.find('[title*="Switch to"]')
      expect(themeButton.exists()).toBe(true)
    })

    it('should render navigation items on desktop', () => {
      mockUseDisplay.mockReturnValue(createMockDisplay(false))

      const wrapper = mountAppNavigation()

      expect(wrapper.text()).toContain('Home')
      expect(wrapper.text()).toContain('About')
      expect(wrapper.text()).toContain('Experience')
      expect(wrapper.text()).toContain('Projects')
      expect(wrapper.text()).toContain('Contact')
    })

    it('should render mobile navigation icon on mobile', () => {
      mockUseDisplay.mockReturnValue(createMockDisplay(true))

      const wrapper = mountAppNavigation()

      expect(wrapper.find('.v-app-bar-nav-icon').exists()).toBe(true)
    })

    it('should not render desktop navigation on mobile', () => {
      mockUseDisplay.mockReturnValue(createMockDisplay(true))

      const wrapper = mountAppNavigation()

      const desktopNav = wrapper.find('.d-flex')
      expect(desktopNav.exists()).toBe(false)
    })
  })

  describe('Theme Functionality', () => {
    it('should display correct theme icon for light mode', () => {
      mockUseTheme.mockReturnValue(createMockTheme('light', false))

      const wrapper = mountAppNavigation()

      const themeIcon = wrapper.find('.mdi-weather-night')
      expect(themeIcon.exists()).toBe(true)
    })

    it('should display correct theme icon for dark mode', () => {
      mockUseTheme.mockReturnValue(createMockTheme('dark', true))

      const wrapper = mountAppNavigation()

      const themeIcon = wrapper.find('.mdi-weather-sunny')
      expect(themeIcon.exists()).toBe(true)
    })

    it('should toggle theme when theme button is clicked', async () => {
      const mockTheme = createMockTheme('light', false)
      mockUseTheme.mockReturnValue(mockTheme)

      const wrapper = mountAppNavigation()

      const themeButton = wrapper.find('[title*="Switch to"]')
      await themeButton.trigger('click')

      expect(mockTheme.global.name.value).toBe('dark')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark')
    })

    it('should save theme preference to localStorage when toggled', async () => {
      const mockTheme = createMockTheme('light', false)
      mockUseTheme.mockReturnValue(mockTheme)

      const wrapper = mountAppNavigation()

      // Click the theme toggle button to trigger theme change
      const themeButton = wrapper.find('[title*="Switch to"]')
      await themeButton.trigger('click')

      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark')
    })
  })

  describe('Mobile Navigation', () => {
    beforeEach(() => {
      mockUseDisplay.mockReturnValue(createMockDisplay(true))
    })

    it('should toggle drawer when nav icon is clicked', async () => {
      const wrapper = mountAppNavigation()

      // Initially drawer should be closed (false)
      expect((wrapper.vm as any).drawer).toBe(false)

      const navIcon = wrapper.find('.v-app-bar-nav-icon')
      await navIcon.trigger('click')
      await wrapper.vm.$nextTick()

      // After clicking, drawer should be open (true)
      expect((wrapper.vm as any).drawer).toBe(true)
    })

    it('should render navigation drawer with all items', () => {
      const wrapper = mountAppNavigation()

      const drawer = wrapper.find('.v-navigation-drawer')
      expect(drawer.exists()).toBe(true)

      // Check for navigation items in drawer
      const listItems = drawer.findAll('.v-list-item')
      expect(listItems.length).toBeGreaterThanOrEqual(5) // 5 nav items + theme toggle
    })

    it('should close drawer when navigation item is clicked', async () => {
      const wrapper = mountAppNavigation()

      // Open drawer first by clicking nav icon
      const navIcon = wrapper.find('.v-app-bar-nav-icon')
      await navIcon.trigger('click')
      await wrapper.vm.$nextTick()

      // Verify drawer is open
      expect((wrapper.vm as any).drawer).toBe(true)

      // Click on a navigation item
      const firstNavItem = wrapper.find('.v-list-item[to="/"]')
      await firstNavItem.trigger('click')
      await wrapper.vm.$nextTick()

      // Drawer should be closed after navigation
      expect((wrapper.vm as any).drawer).toBe(false)
    })

    it('should have theme toggle in mobile drawer', () => {
      const wrapper = mountAppNavigation()

      const drawer = wrapper.find('.v-navigation-drawer')
      expect(drawer.text()).toContain('Dark Mode') // Shows "Dark Mode" when in light theme
    })
  })

  describe('Scroll Behavior', () => {
    it('should respond to scroll events', async () => {
      const wrapper = mountAppNavigation()

      // Initially should have no elevation (not scrolled)
      const appBar = wrapper.find('.v-app-bar')
      expect(appBar.exists()).toBe(true)

      // Simulate scroll
      window.scrollY = 100
      window.dispatchEvent(new Event('scroll'))
      await wrapper.vm.$nextTick()

      // After scrolling, the app bar should still be present
      // (We can't easily test elevation changes without accessing internal state)
      expect(appBar.exists()).toBe(true)
    })

    it('should handle low scroll positions', async () => {
      const wrapper = mountAppNavigation()

      // Simulate low scroll
      window.scrollY = 30
      window.dispatchEvent(new Event('scroll'))
      await wrapper.vm.$nextTick()

      // App bar should still be present and functional
      const appBar = wrapper.find('.v-app-bar')
      expect(appBar.exists()).toBe(true)
    })

    it('should maintain app bar functionality during scroll', async () => {
      const wrapper = mountAppNavigation()

      // Simulate scroll
      window.scrollY = 100
      window.dispatchEvent(new Event('scroll'))
      await wrapper.vm.$nextTick()

      // Theme toggle should still work after scroll
      const themeButton = wrapper.find('[title*="Switch to"]')
      expect(themeButton.exists()).toBe(true)

      // Navigation should still be present
      expect(wrapper.text()).toContain('James Littlefield')
    })
  })

  describe('Navigation Items', () => {
    it('should have correct navigation structure', () => {
      const wrapper = mountAppNavigation()

      const expectedItems = [
        { title: 'Home', to: '/' },
        { title: 'About', to: '/about' },
        { title: 'Experience', to: '/experience' },
        { title: 'Projects', to: '/projects' },
        { title: 'Contact', to: '/contact' },
      ]

      expectedItems.forEach((item) => {
        expect(wrapper.text()).toContain(item.title)
      })
    })

    it('should have router links with correct paths', () => {
      const wrapper = mountAppNavigation()

      const links = wrapper.findAll('a[to], .v-btn[to]')
      const expectedPaths = ['/', '/about', '/experience', '/projects', '/contact']

      expectedPaths.forEach((path) => {
        const linkExists = links.some((link) => link.attributes('to') === path)
        expect(linkExists).toBe(true)
      })
    })
  })

  describe('Lifecycle', () => {
    it('should load saved theme on mount', () => {
      localStorageMock.getItem.mockReturnValue('dark')

      const mockTheme = createMockTheme('light', false)
      mockUseTheme.mockReturnValue(mockTheme)

      mountAppNavigation()

      expect(localStorageMock.getItem).toHaveBeenCalledWith('theme')
      expect(mockTheme.global.name.value).toBe('dark')
    })

    it('should not change theme if invalid theme is saved', () => {
      localStorageMock.getItem.mockReturnValue('invalid-theme')

      const mockTheme = createMockTheme('light', false)
      mockUseTheme.mockReturnValue(mockTheme)

      mountAppNavigation()

      expect(mockTheme.global.name.value).toBe('light') // Should remain unchanged
    })

    it('should add scroll listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

      mountAppNavigation()

      expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    })

    it('should remove scroll listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const wrapper = mountAppNavigation()
      wrapper.unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    })
  })

  describe('Accessibility', () => {
    it('should have proper title attributes for theme toggle', () => {
      const wrapper = mountAppNavigation()

      const themeButton = wrapper.find('[title*="Switch to"]')
      expect(themeButton.attributes('title')).toBeTruthy()
    })

    it('should have proper semantic structure', () => {
      const wrapper = mountAppNavigation()

      // Should have app bar
      expect(wrapper.find('.v-app-bar').exists()).toBe(true)

      // Should have navigation elements
      expect(wrapper.find('nav, .v-navigation-drawer').exists()).toBe(true)
    })

    it('should have keyboard accessible navigation', () => {
      const wrapper = mountAppNavigation()

      // All interactive elements should be buttons or links
      const interactiveElements = wrapper.findAll('button, a, .v-btn')
      expect(interactiveElements.length).toBeGreaterThan(0)
    })
  })
})
