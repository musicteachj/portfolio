<template>
  <div class="not-found-page">
    <v-container>
      <v-row align="center" justify="center" style="min-height: 80vh">
        <v-col cols="12" md="6" class="text-center">
          <v-icon size="150" color="primary" class="mb-6"> mdi-file-question-outline </v-icon>

          <h1 class="text-h1 font-weight-bold mb-4">404</h1>
          <h2 class="text-h3 mb-4">Page Not Found</h2>
          <p class="text-h6 mb-8" style="opacity: 0.8">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div class="d-flex justify-center flex-wrap ga-4">
            <v-btn to="/" color="primary" size="large" prepend-icon="mdi-home"> Go Home </v-btn>
            <v-btn to="/projects" color="secondary" size="large" prepend-icon="mdi-code-braces">
              View Projects
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
// 404 page - no logic needed
</script>

<style scoped>
.not-found-page {
  padding: 80px 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
}
</style>
