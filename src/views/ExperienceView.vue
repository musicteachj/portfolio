<template>
  <div class="experience-page">
    <v-container>
      <!-- Page Header -->
      <div class="section-head mb-12">
        <p class="eyebrow mb-2">Career</p>
        <h1 class="page-title">Work experience</h1>
        <div class="accent-rule is-visible"></div>
        <p class="page-subtitle">A timeline of roles, impact, and the stacks behind them.</p>
      </div>

      <!-- Experience Timeline -->
      <v-row>
        <v-col cols="12" md="11" offset-md="1">
          <v-timeline side="end" align="start" truncate-line="both" class="exp-timeline">
            <v-timeline-item
              v-for="(job, index) in experience"
              :key="index"
              dot-color="accent"
              size="small"
              class="mb-10"
            >
              <!-- Date pill -->
              <template v-slot:opposite>
                <div class="exp-date">
                  <span class="exp-date__pill">{{ job.period }}</span>
                  <span v-if="job.location" class="exp-date__loc">
                    <v-icon size="x-small" class="mr-1">mdi-map-marker-outline</v-icon>
                    {{ job.location }}
                  </span>
                </div>
              </template>

              <!-- Job card -->
              <v-card class="exp-card">
                <div class="exp-card__header">
                  <div>
                    <h3 class="exp-card__company">{{ job.company }}</h3>
                    <div class="exp-card__role">{{ job.title }}</div>
                    <div class="exp-date exp-date--inline">
                      <span class="exp-date__pill">{{ job.period }}</span>
                    </div>
                  </div>
                  <span v-if="job.current" class="exp-current">
                    <span class="exp-current__dot"></span>
                    Current
                  </span>
                </div>

                <p v-if="job.description" class="exp-card__desc">{{ job.description }}</p>

                <!-- Achievements -->
                <div class="exp-block">
                  <h4 class="exp-block__label">Key Achievements</h4>
                  <ul class="exp-achievements">
                    <li v-for="achievement in job.achievements" :key="achievement">
                      <v-icon size="x-small" class="exp-achievements__mark">mdi-chevron-right</v-icon>
                      <span>{{ achievement }}</span>
                    </li>
                  </ul>
                </div>

                <!-- Technologies -->
                <div v-if="job.technologies?.length" class="exp-block">
                  <h4 class="exp-block__label">Technologies &amp; Tools</h4>
                  <div class="exp-tech">
                    <span v-for="tech in job.technologies" :key="tech" class="tech-tag">
                      {{ tech }}
                    </span>
                  </div>
                </div>

                <!-- Highlights -->
                <div v-if="job.highlights?.length" class="exp-block">
                  <h4 class="exp-block__label">Notable Projects</h4>
                  <div
                    v-for="highlight in job.highlights"
                    :key="highlight.name"
                    class="exp-highlight"
                  >
                    <div class="exp-highlight__name">{{ highlight.name }}</div>
                    <div class="exp-highlight__desc">{{ highlight.description }}</div>
                  </div>
                </div>
              </v-card>
            </v-timeline-item>
          </v-timeline>
        </v-col>
      </v-row>

      <!-- Skills Summary -->
      <div class="section-head mt-16 mb-10">
        <p class="eyebrow mb-2">Toolkit</p>
        <h2 class="page-title page-title--sm">Skills developed</h2>
        <div class="accent-rule is-visible"></div>
      </div>
      <Skills />

      <!-- Contact CTA -->
      <div class="cta-card mt-16">
        <div class="cta-card__bg" aria-hidden="true"></div>
        <div class="cta-card__content">
          <p class="eyebrow mb-3" style="color: #93c5fd">Get in touch</p>
          <h2 class="cta-card__title">Want to know more?</h2>
          <p class="cta-card__desc">Happy to walk through any of this in more detail.</p>
          <div class="d-flex justify-center flex-wrap ga-4 mt-2">
            <!-- Résumé download — restore when back in the market / needed again
            <v-btn
              color="accent"
              size="large"
              class="text-none px-6"
              @click="downloadResume"
              prepend-icon="mdi-download"
            >
              Download résumé
            </v-btn>
            -->
            <v-btn
              to="/contact"
              color="accent"
              size="large"
              class="text-none px-6"
              prepend-icon="mdi-email-outline"
            >
              Contact me
            </v-btn>
          </div>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSnackbarStore } from '@/stores/snackbar'
import type { Experience } from '@/types'
import Skills from '@/components/Skills.vue'

