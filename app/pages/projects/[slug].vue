<script setup lang="ts">
import { projectBySlug } from '~/data/projects'

const route = useRoute()
const project = projectBySlug(String(route.params.slug))
if (!project) throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
</script>

<template>
  <h1>{{ project.name }}</h1>
</template>
