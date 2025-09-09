<template>
  <v-card
    class="project-card fill-height"
    elevation="6"
    @click="goToProject"
    style="cursor: pointer"
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
            v-if="project.liveUrl"
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

    <v-card-title class="text-h6">
      {{ project.title }}
      <v-chip :color="categoryColor" size="x-small" class="ml-2" variant="outlined">
        {{ project.category }}
      </v-chip>
    </v-card-title>

    <v-card-text>
      <p class="text-body-2 mb-3">{{ project.description }}</p>

      <!-- Technology chips -->
      <div class="d-flex flex-wrap ga-1 mb-2">
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

      <!-- Year -->
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
        v-if="project.liveUrl"
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
  props.project.technologies.slice(0, props.maxTechDisplay),
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
}

.project-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15) !important;
}

.project-image {
  position: relative;
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
</style>
