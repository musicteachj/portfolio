<template>
  <v-row>
    <v-col
      v-for="skillCategory in skillsStore.skillsList"
      :key="skillCategory.category"
      cols="12"
      md="4"
    >
      <v-card elevation="6" class="pa-6 fill-height">
        <div class="text-center mb-4">
          <v-icon :color="skillCategory.color" size="48">
            {{ skillCategory.icon }}
          </v-icon>
          <h3 class="text-h5 mt-2">{{ skillCategory.category }}</h3>
        </div>
        <v-list density="compact">
          <v-list-item v-for="skill in skillCategory.skills" :key="skill" class="px-0">
            <template v-slot:prepend>
              <v-icon :color="skillCategory.color" size="small">mdi-check-circle</v-icon>
            </template>
            <v-list-item-title class="text-body-1">{{ skill }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useSkillsStore } from '@/stores/skills'

const skillsStore = useSkillsStore()
</script>

<style scoped></style>
