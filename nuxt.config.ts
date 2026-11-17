export default defineNuxtConfig({
  compatibilityDate: '2026-11-17',
  modules: ['@nuxtjs/seo', '@nuxt/image', '@nuxt/fonts', '@nuxt/eslint'],
  css: ['~/assets/css/tokens.css', '~/assets/css/base.css', '~/assets/css/ui.css'],
  fonts: {
    families: [
      { name: 'Onest', weights: [400, 500, 600, 700], global: true },
      { name: 'Fragment Mono', weights: [400] },
    ],
  },
  ogImage: {
    // Images are rendered once at generate time; no runtime renderer ships.
    zeroRuntime: true,
    defaults: { width: 1200, height: 630 },
  },
  image: {
    // Layout breakpoints (min-width). All six keys are set so the module defaults do not
    // merge in. They drive the `sizes` media queries on project screenshots (see
    // ProjectBlock); srcset widths derive from them, capped at the 1800px sources.
    screens: { xs: 360, sm: 600, md: 900, lg: 1200, xl: 1440, '2xl': 1800 },
  },
  runtimeConfig: {
    // Read by the footer so the server-rendered HTML and the client hydrate with the same value.
    public: { buildYear: new Date().getFullYear() },
  },
  // The prerender crawl fails the build on any broken internal link.
  linkChecker: { failOnError: true },
  // Static site with no server to serve old assets: the skew protection service
  // worker (_nuxt-skew-sw.js) is dead weight, so the module is switched off.
  skewProtection: { enabled: false },
  site: {
    url: 'https://jameslittlefield.net',
    name: 'James Littlefield',
    trailingSlash: false,
  },
  experimental: {
    // Renders app/error.vue into 404.html during generate.
    prerenderErrorPages: [404],
  },
  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
  nitro: {
    prerender: { crawlLinks: true, routes: ['/', '/projects', '/contact', '/projects/open-door'] },
    hooks: {
      // @nuxtjs/robots adds its own noindex tag to /404.html on top of the one the
      // app renders, so 404.html ends up with two. Collapse them to one.
      'prerender:generate': (route) => {
        if (route.route !== '/404.html' || !route.contents) return
        const tag = '<meta name="robots" content="noindex, nofollow">'
        route.contents = route.contents
          .replace(/<meta name="robots"[^>]*>/g, '')
          .replace('</head>', `${tag}</head>`)
      },
    },
  },
})
