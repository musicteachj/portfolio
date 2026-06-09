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

<script setup lang="ts">
import AppNavigation from '@/components/layout/AppNavigation.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { useSnackbarStore } from '@/stores/snackbar'

const snackbarStore = useSnackbarStore()
</script>

<style>
/* App-level shared classes. Tokens + scrollbar live in assets/main.css. */
.section-spacing {
  padding: var(--section-py) 0;
}

@media (max-width: 960px) {
  .section-spacing {
    padding: var(--section-py-mobile) 0;
  }
}

.skill-chip {
  margin: 4px;
}

/* Scroll-reveal classes used by views via IntersectionObserver.
   Aliased to the .reveal token behavior in main.css. */
.fade-in {
  opacity: 0;
  transform: translateY(28px);
  transition:
    opacity 0.7s var(--ease-out),
    transform 0.7s var(--ease-out);
}

.fade-in.visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .fade-in {
    opacity: 1;
    transform: none;
  }
}
</style>
