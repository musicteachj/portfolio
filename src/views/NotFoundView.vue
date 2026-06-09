<template>
  <div class="not-found-page">
    <v-container>
      <div class="not-found">
        <p class="not-found__code">404</p>
        <h1 class="not-found__title">Page not found</h1>
        <p class="not-found__desc">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div class="d-flex justify-center flex-wrap ga-4 mt-2">
          <v-btn to="/" color="accent" size="large" class="text-none px-6" prepend-icon="mdi-home-outline">
            Go home
          </v-btn>
          <v-btn
            to="/projects"
            variant="outlined"
            size="large"
            class="text-none px-6"
            prepend-icon="mdi-code-braces"
          >
            View projects
          </v-btn>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.not-found {
  text-align: center;
  max-width: 520px;
  margin: 0 auto;
}

.not-found__code {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(6rem, 22vw, 12rem);
  line-height: 1;
  letter-spacing: -0.04em;
  margin: 0;
  background: linear-gradient(135deg, rgb(var(--v-theme-accent)) 0%, #93c5fd 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.not-found__title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  letter-spacing: -0.02em;
  color: rgb(var(--v-theme-primary));
  margin: 8px 0 16px;
}

.not-found__desc {
  font-size: 1.05rem;
  line-height: 1.6;
  color: rgb(var(--v-theme-secondary));
  margin-bottom: 24px;
}
</style>
