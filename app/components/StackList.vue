<script setup lang="ts">
import type { Project } from '~/types/project'

defineProps<{ stack: Project['stack'] }>()
</script>

<template>
  <dl class="stack">
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
  .stack { display: grid; grid-template-columns: 1fr 1fr; column-gap: var(--s-6); border-top: 0; }
  .stack div:first-child { grid-column: 1 / -1; border-top: 1px solid var(--line); }
}
</style>
