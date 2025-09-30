<template>
  <v-app-bar
    :elevation="scrolled ? 4 : 0"
    :color="isDark ? (scrolled ? 'black' : 'transparent') : scrolled ? 'white' : 'transparent'"
    :theme="isDark ? 'dark' : 'light'"
    fixed
    app
  >
    <v-app-bar-title>
      <router-link
        to="/"
        :class="isDark ? 'text-white' : 'text-primary'"
        class="font-weight-bold text-decoration-none"
      >
        James Littlefield
      </router-link>
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <!-- Theme Toggle -->
    <v-btn
      icon
      @click="toggleTheme"
      :color="isDark ? 'white' : 'primary'"
      class="mr-2"
      :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    >
      <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
    </v-btn>

    <!-- Mobile Navigation -->
    <v-app-bar-nav-icon
      v-if="mobile"
      @click="drawer = !drawer"
      :color="isDark ? 'white' : 'primary'"
    ></v-app-bar-nav-icon>

    <!-- Desktop Navigation -->
    <div v-if="!mobile" class="d-flex">
      <v-btn
        v-for="item in navItems"
        :key="item.title"
        :to="item.to"
        :color="isDark ? 'white' : 'primary'"
        variant="text"
        class="mx-1"
      >
        {{ item.title }}
      </v-btn>
    </div>
  </v-app-bar>

  <!-- Mobile Navigation Drawer -->
  <v-navigation-drawer v-model="drawer" temporary location="right">
    <v-list>
      <v-list-item v-for="item in navItems" :key="item.title" :to="item.to" @click="drawer = false">
        <template v-slot:prepend>
          <v-icon>{{ item.icon }}</v-icon>
        </template>
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>

      <v-divider class="my-2"></v-divider>

      <v-list-item @click="toggleTheme">
        <template v-slot:prepend>
          <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
        </template>
        <v-list-item-title>
          {{ isDark ? 'Light Mode' : 'Dark Mode' }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDisplay, useTheme } from 'vuetify'
import type { NavigationItem } from '@/types'

const { mobile } = useDisplay()
const theme = useTheme()

const drawer = ref<boolean>(false)
const scrolled = ref<boolean>(false)

const isDark = computed(() => theme.global.name.value === 'dark')

const navItems: NavigationItem[] = [
  { title: 'Home', to: '/', icon: 'mdi-home' },
  { title: 'About', to: '/about', icon: 'mdi-account' },
  { title: 'Experience', to: '/experience', icon: 'mdi-briefcase' },
  { title: 'Projects', to: '/projects', icon: 'mdi-code-braces' },
  { title: 'Contact', to: '/contact', icon: 'mdi-email' },
]

const handleScroll = (): void => {
  scrolled.value = window.scrollY > 50
}

const toggleTheme = (): void => {
  const newTheme = theme.global.current.value.dark ? 'light' : 'dark'
  theme.global.name.value = newTheme
  localStorage.setItem('theme', newTheme)
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)

  // Load saved theme preference
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
    theme.global.name.value = savedTheme
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
