<script setup lang="ts">
import { site } from '~/data/site'

const emailHref = useEmailHref()
</script>

<template>
  <section class="hero" aria-labelledby="hero-name">
    <div class="wrap hero-grid">
      <div class="intro">
        <h1 id="hero-name">{{ site.name }}</h1>
        <p class="hero-role">{{ site.role }}</p>
        <p class="hero-lede">{{ site.lede }}</p>
        <p class="hero-support">{{ site.support }}</p>
        <p class="status">{{ site.status }}</p>
        <div class="actions">
          <a class="btn btn--primary" :href="site.resumePath">Résumé (PDF)</a>
          <a class="btn" :href="emailHref">Email</a>
          <a class="btn" :href="site.githubUrl">GitHub</a>
          <a class="btn" :href="site.linkedinUrl">LinkedIn</a>
        </div>
      </div>
      <div class="portrait-wrap">
        <div class="portrait-stage">
          <NuxtImg
            class="portrait"
            src="/images/james.jpg"
            width="628"
            height="640"
            :alt="site.name"
            loading="eager"
            fetchpriority="high"
            sizes="xs:90px sm:200px md:256px lg:256px"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero { padding: var(--s-8) 0; }
.hero-grid { display: grid; grid-template-columns: minmax(0, 1fr) clamp(220px, 26vw, 300px); gap: clamp(32px, 6vw, 72px); align-items: center; }
.hero h1 { font-size: var(--t-display); letter-spacing: -0.035em; line-height: 1.02; }
.hero-role { font-size: var(--t-display); letter-spacing: -0.035em; line-height: 1.02; font-weight: 600; color: var(--ink-3); }
.hero-lede { font-size: var(--t-lede); line-height: 1.5; margin-top: var(--s-6); max-width: 40ch; }
.hero-support { margin-top: var(--s-3); color: var(--ink-2); font-size: var(--t-small); }
.hero .status { margin-top: var(--s-5); }
.portrait-stage { background: var(--soft); border-radius: var(--r-stage); padding: clamp(10px, 2vw, 22px); }
.portrait { width: 100%; aspect-ratio: 1; object-fit: cover; object-position: 50% 30%; border-radius: var(--r-frame); }
@media (max-width: 699px) {
  .hero { padding: var(--s-6) 0 var(--s-7); }
  .hero-grid { grid-template-columns: 1fr; gap: var(--s-5); }
  .portrait-wrap { order: -1; }
  .portrait-stage { width: 104px; padding: 7px; border-radius: 12px; }
  .portrait { border-radius: 7px; }
  .hero-lede { margin-top: var(--s-5); }
}
@media (prefers-reduced-motion: no-preference) {
  .intro > *, .portrait-wrap { opacity: 0; transform: translateY(8px); animation: settle 650ms var(--ease) forwards; }
  .intro > *:nth-child(2) { animation-delay: 50ms; }
  .intro > *:nth-child(3) { animation-delay: 100ms; }
  .intro > *:nth-child(4) { animation-delay: 150ms; }
  .intro > *:nth-child(5) { animation-delay: 200ms; }
  .intro > *:nth-child(6) { animation-delay: 250ms; }
  .portrait-wrap { animation-delay: 120ms; }
  @keyframes settle { to { opacity: 1; transform: none; } }
}
</style>
