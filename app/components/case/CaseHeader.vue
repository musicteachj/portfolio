<script setup lang="ts">
import type { Project } from '~/types/project'

defineProps<{ project: Project }>()

// Content is at most about 1180px wide (the .wrap width minus stage padding). Every entry is
// prefixed; an unprefixed entry makes the module emit 1w/2w candidates.
const sizes = 'xs:100vw sm:100vw md:100vw lg:1180px xl:1180px 2xl:1180px'
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
            :alt="project.hero.alt"
            loading="eager"
            :img-attrs="{ fetchpriority: 'high' }"
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
