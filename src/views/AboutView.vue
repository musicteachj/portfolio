<template>
  <div class="about-page">
    <v-container>
      <v-row>
        <v-col cols="12">
          <div class="text-center mb-8">
            <h1 class="text-h2 font-weight-bold mb-4">About Me</h1>
            <p class="text-h6" style="opacity: 0.8">
              Get to know more about my background and journey
            </p>
          </div>
        </v-col>

        <v-col cols="12" md="8" offset-md="2">
          <v-card elevation="8" class="pa-8">
            <h2 class="text-h4 mb-6">My Story</h2>
            <p class="text-body-1 mb-4">
              I'm a passionate full-stack developer with {{ yearsOfExperience }} years of experience
              creating web applications that solve real-world problems. My journey in tech started
              with curiosity about how websites work, and it has evolved into a career focused on
              creating intuitive, performant, and scalable applications.
            </p>
            <p class="text-body-1 mb-4">
              I specialize in modern web technologies including Vue.js, React, TypeScript, and
              Node.js. I believe in writing clean, maintainable code and following best practices to
              deliver high-quality solutions.
            </p>
            <p class="text-body-1 mb-6">
              When I'm not coding, you can find me contributing to open source projects, reading
              tech blogs, or exploring new hiking trails. I'm always eager to learn new technologies
              and take on challenging projects.
            </p>

            <div class="text-center">
              <v-btn to="/" color="primary" size="large" prepend-icon="mdi-arrow-left">
                Back to Home
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const yearsOfExperience = ref(3)
</script>

<style scoped>
.about-page {
  padding: 80px 0;
  min-height: 100vh;
}
</style>
