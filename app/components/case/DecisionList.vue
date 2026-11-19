<script setup lang="ts">
import type { Decision } from '~/types/project'

defineProps<{ items: Decision[] }>()
</script>

<template>
  <ul class="plain-list" role="list">
    <li v-for="d in items" :key="d.title"><b>{{ d.title }}.</b> {{ d.text }}</li>
  </ul>
</template>

<style scoped>
.plain-list { list-style: none; margin-top: var(--s-4); max-width: 68ch; }
.plain-list li { padding: var(--s-3) 0; border-top: 1px solid var(--line); color: var(--ink-2); }
.plain-list li:last-child { border-bottom: 1px solid var(--line); }
.plain-list b { color: var(--ink); font-weight: 600; }
</style>
