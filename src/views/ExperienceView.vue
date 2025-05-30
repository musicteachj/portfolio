<template>
  <div class="experience-page">
    <v-container>
      <!-- Page Header -->
      <v-row>
        <v-col cols="12">
          <div class="text-center mb-12">
            <h1 class="text-h2 font-weight-bold mb-4">Work Experience</h1>
            <p class="text-h6" style="opacity: 0.8">
              My professional journey and career highlights
            </p>
          </div>
        </v-col>
      </v-row>

      <!-- Experience Timeline -->
      <v-row>
        <v-col cols="12" md="10" offset-md="1">
          <v-timeline side="end" class="experience-timeline">
            <v-timeline-item
              v-for="(job, index) in experience"
              :key="index"
              :dot-color="job.current ? 'primary' : 'grey-lighten-1'"
              size="large"
              class="mb-8"
            >
              <!-- Timeline Date -->
              <template v-slot:opposite>
                <div class="text-h6 font-weight-medium text-primary">
                  {{ job.period }}
                </div>
                <div v-if="job.location" class="text-body-2" style="opacity: 0.7">
                  <v-icon size="small" class="mr-1">mdi-map-marker</v-icon>
                  {{ job.location }}
                </div>
              </template>

              <!-- Job Details Card -->
              <v-card elevation="8" class="experience-card">
                <v-card-title class="d-flex align-center">
                  <div class="flex-grow-1">
                    <h3 class="text-h5">{{ job.title }}</h3>
                    <div class="text-h6 text-primary font-weight-medium">
                      {{ job.company }}
                    </div>
                  </div>
                  <v-chip v-if="job.current" color="success" size="small" prepend-icon="mdi-circle">
                    Current
                  </v-chip>
                </v-card-title>

                <v-card-text>
                  <!-- Job Description -->
                  <p v-if="job.description" class="text-body-1 mb-4">
                    {{ job.description }}
                  </p>

                  <!-- Key Achievements -->
                  <div class="mb-4">
                    <h4 class="text-h6 mb-3">Key Achievements</h4>
                    <div class="achievements-list">
                      <div
                        v-for="achievement in job.achievements"
                        :key="achievement"
                        class="d-flex align-start mb-3"
                      >
                        <v-icon color="success" size="small" class="mt-1 mr-3 flex-shrink-0">
                          mdi-check-circle
                        </v-icon>
                        <span class="text-body-2 flex-grow-1">
                          {{ achievement }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Technologies Used -->
                  <div v-if="job.technologies?.length">
                    <h4 class="text-h6 mb-3">Technologies & Tools</h4>
                    <div class="d-flex flex-wrap ga-2">
                      <v-chip
                        v-for="tech in job.technologies"
                        :key="tech"
                        size="small"
                        color="primary"
                        variant="outlined"
                      >
                        {{ tech }}
                      </v-chip>
                    </div>
                  </div>

                  <!-- Projects/Highlights -->
                  <div v-if="job.highlights?.length" class="mt-4">
                    <h4 class="text-h6 mb-4">Notable Projects</h4>
                    <div>
                      <div v-for="highlight in job.highlights" :key="highlight.name" class="mb-4">
                        <div class="font-weight-bold text-body-1 text-primary mb-1">
                          {{ highlight.name }}
                        </div>
                        <div class="text-body-2 pl-0">
                          {{ highlight.description }}
                        </div>
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-timeline-item>
          </v-timeline>
        </v-col>
      </v-row>

      <!-- Skills Summary -->
      <v-row class="mt-12">
        <v-col cols="12">
          <h2 class="text-h3 font-weight-bold text-center mb-8">Skills Developed</h2>
        </v-col>

        <v-col v-for="skillCategory in skillsSimple" :key="skillCategory.category" cols="12" md="4">
          <v-card elevation="6" class="pa-6 fill-height">
            <div class="text-center mb-4">
              <v-icon :color="skillCategory.color" size="48">
                {{ skillCategory.icon }}
              </v-icon>
              <h3 class="text-h5 mt-2">{{ skillCategory.category }}</h3>
            </div>
            <v-list density="compact">
              <v-list-item v-for="skill in skillCategory.skills" :key="skill" class="px-0">
                <template v-slot:prepend>
                  <v-icon :color="skillCategory.color" size="small">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-1">{{ skill }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>

      <!-- Download Resume CTA -->
      <v-row class="mt-12">
        <v-col cols="12" class="text-center">
          <v-card elevation="12" class="pa-8" color="primary" theme="dark">
            <h2 class="text-h4 font-weight-bold mb-4">Want More Details?</h2>
            <p class="text-h6 mb-6" style="opacity: 0.9">
              Download my complete resume for additional information
            </p>
            <div class="d-flex justify-center flex-wrap ga-4">
              <v-btn
                color="white"
                variant="flat"
                size="large"
                @click="downloadResume"
                prepend-icon="mdi-download"
              >
                Download Resume
              </v-btn>
              <v-btn
                to="/contact"
                color="white"
                variant="outlined"
                size="large"
                prepend-icon="mdi-email"
              >
                Contact Me
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
import { useSnackbarStore } from '@/stores/snackbar'
import type { Experience } from '@/types'

const snackbar = useSnackbarStore()

// Experience data with enhanced details
const experience = ref<
  (Experience & {
    description?: string
    highlights?: Array<{ name: string; description: string }>
  })[]
>([
  {
    id: 1,
    title: 'Senior Full Stack Engineer',
    company: 'KollaCode / IBM',
    period: 'Sept 2022 - Present',
    current: true,
    location: 'Atlanta, GA / Remote',
    description:
      "Full stack engineer developing enterprise applications for IBM's global partner ecosystem and internal tools. Lead front-end architecture and modernization initiatives while contributing to backend API development and database optimization.",
    achievements: [
      'Led development of IBM Partner Plus Awards application serving global partner ecosystem with nomination and voting capabilities',
      'Solely responsible for internationalization implementation, making applications accessible in 11 languages using vue-i18n',
      'Spearheaded migration of multiple applications from Vue 2/CLI/Vuetify 2 to Vue 3/Vite/Vuetify 3 stack',
      'Architected and built reusable UI component library improving development efficiency across teams',
      'Developed comprehensive "Amenities" application used by IBMers globally for event management',
      'Optimized Cloudant DB (NoSQL) views and indexes, improving data retrieval performance by 40%',
      'Enhanced API security and performance through input validation, error handling, and query optimization',
    ],
    technologies: [
      'Vue 3',
      'Vite',
      'Vuetify 3',
      'Nuxt.js',
      'TypeScript',
      'JavaScript ES6+',
      'Express.js',
      'Node.js',
      'Pinia',
      'vue-i18n',
      'Cloudant DB',
      'NoSQL',
    ],
    highlights: [
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
      'Vue.js',
      'Vue 2',
      'Vuetify 2',
      'TypeScript',
      'JavaScript ES6+',
      'Express.js',
      'Node.js',
      'Cloudant DB',
      'SASS',
      'Carbon Design System',
      'Bootstrap',
      'IBM API Services',
      'XLSX Processing',
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
      'Integrated barcode scanning technology using NPM vue-barcode, enhancing accuracy and efficiency in packaging operations',
      'Solely responsible for modernizing UI library of monolithic Vue.js application, migrating Vuetify from v1.5 to v2.3',
      'Executed PostgreSQL and Hasura table updates to scale MRP system while maintaining data integrity and optimizing performance',
      'Adjusted GraphQL queries and database relationships to support growing data demands and improve system responsiveness',
      'Collaborated with Operations and R&D teams to translate business requirements into scalable technical solutions',
      'Mentored junior developers through technical guidance, onboarding, and comprehensive code reviews',
      'Supported company growth from Series A to Series B funding, contributing to rapid scaling and new facility launches',
    ],
    technologies: [
      'Vue.js',
      'Vuetify 1.5-2.3',
      'Node.js',
      'JavaScript',
      'PostgreSQL',
      'Hasura',
      'GraphQL',
      'Vuex',
      'NPM vue-barcode',
      'Jira',
      'Git',
    ],
    highlights: [
      {
        name: 'Automated Packaging System',
        description:
          'Built Vue.js applications for conveyor belt stations with integrated barcode scanning, improving packaging accuracy and workflow efficiency',
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
      'Vue.js',
      'Vuex',
      'Vuetify',
      'JavaScript',
      'Express.js',
      'Node.js',
      'PostgreSQL',
      'GraphQL',
      'CSS3',
      'HTML5',
      'Jira',
      'Git',
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

const skillsSimple = ref([
  {
    category: 'Frontend',
    icon: 'mdi-monitor',
    color: 'blue',
    skills: [
      'Vue 2 & Vue 3',
      'React',
      'TypeScript',
      'Vuetify 2 & 3',
      'Nuxt.js',
      'JavaScript ES6+',
      'CSS/Sass',
      'Responsive Design',
      'vue-i18n (Internationalization)',
    ],
  },
  {
    category: 'Backend & Database',
    icon: 'mdi-server',
    color: 'green',
    skills: [
      'Node.js',
      'Express.js',
      'PostgreSQL',
      'Cloudant DB (NoSQL)',
      'GraphQL',
      'Hasura',
      'RESTful APIs',
      'Database Optimization',
    ],
  },
  {
    category: 'Tools & DevOps',
    icon: 'mdi-tools',
    color: 'orange',
    skills: [
      'Git/GitHub',
      'Vite',
      'Pinia State Management',
      'Vuex',
      'Jira',
      'IBM API Services',
      'XLSX Processing',
      'NPM',
    ],
  },
])

const downloadResume = (): void => {
  const link = document.createElement('a')
  link.href = '/resume.pdf' // Replace with actual resume path
  link.download = 'Your_Name_Resume.pdf'
  link.click()

  snackbar.success('Resume download started!')
}
</script>

<style scoped>
.experience-page {
  padding: 80px 0;
  min-height: 100vh;
}

.experience-timeline {
  position: relative;
}

.experience-card {
  transition:
    transform 0.3s ease-in-out,
    box-shadow 0.3s ease-in-out;
}

.experience-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

/* Custom timeline styling */
:deep(.v-timeline-item__body) {
  padding-bottom: 2rem;
}

:deep(.v-timeline-item__opposite) {
  padding-top: 1rem;
}

@media (max-width: 960px) {
  .experience-page {
    padding: 60px 0;
  }

  :deep(.v-timeline-item__opposite) {
    display: none;
  }
}

/* Fix text truncation in achievements */
.achievement-text {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: unset !important;
  line-height: 1.4 !important;
}

/* Alternative styling for the div version */
.achievements-list {
  padding-left: 0;
}

.achievements-list .d-flex {
  align-items: flex-start;
}

/* Ensure proper spacing and wrapping */
:deep(.v-list-item-title) {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: unset !important;
  line-height: 1.4;
}

/* Optional: Add some padding for better readability */
:deep(.v-list-item__content) {
  padding-right: 8px;
}
</style>
