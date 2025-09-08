<template>
  <div class="projects-page">
    <v-container>
      <v-row>
        <v-col cols="12">
          <div class="text-center mb-8">
            <h1 class="text-h2 font-weight-bold mb-4">My Projects</h1>
            <p class="text-h6" style="opacity: 0.8">
              Explore my featured projects and technical work
            </p>
          </div>
        </v-col>

        <v-col
          v-for="project in projects"
          :key="project.id"
          cols="12"
          md="6"
          lg="4"
          class="mx-auto"
        >
          <ProjectCard :project="project" />
        </v-col>

        <v-col cols="12" class="text-center mt-8">
          <v-btn to="/" color="primary" size="large" prepend-icon="mdi-arrow-left">
            Back to Home
          </v-btn>
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
  padding: 80px 0;
  min-height: 100vh;
}
</style>
