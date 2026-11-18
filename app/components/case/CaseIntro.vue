<script setup lang="ts">
import type { Project } from '~/types/project'

const props = defineProps<{ project: Project }>()
const proof = computed(() => proofItems(props.project, 'page'))
</script>

<template>
  <div class="cs-intro">
    <div>
      <p class="p-label">{{ project.typeLabel }}</p>
      <h1 id="case-title" tabindex="-1">{{ project.name }}</h1>
      <p class="lede">{{ project.oneLine }}</p>
    </div>
    <ProofLinks :items="proof" :label="`${project.name} links`" variant="page" :project-name="project.name" />
  </div>
</template>

<style scoped>
.cs-intro { container-type: inline-size; margin-top: var(--s-6); display: grid; gap: var(--s-5); }
@media (min-width: 1024px) { .cs-intro { grid-template-columns: minmax(0, 1fr) minmax(0, 520px); align-items: end; gap: var(--s-7); } }
.cs-intro h1 { font-size: var(--t-display); letter-spacing: -0.035em; margin-top: var(--s-3); }
.cs-intro .lede { margin-top: var(--s-3); font-size: var(--t-lede); line-height: 1.5; color: var(--ink-2); max-width: 52ch; }
.p-label { display: flex; align-items: center; gap: var(--s-3); font-size: var(--t-small); color: var(--ink-3); }
.p-label::before { content: ""; width: 10px; height: 10px; border-radius: 2px; background: var(--mark); flex: none; }
</style>
