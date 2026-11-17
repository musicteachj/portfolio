<script setup lang="ts">
import type { Project } from '~/types/project'

const props = defineProps<{ project: Project; reversed: boolean; eager?: boolean }>()

// Section ids keep the mockup's names; the slug-to-id map lives only here.
const anchors: Record<Project['slug'], string> = {
  'open-door': 'opendoor',
  packwright: 'packwright',
  folio: 'folio',
  resumeiq: 'resumeiq',
}
const id = computed(() => anchors[props.project.slug])
const proof = computed(() => proofItems(props.project, 'home'))

// Layout: 100vw below 900px, about 55vw from 900 to 1199px, 800px from 1200px. The image
// is about 590px wide at most; 800 adds a 1600w candidate so 2x tablets (up to 899px) stay sharp.
// Every entry is prefixed; an unprefixed entry makes the module emit 1w/2w candidates.
const sizes = 'xs:100vw sm:100vw md:55vw lg:800px xl:800px 2xl:800px'
</script>

<template>
  <section :id="id" class="project" :class="{ 'project--rev': reversed }" :aria-labelledby="`h-${id}`">
    <div class="wrap p-grid">
      <div class="p-text">
        <p class="p-label">{{ project.typeLabel }}</p>
        <h2 :id="`h-${id}`" class="p-name">
          <NuxtLink :to="`/projects/${project.slug}`">{{ project.name }}</NuxtLink>
        </h2>
        <p class="p-over">{{ project.overview }}</p>
        <StackList :stack="project.stack" />
        <StatRow :stats="project.stats" />
        <ProofLinks :items="proof" :label="`${project.name} links`" />
      </div>
      <div class="p-media">
        <MediaStage>
          <BrowserFrame :label="project.frameLabel" :dark="project.hero.dark">
            <NuxtPicture
              :src="project.hero.src"
              format="avif,webp"
              :width="project.hero.width"
              :height="project.hero.height"
              :sizes="sizes"
              :alt="project.hero.alt"
              :loading="eager ? undefined : 'lazy'"
            />
          </BrowserFrame>
        </MediaStage>
      </div>
    </div>
  </section>
</template>

<style scoped>
.project { padding: var(--s-6) 0 var(--s-8); scroll-margin-top: 8px; }
.project + .project { border-top: 1px solid var(--line); padding-top: var(--s-8); }
.p-grid { display: grid; grid-template-columns: 1fr; gap: var(--s-6); }
.p-media { order: -1; }
@media (min-width: 900px) {
  .p-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); gap: clamp(32px, 5vw, 72px); align-items: start; }
  .project--rev .p-grid { grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); }
  .p-media { order: 0; position: sticky; top: var(--s-6); }
  .project--rev .p-media { order: -1; }
}
@media (min-width: 1200px) {
  .p-grid { grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.25fr); }
  .project--rev .p-grid { grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.85fr); }
}
.p-text { container-type: inline-size; }
.p-label { display: flex; align-items: center; gap: var(--s-3); font-size: var(--t-small); color: var(--ink-3); }
.p-label::before { content: ""; width: 10px; height: 10px; border-radius: 2px; background: var(--mark); flex: none; }
.p-name { font-size: var(--t-h2); letter-spacing: -0.028em; margin-top: var(--s-3); }
.p-name a { color: inherit; text-decoration: none; }
.p-name a:hover { color: var(--accent); text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 5px; }
.p-over { margin-top: var(--s-3); color: var(--ink-2); max-width: 60ch; }
</style>
