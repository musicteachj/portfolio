<script setup lang="ts">
defineProps<{ items: string[] }>()
</script>

<template>
  <ul class="feat">
    <li v-for="(item, i) in items" :key="i"><CaseInlineText :text="item" /></li>
  </ul>
</template>

<style scoped>
.feat { margin-top: var(--s-4); padding-left: 1.1rem; max-width: 66ch; color: var(--ink-2); }
.feat li { padding: 3px 0; }
.feat li::marker { color: var(--mark); }
</style>
