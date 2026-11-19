<script setup lang="ts">
import { projectBySlug } from '~/data/projects'
import { site } from '~/data/site'

const route = useRoute()
const project = projectBySlug(String(route.params.slug))
if (!project) throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })

const { title, description } = projectSeo(project)
useSeoMeta({ title, description, ogDescription: description })
defineOgImage('Card', { title: project.name, eyebrow: project.typeLabel, image: project.hero.src })
const siteUrl = useSiteConfig().url
useSchemaOrg([
  // nuxt-schema-org has no CreativeWork helper, so this is a plain node.
  {
    '@type': 'CreativeWork',
    '@id': `${siteUrl}/projects/${project.slug}#creativework`,
    name: project.name,
    description,
    image: `${siteUrl}${project.hero.src}`,
    url: `${siteUrl}/projects/${project.slug}`,
    author: { '@id': `${siteUrl}/#identity` },
  },
  defineBreadcrumb({
    itemListElement: [
      { name: site.name, item: `${siteUrl}/` },
      { name: project.name, item: `/projects/${project.slug}` },
    ],
  }),
])

// After a link or tab click into a case study, move focus to its heading so keyboard and
// screen reader users start at the new page. A link to a part of the page (#media, #video)
// starts at the heading of the section that holds it instead. The first load keeps the
// browser's own focus, and so does Back/Forward, as it would between server pages. The
// router owns the scroll.
const nuxtApp = useNuxtApp()
const landing = nuxtApp.isHydrating
onMounted(() => {
  if (landing || nuxtApp.$isHistoryNav()) return
  const target = route.hash ? document.getElementById(route.hash.slice(1)) : null
  const heading = target?.closest('.cs-sec')?.querySelector('h2') ?? document.getElementById('case-title')
  heading?.focus({ preventScroll: true })
})

const showsVideo = hasVideo(project)
const sections = [
  { id: 'overview', title: 'Overview' },
  { id: 'features', title: 'Key features' },
  { id: 'how-ai-works', title: 'How the AI works' },
  { id: 'stack', title: 'Tech stack' },
  { id: 'architecture', title: 'Architecture' },
  { id: 'results', title: 'Results and evals' },
  { id: 'decisions', title: 'Decisions and lessons' },
  { id: 'media', title: showsVideo ? 'Video and screenshots' : 'Screenshots' },
]
</script>

<template>
  <div>
    <CaseHeader :project="project" />
    <div class="wrap cs-body">
      <CaseSectionToc :sections="sections" :label="`${project.name} sections`" />
      <article>
        <CaseSection v-for="(s, i) in sections" :id="s.id" :key="s.id" :n="i + 1" :title="s.title">
          <p v-if="s.id === 'overview'">{{ project.caseStudy.overview }}</p>
          <CaseFeatureList v-else-if="s.id === 'features'" :items="project.caseStudy.features" />
          <StackList v-else-if="s.id === 'stack'" :stack="project.stack" variant="page" />
          <CaseDecisionList v-else-if="s.id === 'decisions'" :items="project.caseStudy.decisions" />
          <template v-else-if="s.id === 'how-ai-works'">
            <p><CaseInlineText :text="project.caseStudy.howAiWorks.intro" /></p>
            <CaseFeatureList :items="project.caseStudy.howAiWorks.points" />
          </template>
          <template v-else-if="s.id === 'architecture'">
            <CaseRequestFlow v-if="project.caseStudy.architecture.kind === 'flow'" v-bind="{ ariaLabel: project.caseStudy.architecture.ariaLabel }" />
            <CaseArchitectureSteps v-else :groups="project.caseStudy.architecture.groups" />
          </template>
          <CaseResultsTable v-else-if="s.id === 'results'" :table="project.caseStudy.results" />
          <CaseMediaSection v-else :project="project" />
        </CaseSection>
        <CasePrevNext :current="project.slug" />
      </article>
    </div>
  </div>
</template>

<style scoped>
.cs-body { display: grid; grid-template-columns: 1fr; padding-top: var(--s-8); padding-bottom: var(--s-8); }
@media (min-width: 1100px) { .cs-body { grid-template-columns: 180px minmax(0, 1fr); gap: var(--s-8); } }
.cs-body article { min-width: 0; }
</style>
