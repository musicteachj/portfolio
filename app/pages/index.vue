<script setup lang="ts">
// Fixed key: alias records keep their own path, so without it navigating between
// the aliases would remount the page.
definePageMeta({ alias: ['/projects', '/contact'], key: 'home' })

defineOgImage('Card', { title: 'James Littlefield', eyebrow: 'AI Engineer' })

// The module emits a per-route canonical at low priority. Section URLs
// (/projects, /contact) are aliases of this page, so pin the canonical to
// the root. Unhead dedupes link[rel=canonical], so only this one renders.
useHead({
  link: [{ rel: 'canonical', href: 'https://jameslittlefield.net/', key: 'canonical' }],
})
</script>

<template>
  <div>
    <h1>James Littlefield</h1>
    <section id="projects" aria-labelledby="h-projects">
      <h2 id="h-projects">Projects</h2>
      <NuxtLink to="/projects/open-door">Open Door</NuxtLink>
      <NuxtPicture
        src="/images/projects/opendoor-cited-answer.png"
        format="avif,webp"
        width="1800"
        height="1125"
        sizes="xs:100vw sm:100vw md:50vw lg:50vw"
        alt="Open Door chat answering a sick leave question with handbook citations."
      />
    </section>
    <section id="contact" aria-labelledby="h-contact">
      <h2 id="h-contact">Contact</h2>
    </section>
  </div>
</template>
