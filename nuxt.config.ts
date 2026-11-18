import { site } from './app/data/site'

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
    public: {
      // Read by the footer so the server-rendered HTML and the client hydrate with the same value.
      buildYear: new Date().getFullYear(),
      // Baked in at generate time from NUXT_PUBLIC_EMAILJS_SERVICE_ID, NUXT_PUBLIC_EMAILJS_TEMPLATE_ID and NUXT_PUBLIC_EMAILJS_PUBLIC_KEY.
      emailjs: { serviceId: '', templateId: '', publicKey: '' },
    },
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
  sitemap: {
    // /projects and /contact are aliases of Home (canonical /), so they stay out.
    exclude: ['/projects', '/contact'],
  },
  robots: {
    groups: [
      { userAgent: ['GPTBot', 'ClaudeBot', 'PerplexityBot'], allow: ['/'] },
    ],
  },
  aiReady: {
    // Static hosting cannot vary responses by header, and the per-page Markdown copies
    // are enough. The Markdown index of the sitemap would list the alias routes.
    contentNegotiation: false,
    botNegotiation: false,
    sitemapMd: false,
  },
  schemaOrg: {
    // The Person node (@id https://jameslittlefield.net/#identity). No email, on purpose.
    identity: {
      type: 'Person',
      name: site.name,
      jobTitle: site.role,
      url: 'https://jameslittlefield.net/',
      image: '/images/james.jpg',
      sameAs: [site.githubUrl, site.linkedinUrl],
    },
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
    prerender: {
      crawlLinks: true,
      routes: ['/', '/projects', '/contact', '/projects/open-door'],
      // nuxt-ai-ready has no route-level exclusion. These aliases of Home must not get a
      // Markdown copy, a llms.txt entry or an llms-full.txt section.
      ignore: ['/projects.md', '/contact.md'],
    },
    hooks: {
      // @nuxtjs/robots adds its own noindex tag to /404.html on top of the one the
      // app renders, so 404.html ends up with two. Collapse them to one.
      'prerender:generate': (route) => {
        // /projects and /contact are aliases of Home, so their pages drop the link to a
        // Markdown copy that is not built (see prerender.ignore above).
        if (route.route === '/projects' || route.route === '/contact') {
          route.contents = route.contents?.replace(/<link rel="alternate" type="text\/markdown"[^>]*>/g, '')
          return
        }
        if (route.route !== '/404.html' || !route.contents) return
        const tag = '<meta name="robots" content="noindex, nofollow">'
        route.contents = route.contents
          .replace(/<meta name="robots"[^>]*>/g, '')
          .replace('</head>', `${tag}</head>`)
      },
    },
  },
})