const snackbar = useSnackbarStore()
// Experience data with enhanced details
const experience = ref<
  (Experience & {
    description?: string
    highlights?: Array<{ name: string; description: string }>
  })[]
>([
  {
    id: 0,
    title: 'Senior Software Engineer',
    company: 'Surface Design Solutions',
    period: 'Jan 2026 - Present',
    current: true,
    location: 'Atlanta, GA / Remote',
    description:
      'Senior Software Engineer at a physics-informed AI SaaS company for manufacturing. I lead UI/UX and full-stack frontend development on a ground-up rebuild, work with the PhD co-founders to turn deep-tech AI research into usable product, and build largely through agentic tooling like Claude Code. I also own the go-to-market side: brand, web presence, and SEO.',
    achievements: [
      'Leading UI/UX design and full-stack frontend development for a ground-up rebuild of a physics-informed AI SaaS platform',
      'Working with PhD co-founders to translate deep-tech AI research into accessible product',
      'Building through agentic tooling like Claude Code, focusing on architecture and technical direction while AI handles more of the implementation',
      'Architecting the complete frontend for the 2.0 application, owning all design decisions from component architecture to user experience',
      'Translating complex scientific concepts into intuitive interfaces for technical and non-technical users alike',
      'Contributing across the organization beyond engineering — including brand identity, public web presence, and digital marketing initiatives',
      'Owning LinkedIn content strategy, campaign production, and SEO execution alongside product development',
    ],
    technologies: [
      'Vue 3',
      'Vite',
      'PrimeVue',
      'Tailwind CSS',
      'TypeScript',
      'Claude',
      'Django',
      'Python',
      'Agentic Coding',
    ],
    highlights: [
      {
        name: 'Surface 2.0 Platform',
        description:
          'Ground-up rebuild of the physics-informed AI SaaS application — full frontend architecture and UX translating advanced surface science into accessible, production-grade software.',
      },
      {
        name: 'Commercial Layer & Go-to-Market',
        description:
          "Building the company's commercial layer as a founding-stage contributor: brand identity, public web presence, content strategy, and SEO.",
      },
    ],
  },
  {
    id: 1,
    title: 'Senior Full Stack Engineer',
    company: 'KollaCode / IBM',
    period: 'Sept 2022 - Oct 2025',
    current: false,
    location: 'Atlanta, GA / Remote',
    description:
      "Full stack engineer developing enterprise applications for IBM's global partner ecosystem and internal tools. Lead front-end architecture and modernization initiatives while contributing to backend API development and database optimization.",
    achievements: [
      'Integrated AI-based compliance tooling that removed hundreds of hours of manual support work',
      'Led development of IBM Partner Plus Awards application serving global partner ecosystem with nomination and voting capabilities',
      'Solely responsible for internationalization implementation, making applications accessible in 11 languages using vue-i18n',
      'Spearheaded migration of multiple applications from Vue 2/CLI/Vuetify 2 to Vue 3/Vite/Vuetify 3 stack',
      'Architected and built reusable UI component library improving development efficiency across teams',
      'Developed comprehensive "Amenities" application used by IBMers globally for event management',
      'Optimized Cloudant DB (NoSQL) views and indexes, improving data retrieval performance by 40%',
      'Enhanced API security and performance through input validation, error handling, Jest unit tests, and query optimization',
    ],
    technologies: [
      'Vue 2',
      'Vue 3',
      'Vue CLI',
      'Vite',
      'Vuetify 2',
      'Vuetify 3',
      'Carbon Design System',
      'Bootstrap',
      'Nuxt.js',
      'TypeScript',
      'JavaScript ES6+',
      'Node.js',
      'Express.js',
      'Vuex',
      'Pinia',
      'vue-i18n',
      'Internationalization',
      'XLSX Processing',
      'REST APIs',
      'Cloudant DB',
      'NoSQL',
      'AI Integration',
      'CI/CD',
      'Jira',
      'Git/Github',
    ],
    highlights: [
      {
        name: 'AI Compliance Tooling',
        description:
          'Integrated AI-based compliance tools into IBM workflows, taking hundreds of hours of manual support work off the table.',
      },
      {
        name: 'IBM Partner Plus Awards Platform',
        description:
          "Full stack application with nomination/voting system, internationalization support, and robust form validation serving IBM's global partner network",
      },
      {
        name: 'Vue 2 to Vue 3 Migration Initiative',
        description:
          'Led modernization of legacy applications, improving performance and developer experience with latest front-end technologies',
      },
      {
        name: 'Global Amenities Management System',
        description:
          'Enterprise application for event management including invitee tracking, travel coordination, and amenities management used by IBM employees worldwide',
      },
      {
        name: 'API Architecture & Optimization',
        description:
          'Developed and optimized RESTful APIs with enhanced security, performance improvements, and scalable architecture supporting complex data structures',
      },
    ],
  },
  {
    id: 2,
    title: 'Full Stack Engineer',
    company: 'KollaCode / IBM',
    period: 'Jul 2021 - Sept 2022',
    current: false,
    location: 'Atlanta, GA / Remote',
    description:
      "Full stack engineer specializing in Vue.js applications for IBM's internal tools and global event management systems. Focused on UI/UX improvements, component architecture, and ensuring compliance with IBM's security and design standards.",
    achievements: [
      "Ensured compliance with IBM's security and data privacy policies across all Vue.js and Node.js applications",
      'Collaborated with IBM project managers, designers, and developers to deliver version upgrades for globally-used applications',
      'Wrote complex Cloudant DB queries including views, indexes, and search operations to support Express.js APIs',
      'Upgraded multiple application UIs by migrating from Bootstrap and Carbon-Vue to Vuetify components',
      "Customized Vuetify's Material Design to align with IBM's Carbon Design System using SASS variables and overrides",
      'Led front-end development for IBM event management app v2 with advanced features and TypeScript integration',
      'Fully implemented Sales module for CTEBA with customizable email confirmations and XLSX import functionality',
      'Contributed to multi-language support across applications, enabling 30+ languages for global IBM teams',
    ],
    technologies: [
      'Vue 2',
      'Vue 3',
      'Vue CLI',
      'Vite',
      'Vuetify 2',
      'Vuetify 3',
      'Carbon Design System',
      'Bootstrap',
      'Nuxt.js',
      'TypeScript',
      'JavaScript ES6+',
      'Node.js',
      'Express.js',
      'Vuex',
      'Pinia',
      'vue-i18n',
      'Internationalization',
      'XLSX Processing',
      'REST APIs',
      'Cloudant DB',
      'NoSQL',
      'CI/CD',
      'Jira',
      'Git/Github',
    ],
    highlights: [
      {
        name: 'IBM Event Management App v2',
        description:
          'Led front-end development featuring event selection, XLSX import, data mapping, bulk editing, and marketing permissions with TypeScript for enhanced maintainability',
      },
      {
        name: 'CTEBA (Client Travel, Entertainment & Business Amenities)',
        description:
          'Maintained and enhanced modules for Admin, Event Manager, Sales, Specialist, and Legal departments with full Sales module implementation',
      },
      {
        name: 'UI Framework Migration',
        description:
          'Successfully migrated multiple applications from Bootstrap/Carbon-Vue to Vuetify while maintaining IBM Carbon Design System compliance',
      },
      {
        name: 'Database Query Optimization',
        description:
          'Developed complex Cloudant DB queries with efficient filtering, sorting, and aggregation to streamline data handling across applications',
      },
    ],
  },
  {
    id: 3,
    title: 'Software Engineer',
    company: '80 Acres Farms',
    period: 'Jun 2020 - Jul 2021',
    current: false,
    location: 'Atlanta, GA / Remote',
    description:
      'Software engineer at an innovative vertical farming startup, developing Vue.js applications for automated packaging and delivery systems. Contributed to scaling operations from Series A to Series B funding while modernizing legacy systems and mentoring junior developers.',
    achievements: [
      'Developed Vue.js and Node.js applications for conveyor belt packaging stations, streamlining product tracking and delivery workflows',
      'Integrated QR Code scanning technology, enhancing accuracy and efficiency in packaging operations',
      'Solely responsible for modernizing UI library of monolithic Vue.js application, migrating Vuetify from v1.5 to v2.3',
      'Executed PostgreSQL and Hasura table updates to scale MRP system while maintaining data integrity and optimizing performance',
      'Adjusted GraphQL queries and database relationships to support growing data demands and improve system responsiveness',
      'Collaborated with Operations and R&D teams to translate business requirements into scalable technical solutions',
      'Mentored junior developers through technical guidance, onboarding, and comprehensive code reviews',
      'Supported company growth from Series A to Series B funding, contributing to rapid scaling and new facility launches',
    ],
    technologies: [
      'Vue 2',
      'Vuetify 2',
      'Vue CLI',
      'Vuex',
      'Vuelidate',
      'JavaScript',
      'TypeScript',
      'Node.js',
      'Express.js',
      'REST APIs',
      'PostgreSQL',
      'Hasura',
      'GraphQL',
      'Jira',
      'Git/Github',
    ],
    highlights: [
      {
        name: 'Automated Packaging System',
        description:
          'Built Vue.js applications for conveyor belt stations with integrated QR Code scanning, improving packaging accuracy and workflow efficiency',
      },
      {
        name: 'Vuetify Migration & UI Modernization',
        description:
          'Led complete upgrade of monolithic application UI library from Vuetify 1.5 to 2.3, refactoring components while maintaining business logic integrity',
      },
      {
        name: 'MRP System Scaling',
        description:
          'Optimized PostgreSQL database and GraphQL queries to support rapid business growth and increasing data demands during Series B expansion',
      },
      {
        name: 'Cross-Functional Collaboration',
        description:
          'Worked closely with Operations and R&D teams to deliver technical solutions supporting new production facility launches in Cincinnati',
      },
    ],
  },
  {
    id: 4,
    title: 'Jr. Developer',
    company: '80 Acres Farms',
    period: 'May 2018 - Jun 2020',
    current: false,
    location: 'Fayetteville, AR / Remote',
    description:
      'Junior developer contributing to innovative MRP system development for indoor vertical farming operations. Gained foundational experience in full-stack development while working on specialized agricultural technology solutions.',
    achievements: [
      'Contributed to design and development of custom MRP system tailored for indoor vertical farming workflows',
      'Addressed complete crop lifecycle stages including seeding, germination, light exposure, packaging, and distribution',
      'Collaborated with cross-functional teams including designers, backend developers, and agricultural subject matter experts',
      'Implemented Express.js backend services with custom APIs for CRUD operations and database interactions',
      'Optimized GraphQL queries to efficiently interact with PostgreSQL database, ensuring smooth data flow',
      'Developed responsive user interfaces working seamlessly across mobile, tablet, and desktop devices',
      'Created and managed reusable UI components and libraries for Vue.js legacy application',
      'Implemented design guidelines and standards ensuring consistency and brand integrity across applications',
    ],
    technologies: [
      'Vue 2',
      'Vuetify 1',
      'Vue CLI',
      'Vuex',
      'Vuelidate',
      'JavaScript',
      'TypeScript',
      'Node.js',
      'Express.js',
      'REST APIs',
      'PostgreSQL',
      'Hasura',
      'GraphQL',
      'Jira',
      'Git/Github',
    ],
    highlights: [
      {
        name: 'Custom MRP System for Vertical Farming',
        description:
          'Built specialized Material Requirements Planning system addressing unique indoor farming workflows from seeding to distribution',
      },
      {
        name: 'Full-Stack Development Foundation',
        description:
          'Gained experience in both frontend Vue.js development and backend Express.js API creation with PostgreSQL integration',
      },
      {
        name: 'Responsive Design Implementation',
        description:
          'Developed mobile-first responsive interfaces using CSS media queries and Vuetify components for cross-platform accessibility',
      },
      {
        name: 'Component Library Architecture',
        description:
          'Created reusable UI component system for monolithic application, establishing DRY principles and maintainable frontend architecture',
      },
    ],
  },
])

