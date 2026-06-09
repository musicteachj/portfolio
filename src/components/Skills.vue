<template>
  <div class="skills-bento">
    <div
      v-for="(skillCategory, i) in skills"
      :key="skillCategory.category"
      class="skill-cell"
      :style="{ gridColumn: `span ${spanFor(i)}` }"
    >
      <div class="skill-cell__head">
        <span class="skill-cell__icon">
          <v-icon size="26">{{ skillCategory.icon }}</v-icon>
        </span>
        <h3 class="skill-cell__title">{{ skillCategory.category }}</h3>
      </div>

      <div class="skill-cell__chips">
        <span v-for="skill in skillCategory.skills" :key="skill" class="tech-tag">
          {{ skill }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSkillsStore } from '@/stores/skills'
import type { Skill } from '@/types'

const skillsStore = useSkillsStore()

const props = defineProps<{
  skills?: Skill[]
}>()

const skills = computed(() => {
  if (props.skills && props.skills.length > 0) {
    return props.skills
  }
  return skillsStore.skillsList
})

// Bento column spans (6-col grid). Pattern keeps rows balanced for 6 categories.
const spanPattern = [2, 4, 3, 3, 4, 2]
const spanFor = (index: number): number => spanPattern[index % spanPattern.length] ?? 2
</script>

<style scoped>
.skills-bento {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
}

.skill-cell {
  background: rgb(var(--v-theme-surface));
  border: 1px solid var(--v-theme-border, rgba(148, 163, 184, 0.25));
  border-radius: var(--border-radius-lg);
  padding: 24px;
  transition:
    transform 0.3s var(--ease-out),
    box-shadow 0.3s var(--ease-out),
    border-color 0.3s var(--ease-out);
}

.skill-cell:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-medium);
  border-color: rgba(var(--v-theme-accent), 0.4);
}

.skill-cell__head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}

.skill-cell__icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  flex-shrink: 0;
  color: rgb(var(--v-theme-accent));
  background: rgba(var(--v-theme-accent), 0.1);
}

.skill-cell__title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.05rem;
  letter-spacing: -0.01em;
  color: rgb(var(--v-theme-primary));
  position: relative;
  padding-bottom: 6px;
}

.skill-cell__title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 28px;
  height: 2px;
  border-radius: 2px;
  background: rgb(var(--v-theme-accent));
}

.skill-cell__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-tag {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  padding: 4px 10px;
  border-radius: 6px;
  color: rgb(var(--v-theme-secondary));
  background: rgb(var(--v-theme-surface-variant));
  border: 1px solid var(--v-theme-border, rgba(148, 163, 184, 0.2));
  transition:
    color 0.2s var(--ease-out),
    border-color 0.2s var(--ease-out);
}

.skill-cell:hover .tech-tag {
  border-color: rgba(var(--v-theme-accent), 0.35);
}

/* Tablet: collapse to 2-up (each cell spans 3 of 6) */
@media (max-width: 1100px) {
  .skill-cell {
    grid-column: span 3 !important;
  }
}

/* Mobile: single column */
@media (max-width: 700px) {
  .skills-bento {
    grid-template-columns: 1fr;
  }
  .skill-cell {
    grid-column: span 1 !important;
  }
}
</style>
