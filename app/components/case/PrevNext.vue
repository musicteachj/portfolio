<script setup lang="ts">
import { projects } from '~/data/projects'
import type { ProjectSlug } from '~/types/project'

const props = defineProps<{ current: ProjectSlug }>()

const links = computed(() => {
  const i = projects.findIndex((p) => p.slug === props.current)
  const n = projects.length
  return { prev: projects[(i + n - 1) % n]!, next: projects[(i + 1) % n]! }
})
</script>

<template>
  <nav class="prevnext" aria-label="More projects">
    <NuxtLink :to="`/projects/${links.prev.slug}`"><span>Previous project</span>{{ links.prev.name }}</NuxtLink>
    <NuxtLink :to="`/projects/${links.next.slug}`"><span>Next project</span>{{ links.next.name }}</NuxtLink>
  </nav>
</template>

<style scoped>
.prevnext { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-4); margin-top: var(--s-8); padding-top: var(--s-6); border-top: 2px solid var(--mark); }
.prevnext a { display: block; padding: var(--s-4) var(--s-5); border: 1px solid var(--field-border); border-radius: var(--r-ctl); text-decoration: none; font-weight: 600; font-size: 1.125rem; color: var(--ink); background: var(--surface); }
.prevnext a:last-child { text-align: right; }
.prevnext a:hover { border-color: var(--accent); color: var(--accent); }
.prevnext span { display: block; font: 400 0.75rem/1.6 var(--font-mono); color: var(--ink-3); }
@media (max-width: 559px) { .prevnext { grid-template-columns: 1fr; } .prevnext a:last-child { text-align: left; } }
</style>
