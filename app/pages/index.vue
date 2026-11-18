<script setup lang="ts">
import { projects } from '~/data/projects'
import { site } from '~/data/site'

// Fixed key: alias records keep their own path, so without it navigating between
// the aliases would remount the page.
definePageMeta({ alias: ['/projects', '/contact'], key: 'home' })

defineOgImage('Card', { title: site.name, eyebrow: site.role })

// The module emits a per-route canonical at low priority. Section URLs
// (/projects, /contact) are aliases of this page, so pin the canonical to
// the root. Unhead dedupes link[rel=canonical], so only this one renders.
// The title is the full brand line, so the site title template is turned off.
useHead({
  title: 'James Littlefield, AI Engineer',
  titleTemplate: '%s',
  link: [{ rel: 'canonical', href: withSiteUrl('/'), key: 'canonical' }],
})

useSeoMeta({ description: site.lede, ogDescription: site.lede })

// Direct landing on a section URL: scroll there without moving focus. First load
// only, so a Home remount (Back from a case study) leaves restore to the router,
// and an explicit hash is left to the router too.
const route = useRoute()
const landing = useNuxtApp().isHydrating
onMounted(() => {
  if (!landing || route.hash) return
  const id = sectionIdForPath(route.path)
  if (id) scrollToSection(id)
})
</script>

<template>
  <IntroHero />
  <div id="projects" class="wrap projects-head"><h2 id="projects-h" tabindex="-1">Projects</h2></div>
  <ProjectBlock
    v-for="(p, i) in projects"
    :key="p.slug"
    :project="p"
    :reversed="i % 2 === 1"
    :eager="i === 0"
  />
  <CapabilitiesStrip />
  <ContactSection />
</template>

<style scoped>
.projects-head { border-top: 1px solid var(--line); padding-top: var(--s-7); }
.projects-head h2 { font-size: var(--t-small); font-weight: 500; color: var(--ink-3); letter-spacing: 0; }
</style>
