<template>
  <v-app>
    <AppNavigation />
    <v-main>
      <router-view />
    </v-main>
    <AppFooter />

    <!-- Global Snackbar -->
    <v-snackbar
      v-model="snackbarStore.show"
      :color="snackbarStore.color"
      :timeout="snackbarStore.timeout"
      location="top"
    >
      {{ snackbarStore.message }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbarStore.hide()"> Close </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import AppNavigation from '@/components/layout/AppNavigation.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { useSnackbarStore } from '@/stores/snackbar'

const snackbarStore = useSnackbarStore()
</script>

<style>
/* Global styles */
html {
  scroll-behavior: smooth;
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  min-height: 100vh;
}

.section-spacing {
  padding: 80px 0;
}

.project-card {
  transition:
    transform 0.3s ease-in-out,
    box-shadow 0.3s ease-in-out;
}

.project-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.skill-chip {
  margin: 4px;
}

.fade-in {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.6s ease-out,
    transform 0.6s ease-out;
}

.fade-in.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #1976d2;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #1565c0;
}
</style>
