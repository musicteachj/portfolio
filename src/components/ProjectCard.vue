<template>
  <v-card class="pcard d-flex flex-column" :class="{ 'pcard--ai': isAiProject }" @click="goToProject">
    <span class="pcard__accent" aria-hidden="true"></span>

    <!-- Media -->
    <div class="pcard__media">
      <v-img
        :src="project.image"
        :alt="project.title"
        :aspect-ratio="1.85"
        cover
        class="pcard__img"
        loading="lazy"
      >
        <template v-slot:placeholder>
          <div class="d-flex align-center justify-center fill-height">
            <v-progress-circular indeterminate color="accent"></v-progress-circular>
          </div>
        </template>
      </v-img>

      <v-chip :color="statusColor" size="x-small" variant="flat" class="pcard__status">
        {{ project.status }}
      </v-chip>

      <v-chip
        v-if="isAiProject"
        color="accent"
        size="x-small"
        variant="flat"
        prepend-icon="mdi-creation"
        class="pcard__ai"
        title="AI-powered project"
      >
        AI
      </v-chip>

      <!-- Hover overlay -->
      <div class="pcard__overlay">
        <div class="pcard__actions">
          <v-btn
            v-if="project.liveUrl && project.status === 'completed'"
            :href="project.liveUrl"
            target="_blank"
            @click.stop
            icon="mdi-open-in-new"
            size="small"
            variant="flat"
            color="white"
            :title="`View ${project.title} live`"
          ></v-btn>
          <v-btn
            v-if="project.githubUrl"
            :href="project.githubUrl"
            target="_blank"
            @click.stop
            icon="mdi-github"
            size="small"
            variant="flat"
            color="white"
            :title="`View ${project.title} source`"
          ></v-btn>
        </div>
      </div>
    </div>

    <!-- Body -->
    <div class="pcard__body">
      <div class="pcard__meta">
        <span class="pcard__category">{{ project.category }}</span>
        <span class="pcard__year">{{ project.year }}</span>
      </div>

      <h3 class="pcard__title">{{ project.title }}</h3>
      <p class="pcard__desc">{{ project.description }}</p>

      <div class="pcard__tech">
        <span v-for="tech in displayedTechnologies" :key="tech" class="tech-tag">{{ tech }}</span>
        <span v-if="remainingTechCount > 0" class="tech-tag tech-tag--more">
          +{{ remainingTechCount }}
        </span>
      </div>

      <div class="pcard__footer">
        <span v-if="showDetailsLink" class="pcard__link">
          View details
          <v-icon size="small">mdi-arrow-right</v-icon>
        </span>
        <div class="pcard__viewports">
          <v-icon
            v-for="viewport in project.viewport"
            :key="viewport"
            :icon="getViewportIcon(viewport)"
            size="x-small"
            :title="`Optimized for ${viewport}`"
          ></v-icon>
        </div>
      </div>
    </div>
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
  maxTechDisplay: 3,
})

const router = useRouter()

const isAiProject = computed(() =>
  props.project.technologies.some((category) => category.category === 'AI & Agentic Development'),
)

const allTechnologies = computed(() =>
  props.project.technologies.flatMap((category) => category.skills),
)

const displayedTechnologies = computed(() => allTechnologies.value.slice(0, props.maxTechDisplay))

const remainingTechCount = computed(() => {
  const total = allTechnologies.value.length
  return total > props.maxTechDisplay ? total - props.maxTechDisplay : 0
})

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

const goToProject = (): void => {
  if (props.showDetailsLink) {
    router.push(`/projects/${props.project.id}`)
  }
}
</script>

<style scoped>
.pcard {
  position: relative;
  height: 100%;
  min-height: 460px;
  cursor: pointer;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
  border: 1px solid var(--v-theme-border, rgba(148, 163, 184, 0.25));
  box-shadow: var(--shadow-light);
  transition:
    transform 0.3s var(--ease-out),
    box-shadow 0.3s var(--ease-out),
    border-color 0.3s var(--ease-out);
}

.pcard:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-heavy);
  border-color: rgb(var(--v-theme-accent));
}

/* AI projects read as distinct even before hover */
.pcard--ai {
  border-color: rgba(var(--v-theme-accent), 0.45);
}

/* Left accent bar slides in on hover */
.pcard__accent {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 3px;
  background: rgb(var(--v-theme-accent));
  transform: scaleY(0);
  transform-origin: top;
  transition: transform 0.35s var(--ease-out);
  z-index: 3;
}

.pcard:hover .pcard__accent {
  transform: scaleY(1);
}

/* Media */
.pcard__media {
  position: relative;
  overflow: hidden;
}

.pcard__img {
  transition: transform 0.5s var(--ease-out);
}

.pcard:hover .pcard__img {
  transform: scale(1.07);
}

.pcard__status {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  font-family: var(--font-mono);
  font-size: 0.65rem;
  text-transform: capitalize;
}

.pcard__ai {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  font-family: var(--font-mono);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.06em;
}

.pcard__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, rgba(11, 18, 32, 0.1) 0%, rgba(11, 18, 32, 0.65) 100%);
  opacity: 0;
  transition: opacity 0.3s var(--ease-out);
}

.pcard:hover .pcard__overlay {
  opacity: 1;
}

.pcard__actions {
  display: flex;
  gap: 10px;
  transform: translateY(8px);
  transition: transform 0.3s var(--ease-out);
}

.pcard:hover .pcard__actions {
  transform: translateY(0);
}

/* Body */
.pcard__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 20px 22px 22px;
}

.pcard__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.pcard__category {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-accent));
}

.pcard__year {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--v-theme-on-surface-muted, #64748b);
  opacity: 0.8;
}

.pcard__title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.2rem;
  letter-spacing: -0.02em;
  line-height: 1.25;
  color: rgb(var(--v-theme-primary));
  margin-bottom: 10px;
  transition: color 0.25s var(--ease-out);
}

.pcard:hover .pcard__title {
  color: rgb(var(--v-theme-accent));
}

.pcard__desc {
  font-size: 0.92rem;
  line-height: 1.6;
  color: rgb(var(--v-theme-secondary));
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pcard__tech {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 18px;
}

.tech-tag {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  padding: 3px 9px;
  border-radius: 6px;
  color: rgb(var(--v-theme-secondary));
  background: rgb(var(--v-theme-surface-variant));
  border: 1px solid var(--v-theme-border, rgba(148, 163, 184, 0.2));
}

.tech-tag--more {
  color: rgb(var(--v-theme-accent));
}

.pcard__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid var(--v-theme-border, rgba(148, 163, 184, 0.18));
}

.pcard__link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  transition:
    gap 0.25s var(--ease-out),
    color 0.25s var(--ease-out);
}

.pcard:hover .pcard__link {
  color: rgb(var(--v-theme-accent));
  gap: 10px;
}

.pcard__viewports {
  display: flex;
  gap: 6px;
  color: var(--v-theme-on-surface-muted, #64748b);
  opacity: 0.7;
}
</style>
