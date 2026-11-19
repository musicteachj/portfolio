<script setup lang="ts">
import type { GalleryScreenshot } from '~/types/project'

const props = defineProps<{ items: GalleryScreenshot[]; frameLabel: string }>()

// The grid is auto-fit with 280px tracks and a 24px gap, and auto-fit stretches a lone item
// (or a pair) across the row, so the rendered width depends on how many items there are.
// The content column is the viewport minus 64px of gutters from 800px, 252px less once the
// toc appears at 1100px (180px plus its gap), and 864px at most from 1180px. So:
// - One item fills the column: about 100vw below 1100px, then 864px.
// - Two or more items sit two to a row once the column fits two tracks (about 640px), and
//   half of 864px is about 420px. Three tracks fit only between 952px and the toc at
//   1100px, where three or more items take a third.
// The 2-up and 3-up keys sit about a scrollbar (17px) above those widths: `sizes` media
// queries count a classic scrollbar (Windows, or macOS set to always show it) but the grid
// doesn't get that width, so a lower key would claim a narrower slot than renders. The toc
// key needs no margin, since the toc's CSS media query counts the scrollbar the same way.
// Numeric keys are min-width breakpoints like the screens in nuxt.config. Every entry is
// prefixed; an unprefixed entry emits 1w/2w candidates.
const sizes = computed(() => {
  const n = props.items.length
  if (n === 1) return 'xs:100vw sm:100vw md:100vw 1100:864px'
  if (n === 2) return 'xs:100vw 656:50vw md:50vw 1100:420px'
  return 'xs:100vw 656:50vw md:50vw 970:33vw 1100:420px'
})
</script>

<template>
  <div class="gallery">
    <figure v-for="g in items" :key="g.src" class="g-item">
      <BrowserFrame :label="frameLabel" :dark="g.dark" as="div">
        <NuxtPicture
          :src="g.src"
          format="avif,webp"
          :width="g.width"
          :height="g.height"
          :sizes="sizes"
          :alt="g.alt"
          loading="lazy"
        />
      </BrowserFrame>
      <figcaption>{{ g.caption }}</figcaption>
    </figure>
  </div>
</template>

<style scoped>
.gallery { margin-top: var(--s-6); display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: var(--s-5); align-items: start; }
.g-item { margin: 0; }
.g-item figcaption { margin-top: var(--s-3); font-size: 0.8125rem; color: var(--ink-3); line-height: 1.45; }
</style>
