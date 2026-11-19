<script setup lang="ts">
import { site } from '~/data/site'

const { buildYear } = useRuntimeConfig().public
</script>

<template>
  <footer class="site-foot">
    <div class="wrap">{{ site.name }}, {{ buildYear }}.</div>
  </footer>
</template>

<style scoped>
.site-foot { padding: var(--s-6) 0; font-size: 0.8125rem; color: var(--ink-3); border-top: 1px solid var(--line); background: var(--surface); }
</style>
