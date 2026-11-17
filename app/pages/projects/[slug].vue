<script setup lang="ts">
const names: Record<string, string> = { 'open-door': 'Open Door' }

const route = useRoute()
const name = names[String(route.params.slug)]
if (!name) throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
</script>

<template>
  <h1>{{ name }}</h1>
</template>
