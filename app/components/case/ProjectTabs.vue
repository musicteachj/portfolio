<script setup lang="ts">
import { projects } from '~/data/projects'
import type { ProjectSlug } from '~/types/project'

defineProps<{ current: ProjectSlug }>()
</script>

<template>
  <ol class="ptabs" role="list">
    <li v-for="p in projects" :key="p.slug">
      <NuxtLink :to="`/projects/${p.slug}`" :aria-current="p.slug === current ? 'page' : undefined">{{ p.name }}</NuxtLink>
    </li>
  </ol>
</template>

<style scoped>
.ptabs { list-style: none; display: grid; grid-template-columns: repeat(4, auto); gap: 4px; padding: 3px; border-radius: 9px; background: var(--sunken); }
.ptabs a { display: flex; align-items: center; justify-content: center; min-height: var(--tap); padding: 0 14px; border-radius: 7px; font-size: var(--t-small); font-weight: 500; color: var(--ink-2); text-decoration: none; white-space: nowrap; }
.ptabs a:hover { color: var(--accent); background: var(--surface); }
.ptabs a[aria-current="page"] { background: var(--surface); color: var(--accent); box-shadow: 0 0 0 1px var(--field-border); }
@media (max-width: 599px) {
  .ptabs { grid-template-columns: 1fr 1fr; }
}
</style>
