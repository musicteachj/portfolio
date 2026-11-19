<script setup lang="ts">
import type { Project } from '~/types/project'

defineProps<{ stats: Project['stats'] }>()
</script>

<template>
  <dl class="stats">
    <div v-for="s in stats" :key="s.label">
      <dt>{{ s.label }}</dt>
      <dd>{{ s.value }}<small v-if="s.unit">{{ s.unit }}</small></dd>
    </div>
  </dl>
</template>

<style scoped>
.stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--s-4); margin-top: var(--s-5); border-top: 2px solid var(--mark); padding-top: var(--s-4); }
.stats div { display: flex; flex-direction: column-reverse; justify-content: flex-end; min-width: 0; }
.stats dt { font-size: 0.8125rem; color: var(--ink-3); line-height: 1.4; margin-top: 6px; }
.stats dd { font-size: var(--t-stat); font-weight: 600; letter-spacing: -0.03em; line-height: 1; font-variant-numeric: tabular-nums; }
.stats dd small { font-size: 0.55em; font-weight: 500; color: var(--ink-2); letter-spacing: 0; margin-left: 1px; }
</style>
