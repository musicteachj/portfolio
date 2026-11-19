<script setup lang="ts">
const props = defineProps<{ text: string }>()
// Odd segments sit between backticks and render as code.
const parts = computed(() => props.text.split('`').map((t, i) => ({ t, code: i % 2 === 1 })))
</script>

<template>
  <template v-for="(p, i) in parts" :key="i"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template>
</template>
