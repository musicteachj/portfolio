<template>
  <v-footer class="bg-grey-darken-4" app height="100">
    <v-container>
      <v-row align="center" justify="center">
        <v-col cols="12" class="text-center">
          <div class="d-flex justify-center align-center flex-wrap ga-8 mb-0 mt-n4">
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
          <p class="text-body-2 mb-0">© {{ currentYear }} James Littlefield</p>
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
    url: 'https://github.com/musicteachj',
    icon: 'mdi-github',
    color: 'white',
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/james-littlefield-93037713b/',
    icon: 'mdi-linkedin',
    color: 'blue',
  },
  {
    name: 'Email',
    url: 'mailto:jameslittlefield3@gmail.com',
    icon: 'mdi-email',
    color: 'white',
  },
]
</script>
