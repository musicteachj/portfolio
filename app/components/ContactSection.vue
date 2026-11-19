<script setup lang="ts">
import { site } from '~/data/site'

const emailHref = useEmailHref()
</script>

<template>
  <section id="contact" class="contact" aria-labelledby="contact-h">
    <div class="wrap contact-grid">
      <div>
        <h2 id="contact-h" tabindex="-1">Contact</h2>
        <p>Send a message here, or reach me directly.</p>
        <ul class="direct" role="list">
          <li><a :href="emailHref">Email</a></li>
          <li><a :href="site.linkedinUrl">LinkedIn</a></li>
          <li><a :href="site.githubUrl">GitHub</a></li>
          <li><a :href="site.resumePath">Résumé (PDF)</a></li>
        </ul>
      </div>
      <ContactForm />
    </div>
  </section>
</template>

<style scoped>
.contact { padding: var(--s-8) 0; border-top: 1px solid var(--line); background: var(--surface); scroll-margin-top: 0; }
.contact-grid { display: grid; grid-template-columns: 1fr; gap: var(--s-6); }
@media (min-width: 900px) { .contact-grid { grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); gap: var(--s-8); align-items: start; } }
.contact h2 { font-size: var(--t-h2); letter-spacing: -0.028em; }
.contact-grid > div > p { margin-top: var(--s-3); color: var(--ink-2); }
.direct { list-style: none; margin-top: var(--s-5); border-top: 2px solid var(--mark); }
@media (min-width: 600px) and (max-width: 899px) { .direct { display: grid; grid-template-columns: 1fr 1fr; column-gap: var(--s-6); } }
.direct li { border-bottom: 1px solid var(--line); }
.direct a { display: flex; align-items: center; min-height: 48px; font-weight: 500; text-decoration: none; }
.direct a:hover { text-decoration: underline; }
</style>
