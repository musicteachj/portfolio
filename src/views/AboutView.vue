<template>
  <div class="about-page">
    <v-container>
      <!-- Header -->
      <div class="section-head mb-12">
        <p class="eyebrow mb-2">About</p>
        <h1 class="page-title">A bit about me</h1>
        <div class="accent-rule is-visible"></div>
        <p class="page-subtitle">Where I've worked, how I got into AI products, and what I'm into outside of it.</p>
      </div>

      <!-- My Story -->
      <v-row>
        <v-col cols="12" md="10" lg="9">
          <h2 class="block-title">My story</h2>
          <p class="lead-paragraph">
            I got my start in software writing apps for an indoor farm, which isn't where most
            engineers begin.
          </p>
          <p class="body-paragraph">
            That was 80 Acres Farms, back in 2018. I joined as a junior and helped build the system
            that tracked crops from seeding to delivery, using Vue, Node, and PostgreSQL. Over three
            years I built the barcode setup for packaging, wrote the conveyor-belt scanning apps, led
            a big Vuetify UI migration across a legacy monolith, and started mentoring the developers
            who came in after me. The company went from Series A to Series B while I was there.
          </p>
          <p class="body-paragraph">
            In 2021 I moved to KollaCode and started working on IBM's global applications. I built
            and maintained CTEBA, IBM's worldwide event platform, led the rebuild of their EDIT app
            with bulk spreadsheet editing, and wrote the Cloudant queries behind a lot of the APIs.
            All of it had to clear IBM's security bar: PII encryption, OIDC, audit logging.
          </p>
          <p class="body-paragraph">
            They promoted me to Senior in 2023, and I led work on apps used by thousands of people
            worldwide. The Partner Plus Awards app shipped in 11 languages, and I built the Amenities
            app with currency conversion and two separate workflows. The one I point to most is the
            AI compliance tooling I integrated, which took hundreds of hours of manual support work
            off the table. That was the first time AI made an obvious dent in something I built.
          </p>
          <p class="body-paragraph">
            I wrapped up at IBM in late 2025 and joined Surface Design Solutions in January 2026.
            It's a physics-informed AI SaaS for materials science, and I lead the frontend on a
            ground-up rebuild. A lot of the job is sitting with our PhD co-founders and figuring out
            how to turn genuinely hard research into something people can use without a doctorate. I
            also create the marketing and social content we put out, and pitch in on brand, website,
            and SEO, since we're small enough that everyone works beyond their core role.
          </p>
          <p class="body-paragraph">
            I build most of this through agentic tools now, mainly Claude Code, which keeps my time
            on architecture and the decisions that shape a product. On the AI side, the work is
            integration and workflows: connecting models to real product surfaces and making them
            reliable enough for real users.
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
            Outside of work I'm usually around live music, mostly blues and jazz, and I play guitar
            and piano when I get the time. It's a good way to step away from a screen and let a
            problem sort itself out. I also keep up with new AI tools for the fun of it, not just for
            work, and I'm into mixing cocktails at home.
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
  { icon: 'mdi-robot-outline', text: 'Shipped Claude-powered product features and AI compliance automation' },
  { icon: 'mdi-robot-happy-outline', text: 'Build through agentic tooling like Claude Code, focused on architecture and direction' },
  { icon: 'mdi-flask-outline', text: 'Translate physics-informed AI research into usable products' },
  { icon: 'mdi-briefcase-outline', text: '8+ years building enterprise-grade applications' },
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
