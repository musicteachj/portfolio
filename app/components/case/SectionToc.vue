<script setup lang="ts">
defineProps<{ sections: { id: string; title: string }[]; label: string }>()
</script>

<template>
  <nav class="toc" :aria-label="label">
    <ol role="list">
      <li v-for="s in sections" :key="s.id"><a :href="`#${s.id}`">{{ s.title }}</a></li>
    </ol>
  </nav>
</template>

<style scoped>
.toc { display: none; }
@media (min-width: 1100px) {
  .toc { display: block; position: sticky; top: var(--s-6); align-self: start; font-size: var(--t-small); }
  .toc ol { list-style: none; border-left: 1px solid var(--line); }
  .toc a { display: flex; align-items: center; min-height: var(--tap); padding: 0 0 0 var(--s-4); line-height: 1.3; margin-left: -1px; border-left: 2px solid transparent; color: var(--ink-3); text-decoration: none; }
  .toc a:hover { color: var(--accent); border-left-color: var(--accent); }
}
</style>