const downloadResume = (): void => {
  const link = document.createElement('a')
  link.href = `${import.meta.env.BASE_URL}James_Littlefield_Senior_Full_Stack_Developer.pdf`
  link.download = 'James_Littlefield_Senior_Full_Stack_Developer.pdf'
  link.click()
  snackbar.success('Resume download started!')
}
</script>

<style scoped>
.experience-page {
  padding: var(--section-py) 0;
  min-height: 100vh;
}

/* Page header */
.page-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(2rem, 4vw, 3rem);
  letter-spacing: -0.03em;
  line-height: 1.05;
  color: rgb(var(--v-theme-primary));
  margin-bottom: 16px;
}

.page-title--sm {
  font-size: clamp(1.75rem, 3vw, 2.25rem);
}

.page-subtitle {
  margin-top: 18px;
  font-size: 1.05rem;
  color: rgb(var(--v-theme-secondary));
}

/* Date pill */
.exp-date {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  padding-top: 4px;
}

.exp-date__pill {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 999px;
  color: rgb(var(--v-theme-accent));
  border: 1px solid rgba(var(--v-theme-accent), 0.4);
  white-space: nowrap;
}

.exp-date__loc {
  font-size: 0.8rem;
  color: var(--v-theme-on-surface-muted, #64748b);
  display: inline-flex;
  align-items: center;
}

/* Inline date only shown on mobile when opposite is hidden */
.exp-date--inline {
  display: none;
  margin-top: 10px;
}

/* Job card */
.exp-card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid var(--v-theme-border, rgba(148, 163, 184, 0.25));
  border-radius: var(--border-radius-lg);
  padding: 28px;
  box-shadow: var(--shadow-light);
  transition:
    transform 0.3s var(--ease-out),
    box-shadow 0.3s var(--ease-out),
    border-color 0.3s var(--ease-out);
}

