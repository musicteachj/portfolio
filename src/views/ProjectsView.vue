<template>
  <div class="projects-page">
    <v-container>
      <!-- Header -->
      <div class="section-head mb-12">
        <p class="eyebrow mb-2">Work</p>
        <h1 class="page-title">Projects</h1>
        <div class="accent-rule is-visible"></div>
        <p class="page-subtitle">A selection of things I've designed, built, and shipped.</p>
      </div>

      <v-row>
        <v-col v-for="project in projects" :key="project.id" cols="12" md="6" lg="4">
          <ProjectCard :project="project" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ProjectCard from '@/components/ProjectCard.vue'
import { useProjectsStore } from '@/stores/projects'

const projectsStore = useProjectsStore()
const projects = computed(() => projectsStore.projects)
</script>

<style scoped>
.projects-page {
  padding: var(--section-py) 0;
  min-height: 100vh;
}

.page-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(2rem, 4vw, 3rem);
  letter-spacing: -0.03em;
  line-height: 1.05;
  color: rgb(var(--v-theme-primary));
  margin-bottom: 16px;
}

.page-subtitle {
  margin-top: 18px;
  font-size: 1.05rem;
  color: rgb(var(--v-theme-secondary));
}

@media (max-width: 600px) {
  .projects-page {
    padding: var(--section-py-mobile) 0;
  }
}
</style>
