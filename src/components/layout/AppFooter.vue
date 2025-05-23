<template>
  <v-footer class="bg-grey-darken-4" app>
    <v-container>
      <v-row align="center" justify="center">
        <v-col cols="12" class="text-center">
          <div class="d-flex justify-center align-center flex-wrap ga-4 mb-4">
            <v-btn
              v-for="social in socialLinks"
              :key="social.name"
              :href="social.url"
              target="_blank"
              :icon="social.icon"
              :color="social.color"
              variant="text"
              size="large"
              :title="`Visit my ${social.name}`"
            ></v-btn>
          </div>

          <p class="text-body-2 mb-0">
            © {{ currentYear }} Your Name. Built with
            <v-icon size="small" color="red" class="mx-1">mdi-heart</v-icon>
            using Vue 3, TypeScript & Vuetify 3.
          </p>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SocialLink } from '@/types'

const currentYear = computed(() => new Date().getFullYear())

const socialLinks: SocialLink[] = [
  {
    name: 'GitHub',
    url: 'https://github.com/yourusername',
    icon: 'mdi-github',
    color: 'white',
  },
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com/in/yourprofile',
    icon: 'mdi-linkedin',
    color: 'blue',
  },
  {
    name: 'Twitter',
    url: 'https://twitter.com/yourhandle',
    icon: 'mdi-twitter',
    color: 'blue',
  },
  {
    name: 'Email',
    url: 'mailto:your.email@example.com',
    icon: 'mdi-email',
    color: 'white',
  },
]
</script>
