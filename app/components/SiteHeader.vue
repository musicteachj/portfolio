<script setup lang="ts">
import { site } from '~/data/site'

const route = useRoute()
const links = [
  { to: '/projects', label: 'Projects' },
  { to: '/contact', label: 'Contact' },
] as const

// Section links are aliases of one page, so the router would mark both as the
// current page. Mark only the section whose path is open, as a location.
const current = (to: string) => (route.path === to ? 'location' : undefined)
</script>

<template>
  <header class="topbar">
    <div class="wrap">
      <SectionLink class="wordmark" to="/" :aria-current="route.path === '/' ? 'page' : undefined"><span class="wordmark-mark" aria-hidden="true"><span /></span>{{ site.name }}</SectionLink>
      <nav class="topnav" aria-label="Primary">
        <SectionLink v-for="l in links" :key="l.to" :to="l.to" :aria-current="current(l.to)">{{ l.label }}</SectionLink>
        <a :href="site.resumePath">Résumé</a>
      </nav>
    </div>
  </header>
</template>

<style scoped>
/* Top bar: one condensed row; wraps under the wordmark on very narrow screens */
.topbar { border-bottom: 1px solid var(--line); }
.topbar .wrap { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; min-height: 64px; column-gap: var(--s-4); }
.wordmark { display: inline-flex; align-items: center; gap: 10px; min-height: var(--tap); font-weight: 600; color: var(--ink); text-decoration: none; white-space: nowrap; }
.wordmark:hover { color: var(--ink); text-decoration: none; }
.wordmark-mark { width: 20px; height: 20px; border-radius: 5px; background: var(--accent); display: grid; place-items: center; flex: none; }
.wordmark-mark span { width: 8px; height: 8px; border-radius: 2px; background: var(--soft); }
.topnav { display: flex; align-items: center; gap: var(--s-1); margin-right: -10px; }
.topnav a { display: inline-flex; align-items: center; min-height: var(--tap); padding: 0 10px; border-radius: var(--r-ctl); font-size: 0.9375rem; color: var(--ink-2); text-decoration: none; }
.topnav a:hover { color: var(--accent); text-decoration: underline; }
</style>
