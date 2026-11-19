<script setup lang="ts">
const props = defineProps<{ id: string; n: number; title: string }>()
const num = computed(() => String(props.n).padStart(2, '0'))
</script>

<template>
  <section :id="id" class="cs-sec" :aria-labelledby="`${id}-h`">
    <h2 :id="`${id}-h`" tabindex="-1"><span class="sec-n">{{ num }}</span>{{ title }}</h2>
    <slot />
  </section>
</template>

<style scoped>
.cs-sec { padding-top: var(--s-8); scroll-margin-top: var(--s-4); }
.cs-sec:first-child { padding-top: 0; }
.cs-sec h2 { font-size: 1.5rem; letter-spacing: -0.02em; }
.sec-n { font: 400 0.8125rem/1 var(--font-mono); color: var(--ink-3); margin-right: var(--s-3); vertical-align: 3px; letter-spacing: 0; }
/* Slotted paragraphs belong to the page, so :slotted is needed under scoped CSS. */
.cs-sec > :slotted(p) { margin-top: var(--s-3); color: var(--ink-2); max-width: 66ch; }
</style>