.exp-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-medium);
  border-color: rgba(var(--v-theme-accent), 0.4);
}

.exp-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.exp-card__company {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.4rem;
  letter-spacing: -0.02em;
  color: rgb(var(--v-theme-primary));
  line-height: 1.2;
}

.exp-card__role {
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 500;
  color: rgb(var(--v-theme-accent));
  margin-top: 2px;
}

.exp-current {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 999px;
  color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.12);
}

.exp-current__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgb(var(--v-theme-success));
  animation: pulse 2.4s infinite;
}

.exp-card__desc {
  font-size: 1rem;
  line-height: 1.7;
  color: rgb(var(--v-theme-secondary));
  margin-bottom: 22px;
}

/* Blocks */
.exp-block {
  margin-bottom: 22px;
}

.exp-block:last-child {
  margin-bottom: 0;
}

.exp-block__label {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--v-theme-on-surface-muted, #64748b);
  margin-bottom: 14px;
}

/* Achievements */
.exp-achievements {
  list-style: none;
  padding: 0;
  margin: 0;
}

.exp-achievements li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgb(var(--v-theme-secondary));
}

.exp-achievements__mark {
  color: rgb(var(--v-theme-accent));
  margin-top: 4px;
  flex-shrink: 0;
}

/* Tech */
.exp-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-tag {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  padding: 4px 10px;
  border-radius: 6px;
  color: rgb(var(--v-theme-secondary));
  background: rgb(var(--v-theme-surface-variant));
  border: 1px solid var(--v-theme-border, rgba(148, 163, 184, 0.2));
}

