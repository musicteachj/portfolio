<script setup lang="ts">
import { site } from '~/data/site'

const route = useRoute()
const router = useRouter()
const links = [
  { to: '/projects', label: 'Projects' },
  { to: '/contact', label: 'Contact' },
] as const

// Section links are aliases of one page, so the router would mark both as the
// current page. Mark only the section whose path is open, as a location.
const current = (to: string) => (route.path === to ? 'location' : undefined)

// Plain primary-button clicks only; modified clicks keep the browser's default (new tab, etc.).
const isPlainClick = (e: MouseEvent) =>
  !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey

// The section paths and / are aliases of one record, so the router treats a move between
// them as a duplicate navigation unless forced. Returns false if the push did not land.
async function pushForced(path: string) {
  try {
    return !(await router.push({ path, force: true }))
  } catch {
    return false
  }
}

async function go(e: MouseEvent, to: keyof typeof SECTION_PATHS) {
  if (!isPlainClick(e)) return
  e.preventDefault()
  const id = SECTION_PATHS[to]
  if (route.path === to) {
    // Already here: the router does nothing, so scroll and focus directly.
    scrollToSection(id, { focus: true })
    return
  }
  // The router's scrollBehavior does the scroll; the handler only moves focus.
  if (await pushForced(to)) focusSectionHeading(id)
}

async function home(e: MouseEvent) {
  if (!isPlainClick(e)) return
  e.preventDefault()
  if (route.path === '/') window.scrollTo({ top: 0, behavior: scrollBehaviorPref() })
  else await pushForced('/')
}
</script>

<template>
  <header class="topbar">
    <div class="wrap">
      <a class="wordmark" href="/" :aria-current="route.path === '/' ? 'page' : undefined" @click="home"><span class="wordmark-mark" aria-hidden="true"><span /></span>{{ site.name }}</a>
      <nav class="topnav" aria-label="Primary">
        <a v-for="l in links" :key="l.to" :href="l.to" :aria-current="current(l.to)" @click="go($event, l.to)">{{ l.label }}</a>
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
