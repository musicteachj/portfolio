<script setup lang="ts">
defineProps<{ label: string; dark?: boolean }>()
</script>

<template>
  <figure class="frame" :class="{ 'frame--dark': dark }">
    <div class="frame-bar" aria-hidden="true">
      <span class="frame-dots"><i /><i /><i /></span>
      <span class="frame-addr">{{ label }}</span>
      <span />
    </div>
    <slot />
  </figure>
</template>

<style scoped>
.frame { margin: 0; background: var(--surface); border: 1px solid rgba(0,0,0,.14); border-radius: var(--r-frame); overflow: hidden; box-shadow: var(--shadow-frame); }
.frame-bar { display: grid; grid-template-columns: 44px minmax(0, 1fr) 44px; align-items: center; height: 30px; padding: 0 10px; border-bottom: 1px solid var(--line); background: #FAFAF8; }
.frame-dots { display: flex; gap: 6px; }
.frame-dots i { width: 8px; height: 8px; border-radius: 50%; background: var(--line-strong); }
.frame-addr { justify-self: center; font: 400 0.6875rem/1 var(--font-mono); color: var(--ink-3); padding: 4px 10px; border-radius: 5px; background: var(--sunken); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.frame--dark .frame-bar { background: #1B1B19; border-bottom-color: #2C2C29; }
.frame--dark .frame-dots i { background: #3F3F3A; }
.frame--dark .frame-addr { background: #262623; color: #B9B9B0; }
/* Screenshots are never cropped. The picture and img render in the slot, so reach them with :deep. */
.frame :deep(img) { width: 100%; height: auto; display: block; }
</style>
