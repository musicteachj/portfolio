<script setup lang="ts">
// noindex comes from @nuxtjs/robots, which marks error pages noindex itself.
useSeoMeta({ title: 'Page not found' })
</script>

<template>
  <main>
    <h1>Page not found</h1>
    <p>That page doesn't exist or has moved.</p>
    <p>
      <NuxtLink to="/">Go to the home page</NuxtLink>
      <!-- eslint-disable-next-line link-checker/valid-route -- /projects is an alias of the home page -->
      <NuxtLink to="/projects">See the projects</NuxtLink>
    </p>
  </main>
</template>
