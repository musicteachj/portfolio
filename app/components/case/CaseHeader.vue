<script setup lang="ts">
import type { Project } from '~/types/project'

const props = defineProps<{ project: Project }>()

// Measured in Chromium (no scrollbar): the hero renders at 0.84 to 0.88 of the viewport width up
// to 1199px (302px at 360, 332 at 390, 780 at 900, 1042 at 1199) and stays 1042px from 1200px.
// So the entries are 90vw up to 1199px and 1042px from 1200px. Densities are 1 only: the
// default 2x would ask for 2084w (more than the 1800px source, or 1600px for Folio) and
// upscale. Instead the last entry, from a 2400px viewport, names the source width itself, so
// the full file is a candidate, so 2x screens that need more than 1042w can pick it (a 2x phone
// at 390px needs 702w and picks 810w). Every entry is prefixed; an unprefixed entry makes the
// module emit 1w/2w candidates.
const sizes = `xs:90vw sm:90vw md:90vw lg:1042px 2400:${props.project.hero.width}px`
</script>

<template>
  <section class="cs-head">
    <div class="wrap">
      <nav class="pnav" aria-label="Project pages">
        <SectionLink to="/projects" class="back">All projects</SectionLink>
        <CaseProjectTabs :current="project.slug" />
      </nav>
      <CaseIntro :project="project" />
      <MediaStage class="cs-hero">
        <BrowserFrame :label="project.frameLabel" :dark="project.hero.dark">
          <NuxtPicture
            :src="project.hero.src"
            format="avif,webp"
            :width="project.hero.width"
            :height="project.hero.height"
            :sizes="sizes"
            densities="1"
            :alt="project.hero.alt"
            loading="eager"
            :img-attrs="{ fetchpriority: 'high' }"
            :preload="{ fetchPriority: 'high' }"
          />
        </BrowserFrame>
      </MediaStage>
    </div>
  </section>
</template>

<style scoped>
.cs-head { padding: var(--s-6) 0 0; }
.pnav { display: flex; flex-wrap: wrap; align-items: center; gap: var(--s-3) var(--s-5); }
.back { display: inline-flex; align-items: center; min-height: var(--tap); font-size: var(--t-small); color: var(--ink-2); text-decoration-color: var(--field-border); }
.back:hover { color: var(--accent); }
@media (max-width: 599px) {
  .pnav { flex-direction: column; align-items: stretch; gap: var(--s-2); }
  .back { align-self: flex-start; }
}
.cs-hero { margin-top: var(--s-6); }
</style>