/* Highlights */
.exp-highlight {
  padding-left: 14px;
  border-left: 2px solid rgba(var(--v-theme-accent), 0.3);
  margin-bottom: 16px;
}

.exp-highlight:last-child {
  margin-bottom: 0;
}

.exp-highlight__name {
  font-weight: 600;
  font-size: 0.98rem;
  color: rgb(var(--v-theme-primary));
  margin-bottom: 4px;
}

.exp-highlight__desc {
  font-size: 0.92rem;
  line-height: 1.6;
  color: rgb(var(--v-theme-secondary));
}

/* CTA card (shared visual with HomeView) */
.cta-card {
  position: relative;
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  padding: clamp(40px, 6vw, 64px);
  text-align: center;
}

.cta-card__bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(60% 120% at 80% 0%, rgba(37, 99, 235, 0.55) 0%, transparent 60%),
    linear-gradient(135deg, #0b1220 0%, #0f172a 60%, #111c33 100%);
}

.cta-card__content {
  position: relative;
  z-index: 1;
}

.cta-card__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.6rem, 4vw, 2.5rem);
  letter-spacing: -0.02em;
  color: #f8fafc;
  margin-bottom: 14px;
}

.cta-card__desc {
  max-width: 480px;
  margin: 0 auto;
  color: #cbd5e1;
  font-size: 1.05rem;
}

.cta-card__ghost {
  color: #f8fafc;
  border-color: rgba(248, 250, 252, 0.3);
}

/* Timeline overrides — accent dot with glow, subtle line */
:deep(.v-timeline-divider__dot) {
  box-shadow: 0 0 0 5px rgba(var(--v-theme-accent), 0.15);
}

:deep(.v-timeline-divider__inner-dot) {
  background: rgb(var(--v-theme-accent)) !important;
}

:deep(.v-timeline-divider__line) {
  background: linear-gradient(
    180deg,
    rgba(var(--v-theme-accent), 0.5),
    rgba(var(--v-theme-accent), 0.12)
  );
  width: 1px;
}

:deep(.v-timeline-item__body) {
  padding-bottom: 1rem;
}

:deep(.v-timeline-item__opposite) {
  padding-top: 0.5rem;
}

@media (max-width: 960px) {
  .experience-page {
    padding: var(--section-py-mobile) 0;
  }

  :deep(.v-timeline-item__opposite) {
    display: none;
  }

  .exp-date--inline {
    display: block;
  }
}
</style>
