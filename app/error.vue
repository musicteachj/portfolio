<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const notFound = computed(() => (props.error?.status ?? props.error?.statusCode) === 404)
const title = computed(() => (notFound.value ? 'Page not found' : 'Something went wrong'))
const message = computed(() =>
  notFound.value ? "That page doesn't exist or has moved." : 'Try the home page, or reload in a moment.',
)

// noindex comes from @nuxtjs/robots, which marks error pages noindex itself.
useSeoMeta({ title })
</script>

<template>
  <!-- error.vue renders instead of app.vue, so it needs its own announcer. -->
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <div class="wrap error-page">
      <h1>{{ title }}</h1>
      <p>{{ message }}</p>
      <div class="actions">
        <NuxtLink to="/" class="btn btn--primary">Go to the home page</NuxtLink>
        <SectionLink to="/projects" class="btn">See the projects</SectionLink>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>
/* Top spacing matches .cs-head; the bottom matches the case study body above the footer. */
.error-page { padding-top: var(--s-6); padding-bottom: var(--s-8); }
.error-page h1 { font-size: var(--t-h2); letter-spacing: -0.028em; }
.error-page p { margin-top: var(--s-3); color: var(--ink-2); max-width: 60ch; }
</style>
