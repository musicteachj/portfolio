<template>
  <div class="project-detail-page">
    <v-container>
      <v-row v-if="project">
        <v-col cols="12">
          <!-- Back Navigation -->
          <div class="mb-6">
            <v-btn to="/projects" color="primary" variant="text" prepend-icon="mdi-arrow-left">
              Back to Projects
            </v-btn>
          </div>

          <!-- Project Header -->
          <div class="text-center mb-8">
            <h1 class="text-h2 font-weight-bold mb-4">{{ project.title }}</h1>
          </div>

          <!-- Project Image -->
          <v-col cols="12" md="8" offset-md="2" class="mb-8">
            <v-img
              :src="project.image"
              height="400"
              cover
              class="rounded-lg elevation-8"
              :alt="`${project.title} details preview`"
              loading="lazy"
            ></v-img>
          </v-col>

          <!-- Project Details -->
          <v-col cols="12" md="8" offset-md="2">
            <v-card elevation="8" class="pa-8">
              <h2 class="text-h4 mb-4">About This Project</h2>
              <p class="text-body-1 mb-6">{{ project.longDescription }}</p>

              <h3 class="text-h5 mb-4">Key Features</h3>
              <v-list>
                <v-list-item
                  v-for="feature in project.features"
                  :key="feature"
                  prepend-icon="mdi-check-circle"
                >
                  <template v-slot:prepend>
                    <v-icon color="green" size="small">mdi-check-circle</v-icon>
                  </template>
                  <v-list-item-title class="text-wrap">{{ feature }}</v-list-item-title>
                </v-list-item>
              </v-list>

              <!-- Action Buttons -->
              <div class="d-flex justify-center ga-4 mt-8">
                <v-btn
                  v-if="project.liveUrl"
                  :href="project.liveUrl"
                  target="_blank"
                  color="primary"
                  size="large"
                  prepend-icon="mdi-open-in-new"
                >
                  Live Demo
                </v-btn>
                <v-btn
                  v-if="project.githubUrl"
                  :href="project.githubUrl"
                  target="_blank"
                  :color="isDark ? 'primary' : 'secondary'"
                  size="large"
                  prepend-icon="mdi-github"
                >
                  View Code
                </v-btn>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" class="text-center mb-8 mt-8">
            <h2 class="text-h3 font-weight-bold mb-4">Technical Skills</h2>
          </v-col>
          <Skills :skills="project.technologies" />
        </v-col>
      </v-row>

      <!-- Project Not Found -->
      <v-row v-else>
        <v-col cols="12" class="text-center">
          <v-icon size="120" color="grey" class="mb-4">mdi-file-question</v-icon>
          <h1 class="text-h3 mb-4">Project Not Found</h1>
          <p class="text-h6 mb-6">The project you're looking for doesn't exist.</p>
          <v-btn to="/projects" color="primary" size="large"> View All Projects </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { useTheme } from 'vuetify'
import Skills from '@/components/Skills.vue'

const theme = useTheme()

const isDark = computed(() => theme.global.name.value === 'dark')

const route = useRoute()
const projectsStore = useProjectsStore()

const project = computed(() => {
  const id = parseInt(route.params.id as string)
  return projectsStore.getProjectById(id)
})
</script>

<style scoped>
.project-detail-page {
  padding: 80px 0;
  min-height: 100vh;
}

.text-wrap {
  white-space: normal !important;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
</style>
