<template>
  <div class="about-page">
    <v-container>
      <!-- Header -->
      <div class="section-head mb-12">
        <p class="eyebrow mb-2">About</p>
        <h1 class="page-title">A bit about me</h1>
        <div class="accent-rule is-visible"></div>
        <p class="page-subtitle">Background, journey, and what I do when I'm away from the keyboard.</p>
      </div>

      <!-- My Story -->
      <v-row>
        <v-col cols="12" md="10" lg="9">
          <h2 class="block-title">My story</h2>
          <p class="lead-paragraph">
            My journey into software development began in an unexpected place: the innovative world
            of vertical farming at 80 Acres Farms.
          </p>
          <p class="body-paragraph">
            Starting as a Software Engineer in 2018, I discovered my passion for building technology
            that solves real-world problems — creating a comprehensive MRP system for indoor
            agriculture using Vue.js, Node.js, and PostgreSQL to manage the entire crop lifecycle
            from seeding to delivery. Over three years I designed an industry-standard packaging
            barcode system, built conveyor-belt applications with QR Code scanning, led the Vuetify
            UI migration from v1.5 to v2.3 across a monolithic legacy app, mentored junior
            developers, and contributed to the company's growth from Series A to Series B.
          </p>
          <p class="body-paragraph">
            In 2021, I joined KollaCode as a Full Stack Engineer, expanding into enterprise-scale
            applications serving IBM's global ecosystem. I built and maintained CTEBA — IBM's
            worldwide event management platform — led full-stack development of the EDIT application
            v2 with XLSX upload and AG Grid bulk editing, and wrote complex Cloudant DB queries
            backing Express.js APIs, all under strict IBM security standards including PII
            encryption, OIDC authentication, and audit logging.
          </p>
          <p class="body-paragraph">
            Promoted to Senior Full Stack Engineer in 2023, I led development on mission-critical IBM
            applications serving thousands of users worldwide — implementing automated CRON-based
            email tracking, leading the IBM Partner Plus Awards application with i18n for 11
            languages, architecting the IBM Amenities application with dual workflows and currency
            conversion, and integrating AI-based compliance tools that eliminated hundreds of manual
            support hours.
          </p>
          <p class="body-paragraph">
            After wrapping up at KollaCode in October 2025, I joined Surface Design Solutions in
            January 2026 as a Senior Software Engineer. There I lead UI/UX design and full-stack
            frontend development for a ground-up rebuild of a physics-informed AI SaaS platform for
            materials science — working directly with PhD co-founders to translate deep-tech research
            into accessible software, while also driving brand, web presence, and digital marketing
            as part of a founding-stage team. Increasingly, I build through agentic tools like Claude
            Code — focusing on architecture, technical direction, and decision-making while AI
            accelerates the implementation. These days I'm just as comfortable owning product
            architecture as I am running content strategy and SEO — bridging technical execution and
            audience growth.
          </p>
        </v-col>
      </v-row>

      <!-- Career Highlights -->
      <h2 class="block-title mt-16">Career highlights</h2>
      <div class="highlights-grid">
        <div v-for="(item, i) in highlights" :key="item.text" class="highlight-card">
          <span class="highlight-card__num">{{ String(i + 1).padStart(2, '0') }}</span>
          <v-icon class="highlight-card__icon" size="22">{{ item.icon }}</v-icon>
          <p class="highlight-card__text">{{ item.text }}</p>
        </div>
      </div>

      <!-- Beyond Code -->
      <v-row class="mt-16">
        <v-col cols="12" md="10" lg="9">
          <h2 class="block-title">Beyond code</h2>
          <p class="body-paragraph">
            When I'm not developing, you'll find me enjoying live music — especially blues and jazz.
            I play guitar and piano when I get the chance, which is a perfect creative outlet and
            helps me think through complex technical challenges. I'm also passionate about emerging
            tech and AI tooling, and outside of all that I enjoy experimenting with new cocktail
            recipes and the craft of mixology.
          </p>
          <div class="interest-pills">
            <span v-for="interest in interests" :key="interest.label" class="interest-pill">
              <v-icon size="16" class="mr-1">{{ interest.icon }}</v-icon>
              {{ interest.label }}
            </span>
          </div>
        </v-col>
      </v-row>

      <!-- Actions -->
      <div class="d-flex flex-wrap ga-4 mt-12">
        <v-btn to="/experience" color="accent" size="large" class="text-none px-6" prepend-icon="mdi-briefcase-outline">
          View my experience
        </v-btn>
        <v-btn to="/projects" variant="outlined" size="large" class="text-none px-6" prepend-icon="mdi-code-braces">
          See my projects
        </v-btn>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
