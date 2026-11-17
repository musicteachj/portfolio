<script setup lang="ts">
// noindex comes from @nuxtjs/robots, which marks error pages noindex itself.
useSeoMeta({ title: 'Page not found' })
</script>

<template>
  <NuxtLayout>
    <div class="wrap">
      <h1>Page not found</h1>
      <p>That page doesn't exist or has moved.</p>
      <p>
        <NuxtLink to="/">Go to the home page</NuxtLink>
        <NuxtLink to="/projects">See the projects</NuxtLink>
      </p>
    </div>
  </NuxtLayout>
</template>
