<template>
  <v-card
    class="project-card fill-height d-flex flex-column"
    elevation="6"
    @click="goToProject"
    style="cursor: pointer; height: 100%"
  >
    <v-img
      :src="project.image"
      height="200"
      cover
      class="project-image"
      :alt="`${project.title}`"
      loading="lazy"
    >
      <template v-slot:placeholder>
        <div class="d-flex align-center justify-center fill-height">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
      </template>

      <!-- Project Status Badge -->
      <v-chip
        :color="statusColor"
        size="small"
        class="ma-2"
        style="position: absolute; top: 0; left: 0"
      >
        {{ project.status }}
      </v-chip>

      <!-- Overlay with action buttons -->
      <div class="project-overlay">
        <div class="d-flex ga-2">
          <v-btn
            v-if="project.liveUrl && project.status === 'completed'"
            :href="project.liveUrl"
            target="_blank"
            @click.stop
            icon="mdi-open-in-new"
            color="white"
            size="small"
            :title="`View ${project.title} live demo`"
          ></v-btn>
          <v-btn
            v-if="project.githubUrl"
            :href="project.githubUrl"
            target="_blank"
            @click.stop
            icon="mdi-github"
            color="white"
            size="small"
            :title="`View ${project.title} source code`"
          ></v-btn>
        </div>
      </div>
    </v-img>

    <!-- Fixed height title section -->
    <v-card-title class="text-h6 card-title-section">
      <div class="d-flex flex-column">
        <span class="title-text">{{ project.title }}</span>
        <v-chip
          :color="categoryColor"
          size="x-small"
          class="mt-1 align-self-start"
          variant="outlined"
        >
          {{ project.category }}
        </v-chip>
      </div>
    </v-card-title>

    <!-- Flexible content section that grows -->
    <v-card-text class="flex-grow-1 d-flex flex-column">
      <!-- Description with fixed height -->
      <div class="description-section mb-3">
        <p class="text-body-2 description-text">{{ project.description }}</p>
      </div>

      <!-- Technology chips with fixed height -->
      <div class="tech-section mb-2">
        <div class="d-flex flex-wrap ga-1">
          <v-chip
            v-for="tech in displayedTechnologies"
            :key="tech"
            size="x-small"
            color="primary"
            variant="outlined"
          >
            {{ tech }}
          </v-chip>
          <v-chip
            v-if="project.technologies.length > maxTechDisplay"
            size="x-small"
            color="grey"
            variant="outlined"
          >
            +{{ project.technologies.length - maxTechDisplay }}
          </v-chip>
        </div>
      </div>

      <!-- Viewport indicators -->
      <div class="d-flex align-center ga-2 mb-2">
        <div class="text-caption text-medium-emphasis">
          <v-icon size="small" class="mr-1">mdi-devices</v-icon>
          Supports:
        </div>
        <div class="d-flex ga-1">
          <v-icon
            v-for="viewport in project.viewport"
            :key="viewport"
            :icon="getViewportIcon(viewport)"
            size="small"
            :color="getViewportColor(viewport)"
            :title="`Optimized for ${viewport}`"
          ></v-icon>
        </div>
      </div>

      <!-- Spacer to push year to bottom of content area -->
      <v-spacer></v-spacer>

      <!-- Year at bottom of content -->
      <div class="text-caption text-medium-emphasis">
        <v-icon size="small" class="mr-1">mdi-calendar</v-icon>
        {{ project.year }}
      </div>
    </v-card-text>

    <v-card-actions>
      <v-btn
        v-if="showDetailsLink"
        color="primary"
        variant="text"
        @click.stop="goToProject"
        append-icon="mdi-arrow-right"
      >
        View Details
      </v-btn>

      <v-spacer></v-spacer>

      <v-btn
        v-if="project.liveUrl && project.status === 'completed'"
        :href="project.liveUrl"
        target="_blank"
        @click.stop
        color="primary"
        variant="outlined"
        size="small"
        prepend-icon="mdi-open-in-new"
      >
        Live Demo
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Project } from '@/types'

interface Props {
  project: Project
  showDetailsLink?: boolean
  maxTechDisplay?: number
}

const props = withDefaults(defineProps<Props>(), {
  showDetailsLink: true,
  maxTechDisplay: 4,
})

const router = useRouter()

const displayedTechnologies = computed(() =>
  props.project.technologies[1].skills.slice(0, props.maxTechDisplay),
)

const statusColor = computed(() => {
  switch (props.project.status) {
    case 'completed':
      return 'success'
    case 'in-progress':
      return 'warning'
    case 'maintained':
      return 'info'
    default:
      return 'grey'
  }
})

const categoryColor = computed(() => {
  switch (props.project.category) {
    case 'Full Stack':
      return 'primary'
    case 'Frontend':
      return 'success'
    case 'Backend':
      return 'info'
    case 'Mobile':
      return 'warning'
    case 'Design':
      return 'purple'
    default:
      return 'grey'
  }
})

const getViewportIcon = (viewport: string): string => {
  switch (viewport) {
    case 'mobile':
      return 'mdi-cellphone'
    case 'tablet':
      return 'mdi-tablet'
    case 'desktop':
      return 'mdi-monitor'
    default:
      return 'mdi-devices'
  }
}

const getViewportColor = (viewport: string): string => {
  switch (viewport) {
    case 'mobile':
      return 'success'
    case 'tablet':
      return 'warning'
    case 'desktop':
      return 'info'
    default:
      return 'grey'
  }
}

const goToProject = (): void => {
  if (props.showDetailsLink) {
    router.push(`/projects/${props.project.id}`)
  }
}
</script>

<style scoped>
.project-card {
  transition:
    transform 0.3s ease-in-out,
    box-shadow 0.3s ease-in-out;
  min-height: 500px; /* Ensure minimum height for uniformity */
}

.project-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15) !important;
}

.project-image {
  position: relative;
  flex-shrink: 0; /* Prevent image from shrinking */
}

.project-overlay {
  position: absolute;
  top: 16px;
  right: 16px;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.project-card:hover .project-overlay {
  opacity: 1;
}

/* Fixed height sections for uniformity */
.card-title-section {
  min-height: 64px; /* Fixed height for title area */
  flex-shrink: 0;
}

.title-text {
  line-height: 1.2;
}

.description-section {
  min-height: 96px; /* Fixed height for description to maintain card uniformity */
  display: flex;
  align-items: flex-start;
}

.description-text {
  line-height: 1.4;
}

.tech-section {
  min-height: 40px; /* Fixed height for technology chips */
  display: flex;
  align-items: flex-start;
}

/* Ensure card actions are always at the bottom */
.v-card-actions {
  margin-top: auto;
  flex-shrink: 0;
}
</style>