interface Highlight {
  icon: string
  text: string
}

interface Interest {
  icon: string
  label: string
}

const highlights: Highlight[] = [
  { icon: 'mdi-briefcase-outline', text: '8+ years architecting enterprise-grade applications' },
  { icon: 'mdi-robot-outline', text: 'Integrated AI tools saving hundreds of support hours' },
  { icon: 'mdi-cloud-outline', text: 'Deployed production apps to AWS (ECS, Route 53, CloudFront)' },
  { icon: 'mdi-earth', text: 'Built internationalization supporting 11+ languages' },
  { icon: 'mdi-rocket-launch-outline', text: 'Led multiple Vue 2 → Vue 3 migration projects' },
  { icon: 'mdi-account-star-outline', text: 'Project lead on mission-critical IBM applications' },
  { icon: 'mdi-database-sync-outline', text: 'Optimized database queries, cutting retrieval time 40%' },
  { icon: 'mdi-shield-lock-outline', text: 'Implemented OAuth, OIDC authentication & PII encryption' },
  { icon: 'mdi-currency-usd', text: 'Contributed to Series A → Series B funding growth' },
  { icon: 'mdi-barcode-scan', text: 'Designed industry-standard barcode & QR scanning systems' },
]

const interests: Interest[] = [
  { icon: 'mdi-music-clef-treble', label: 'Blues & Jazz' },
  { icon: 'mdi-guitar-acoustic', label: 'Guitar' },
  { icon: 'mdi-piano', label: 'Piano' },
  { icon: 'mdi-robot-happy-outline', label: 'AI Tooling' },
  { icon: 'mdi-glass-cocktail', label: 'Mixology' },
  { icon: 'mdi-account-group-outline', label: 'Mentoring' },
  { icon: 'mdi-code-tags-check', label: 'Clean Code' },
  { icon: 'mdi-human', label: 'Accessibility' },
]
</script>

<style scoped>
.about-page {
  padding: var(--section-py) 0;
  min-height: 100vh;
}

.page-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(2rem, 4vw, 3rem);
  letter-spacing: -0.03em;
  line-height: 1.05;
  color: rgb(var(--v-theme-primary));
  margin-bottom: 16px;
}

.page-subtitle {
  margin-top: 18px;
  font-size: 1.05rem;
  color: rgb(var(--v-theme-secondary));
}

.block-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(1.4rem, 2.5vw, 1.9rem);
  letter-spacing: -0.02em;
  color: rgb(var(--v-theme-primary));
  margin-bottom: 20px;
}

.lead-paragraph {
  font-size: 1.3rem;
  font-weight: 600;
  line-height: 1.5;
  color: rgb(var(--v-theme-primary));
  margin-bottom: 20px;
}

.body-paragraph {
  font-size: 1.05rem;
  line-height: 1.75;
  color: rgb(var(--v-theme-secondary));
  margin-bottom: 18px;
}

/* Highlights grid */
.highlights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.highlight-card {
  position: relative;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
  border: 1px solid var(--v-theme-border, rgba(148, 163, 184, 0.25));
  border-radius: var(--border-radius-lg);
  padding: 22px;
  transition:
    transform 0.3s var(--ease-out),
    box-shadow 0.3s var(--ease-out),
    border-color 0.3s var(--ease-out);
}

.highlight-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-medium);
  border-color: rgba(var(--v-theme-accent), 0.4);
}

.highlight-card__num {
  position: absolute;
  top: 6px;
  right: 14px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 2.75rem;
  line-height: 1;
  color: rgb(var(--v-theme-primary));
  opacity: 0.05;
  user-select: none;
}

.highlight-card__icon {
  color: rgb(var(--v-theme-accent));
  margin-bottom: 12px;
}

.highlight-card__text {
  font-size: 0.95rem;
  line-height: 1.55;
  font-weight: 500;
  color: rgb(var(--v-theme-primary));
  margin: 0;
  position: relative;
  z-index: 1;
}

/* Interest pills */
.interest-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
}

.interest-pill {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 500;
  padding: 8px 14px;
  border-radius: 999px;
  color: rgb(var(--v-theme-secondary));
  background: rgb(var(--v-theme-surface-variant));
  border: 1px solid var(--v-theme-border, rgba(148, 163, 184, 0.2));
  transition: all 0.22s var(--ease-out);
}

.interest-pill:hover {
  color: rgb(var(--v-theme-accent));
  border-color: rgba(var(--v-theme-accent), 0.4);
  transform: translateY(-2px);
}

@media (max-width: 600px) {
  .about-page {
    padding: var(--section-py-mobile) 0;
  }
}
</style>
