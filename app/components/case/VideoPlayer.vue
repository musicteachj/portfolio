<script setup lang="ts">
// The description (for a video with no sound) is rendered by MediaSection, below the stage.
defineProps<{ src: string; poster?: string; captions?: string; label: string }>()
</script>

<template>
  <video controls preload="none" :poster="poster" :src="src" :aria-label="label">
    <track v-if="captions" kind="captions" srclang="en" label="English" :src="captions" default>
  </video>
</template>
