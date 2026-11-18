<script setup lang="ts">
import type { Project } from '~/types/project'

withDefaults(defineProps<{ stack: Project['stack']; variant?: 'home' | 'page' }>(), { variant: 'home' })
</script>

<template>
  <dl class="stack" :class="{ 'stack--page': variant === 'page' }">
    <div v-for="s in stack" :key="s.group">
      <dt>{{ s.group }}</dt>
      <dd>{{ s.items }}</dd>
    </div>
  </dl>
</template>

<style scoped>
.stack { margin-top: var(--s-5); border-top: 1px solid var(--line); }
.stack div { display: grid; grid-template-columns: 5.25rem minmax(0, 1fr); gap: var(--s-3); padding: 8px 0; border-bottom: 1px solid var(--line); font-size: var(--t-small); line-height: 1.5; }
.stack dt { font: 400 0.75rem/1.75 var(--font-mono); color: var(--ink-3); }
.stack dd { color: var(--ink); min-width: 0; }
@media (min-width: 600px) and (max-width: 899px) {
  .stack:not(.stack--page) { display: grid; grid-template-columns: 1fr 1fr; column-gap: var(--s-6); border-top: 0; }
  .stack:not(.stack--page) div:first-child { grid-column: 1 / -1; border-top: 1px solid var(--line); }
}
.stack--page { margin-top: var(--s-4); max-width: 780px; }
.stack--page div { padding: 10px 0; font-size: 0.9375rem; grid-template-columns: 6.5rem minmax(0, 1fr); }
</style>
