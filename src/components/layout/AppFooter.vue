<template>
  <v-footer class="site-footer">
    <v-container class="py-6">
      <div class="site-footer__inner">
        <router-link to="/" class="site-footer__brand" aria-label="Home">
          <span class="bracket">&lt;</span>JL<span class="bracket">/&gt;</span>
        </router-link>

        <div class="site-footer__socials">
          <a
            v-for="social in socialLinks"
            :key="social.name"
            :href="social.url"
            target="_blank"
            rel="noopener"
            class="site-footer__social"
            :title="`Visit my ${social.name}`"
            :aria-label="social.name"
          >
            <v-icon>{{ social.icon }}</v-icon>
          </a>
        </div>

        <p class="site-footer__copy">© {{ currentYear }} James Littlefield</p>
      </div>
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
    color: 'white',
  },
  {
    name: 'Email',
    url: 'mailto:jameslittlefield3@gmail.com',
    icon: 'mdi-email',
    color: 'white',
  },
]
</script>

<style scoped>
.site-footer {
  background: rgb(var(--v-theme-surface-variant));
  border-top: 1px solid var(--v-theme-border, rgba(148, 163, 184, 0.25));
}

.site-footer__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.site-footer__brand {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: -0.03em;
  text-decoration: none;
  color: rgb(var(--v-theme-primary));
}

.bracket {
  color: rgb(var(--v-theme-accent));
}

.site-footer__socials {
  display: flex;
  gap: 8px;
}

.site-footer__social {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  color: rgb(var(--v-theme-secondary));
  transition:
    color 0.22s var(--ease-out),
    background-color 0.22s var(--ease-out),
    transform 0.22s var(--ease-out);
}

.site-footer__social:hover {
  color: rgb(var(--v-theme-accent));
  background: rgba(var(--v-theme-accent), 0.1);
  transform: translateY(-2px);
}

.site-footer__copy {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--v-theme-on-surface-muted, #64748b);
  margin: 0;
}

@media (max-width: 600px) {
  .site-footer__inner {
    flex-direction: column;
    text-align: center;
  }
}
</style>
