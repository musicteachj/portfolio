<template>
  <v-app-bar
    :class="['app-nav', { 'app-nav--scrolled': scrolled, 'app-nav--on-hero': onHero }]"
    color="transparent"
    flat
    fixed
    app
  >
    <v-container class="d-flex align-center py-0">
      <!-- Brand mark -->
      <router-link to="/" class="brand" aria-label="Home">
        <span class="brand__bracket">&lt;</span><span class="brand__name">JL</span
        ><span class="brand__bracket">/&gt;</span>
      </router-link>

      <v-spacer></v-spacer>

      <!-- Desktop Navigation -->
      <nav v-if="!mobile" class="d-flex align-center ga-1">
        <router-link
          v-for="item in navItems"
          :key="item.title"
          :to="item.to"
          class="nav-link"
          active-class="nav-link--active"
        >
          {{ item.title }}
        </router-link>

        <v-btn
          icon
          variant="text"
          size="small"
          class="ml-3 theme-toggle"
          @click="toggleTheme"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
        </v-btn>
      </nav>

      <!-- Mobile controls -->
      <template v-else>
        <v-btn
          icon
          variant="text"
          size="small"
          class="theme-toggle mr-1"
          @click="toggleTheme"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
        </v-btn>
        <v-app-bar-nav-icon class="theme-toggle" @click="drawer = !drawer"></v-app-bar-nav-icon>
      </template>
    </v-container>
  </v-app-bar>

  <!-- Mobile Navigation Drawer -->
  <v-navigation-drawer v-model="drawer" temporary location="right" width="280">
    <div class="pa-4">
      <span class="brand brand--drawer">
        <span class="brand__bracket">&lt;</span>JL<span class="brand__bracket">/&gt;</span>
      </span>
    </div>
    <v-divider></v-divider>
    <v-list nav class="px-2 pt-2">
      <v-list-item
        v-for="item in navItems"
        :key="item.title"
        :to="item.to"
        rounded="lg"
        class="drawer-item"
        active-class="drawer-item--active"
        @click="drawer = false"
      >
        <template v-slot:prepend>
          <v-icon size="small">{{ item.icon }}</v-icon>
        </template>
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDisplay, useTheme } from 'vuetify'
import { useRoute } from 'vue-router'
import type { NavigationItem } from '@/types'

const { mobile } = useDisplay()
const theme = useTheme()
const route = useRoute()

const drawer = ref<boolean>(false)
const scrolled = ref<boolean>(false)

const isDark = computed(() => theme.global.name.value === 'dark')
// On the home hero (top of page), the nav floats over the dark gradient.
// Guard route access so the component is safe to mount without a router (tests).
const onHero = computed(() => route?.name === 'home' && !scrolled.value)

const navItems: NavigationItem[] = [
  { title: 'Home', to: '/', icon: 'mdi-home-outline' },
  { title: 'About', to: '/about', icon: 'mdi-account-outline' },
  { title: 'Experience', to: '/experience', icon: 'mdi-briefcase-outline' },
  { title: 'Projects', to: '/projects', icon: 'mdi-code-braces' },
  { title: 'Contact', to: '/contact', icon: 'mdi-email-outline' },
]

const handleScroll = (): void => {
  scrolled.value = window.scrollY > 40
}

const toggleTheme = (): void => {
  const newTheme = theme.global.current.value.dark ? 'light' : 'dark'
  theme.global.name.value = newTheme
  localStorage.setItem('theme', newTheme)
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()

  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'light' || savedTheme === 'dark') {
    theme.global.name.value = savedTheme
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.app-nav {
  transition:
    background-color 0.35s var(--ease-out),
    backdrop-filter 0.35s var(--ease-out),
    border-color 0.35s var(--ease-out);
  border-bottom: 1px solid transparent;
}

/* Frosted glass once the user scrolls */
.app-nav--scrolled {
  background-color: rgba(var(--v-theme-surface), 0.8) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom-color: rgba(var(--v-theme-on-surface), 0.08);
}

/* Brand mark */
.brand {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.35rem;
  letter-spacing: -0.03em;
  text-decoration: none;
  color: rgb(var(--v-theme-primary));
  transition: opacity 0.2s var(--ease-out);
}

.brand:hover {
  opacity: 0.8;
}

.brand__bracket {
  color: rgb(var(--v-theme-accent));
}

.brand--drawer {
  font-size: 1.5rem;
}

/* Desktop nav links with sliding underline */
.nav-link {
  position: relative;
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: none;
  color: rgb(var(--v-theme-primary));
  padding: 6px 12px;
  opacity: 0.75;
  transition:
    opacity 0.2s var(--ease-out),
    color 0.2s var(--ease-out);
}

.nav-link::after {
  content: '';
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 0;
  height: 2px;
  background: rgb(var(--v-theme-accent));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.28s var(--ease-out);
}

.nav-link:hover {
  opacity: 1;
}

.nav-link:hover::after {
  transform: scaleX(1);
}

.nav-link--active {
  opacity: 1;
  color: rgb(var(--v-theme-accent));
  font-weight: 600;
}

.nav-link--active::after {
  transform: scaleX(1);
}

.theme-toggle {
  color: rgb(var(--v-theme-primary));
}

/* On the home hero, force light controls over the dark gradient */
.app-nav--on-hero .brand,
.app-nav--on-hero .nav-link,
.app-nav--on-hero .theme-toggle {
  color: #f8fafc;
}

.app-nav--on-hero .brand__bracket,
.app-nav--on-hero .nav-link--active {
  color: #93c5fd;
}

/* Drawer items */
.drawer-item--active {
  color: rgb(var(--v-theme-accent));
  border-left: 3px solid rgb(var(--v-theme-accent));
}
</style>
