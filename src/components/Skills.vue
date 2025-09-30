<template>
  <v-row>
    <v-col v-for="skillCategory in skills" :key="skillCategory.category" cols="12" md="4">
      <v-card elevation="6" class="pa-6 fill-height">
        <div class="text-center mb-4">
          <v-icon :color="skillCategory.color" size="48">
            {{ skillCategory.icon }}
          </v-icon>
          <h3 class="text-h5 mt-2">{{ skillCategory.category }}</h3>
        </div>
        <v-chip
          v-for="skill in skillCategory.skills"
          :key="skill"
          :color="skillCategory.color"
          variant="outlined"
          class="mr-2 mb-2"
        >
          {{ skill }}
        </v-chip>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSkillsStore } from '@/stores/skills'
import type { Skill } from '@/types'

const skillsStore = useSkillsStore()

// skills prop is optional
const props = defineProps<{
  skills?: Skill[]
}>()

const skills = computed(() => {
  // if props.skills is not empty, return props.skills
  if (props.skills && props.skills.length > 0) {
    return props.skills
  }
  // otherwise, return skillsStore.skillsList
  return skillsStore.skillsList
})
</script>

<style scoped></style>
