<template>
  <div class="project-detail-page">
    <v-container>
      <template v-if="project">
        <!-- Back -->
        <v-btn
          to="/projects"
          variant="text"
          color="accent"
          class="text-none px-0 mb-6"
          prepend-icon="mdi-arrow-left"
        >
          Back to projects
        </v-btn>

        <!-- Header -->
        <div class="detail-head mb-8">
          <div class="detail-meta">
            <span class="detail-meta__category">{{ project.category }}</span>
            <span class="detail-meta__dot">•</span>
            <span>{{ project.year }}</span>
            <span class="detail-meta__dot">•</span>
            <span class="detail-meta__status">{{ project.status }}</span>
          </div>
          <h1 class="detail-title">{{ project.title }}</h1>
          <p class="detail-tagline">{{ project.description }}</p>

          <div class="d-flex flex-wrap ga-3 mt-6">
            <v-btn
              v-if="project.liveUrl"
              :href="project.liveUrl"
              target="_blank"
              color="accent"
              class="text-none px-6"
              prepend-icon="mdi-open-in-new"
            >
              Live demo
            </v-btn>
            <v-btn
              v-if="project.githubUrl"
              :href="project.githubUrl"
              target="_blank"
              variant="outlined"
              class="text-none px-6"
              prepend-icon="mdi-github"
            >
              View code
            </v-btn>
          </div>
        </div>

        <!-- Image -->
        <div class="detail-image mb-12">
          <v-img
            :src="project.image"
            height="440"
            cover
            :alt="`${project.title} preview`"
            loading="lazy"
          ></v-img>
        </div>

        <!-- About + Features -->
        <v-row>
          <v-col cols="12" md="7">
            <h2 class="block-title">About this project</h2>
            <p class="body-paragraph">{{ project.longDescription }}</p>
          </v-col>
          <v-col cols="12" md="5">
            <h2 class="block-title">Key features</h2>
            <ul class="feature-list">
              <li v-for="feature in project.features" :key="feature">
                <v-icon size="small" class="feature-list__mark">mdi-check-circle-outline</v-icon>
                <span>{{ feature }}</span>
              </li>
            </ul>
          </v-col>
        </v-row>

        <!-- Tech -->
        <h2 class="block-title mt-16 mb-8">Built with</h2>
        <Skills :skills="project.technologies" />
      </template>

      <!-- Not Found -->
      <div v-else class="text-center py-16">
        <v-icon size="96" class="not-found-icon mb-4">mdi-file-question-outline</v-icon>
        <h1 class="block-title">Project not found</h1>
        <p class="body-paragraph mb-6">The project you're looking for doesn't exist.</p>
        <v-btn to="/projects" color="accent" size="large" class="text-none px-6">
          View all projects
        </v-btn>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import Skills from '@/components/Skills.vue'

const route = useRoute()
const projectsStore = useProjectsStore()

const project = computed(() => {
  const id = parseInt(route.params.id as string)
  return projectsStore.getProjectById(id)
})
</script>

<style scoped>
.project-detail-page {
  padding: var(--section-py) 0;
  min-height: 100vh;
}

/* Header */
.detail-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--v-theme-on-surface-muted, #64748b);
  margin-bottom: 14px;
  text-transform: capitalize;
}

.detail-meta__category {
  color: rgb(var(--v-theme-accent));
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.detail-meta__dot {
  opacity: 0.5;
}

.detail-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(2rem, 5vw, 3.25rem);
  letter-spacing: -0.03em;
  line-height: 1.05;
  color: rgb(var(--v-theme-primary));
  margin-bottom: 16px;
}

.detail-tagline {
  font-size: 1.2rem;
  line-height: 1.6;
  color: rgb(var(--v-theme-secondary));
  max-width: 680px;
}

/* Image */
.detail-image {
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  border: 1px solid var(--v-theme-border, rgba(148, 163, 184, 0.25));
  box-shadow: var(--shadow-heavy);
}

/* Blocks */
.block-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(1.4rem, 2.5vw, 1.9rem);
  letter-spacing: -0.02em;
  color: rgb(var(--v-theme-primary));
  margin-bottom: 18px;
}

.body-paragraph {
  font-size: 1.05rem;
  line-height: 1.75;
  color: rgb(var(--v-theme-secondary));
}

/* Feature list */
.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
  font-size: 0.98rem;
  line-height: 1.6;
  color: rgb(var(--v-theme-secondary));
}

.feature-list__mark {
  color: rgb(var(--v-theme-accent));
  margin-top: 3px;
  flex-shrink: 0;
}

.not-found-icon {
  color: var(--v-theme-on-surface-muted, #64748b);
  opacity: 0.6;
}

@media (max-width: 600px) {
  .project-detail-page {
    padding: var(--section-py-mobile) 0;
  }
}
</style>
