<!-- Updated About Page My Story Section -->
<template>
  <div class="about-page">
    <v-container>
      <!-- Page Header -->
      <v-row>
        <v-col cols="12">
          <div class="text-center mb-12">
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
              My journey into software development began in an unexpected place: the innovative
              world of vertical farming at 80 Acres Farms. Starting as a Software Engineer in 2018,
              I discovered my passion for creating technology solutions that solve real-world
              problems when I built a comprehensive MRP system for indoor agriculture operations
              using Vue.js, Node.js, and PostgreSQL to manage the entire crop lifecycle from seeding
              to delivery.
            </p>
            <p class="text-body-1 mb-4">
              During my three years at 80 Acres Farms, I was solely responsible for designing and
              implementing an industry-standard packaging barcode system, developed factory conveyor
              belt applications integrating QR Code scanning technology, and led the migration of
              the entire Vuetify UI library from v1.5 to v2.3 across a monolithic legacy
              application. I mentored junior developers and contributed to the company's remarkable
              journey from Series A to Series B funding, gaining invaluable experience in building
              production systems from the ground up.
            </p>
            <p class="text-body-1 mb-4">
              In 2021, I transitioned to KollaCode as a Full Stack Engineer, where I expanded my
              expertise to enterprise-scale applications serving IBM's global ecosystem. I built and
              maintained CTEBA, IBM's worldwide event management application with specialized
              modules for tracking sponsored events globally. I led the full-stack development of
              the EDIT application v2 with Excel XLSX upload capabilities, implemented AG Grid for
              bulk editing, and wrote complex Cloudant DB queries to support Express.js APIs. My
              work required strict compliance with IBM's security standards including PII data
              encryption, OIDC authentication, and comprehensive audit logging.
            </p>
            <p class="text-body-1 mb-4">
              I was promoted to Senior Full Stack Engineer in 2023, where I now lead development on
              mission-critical IBM applications serving thousands of users worldwide. As project and
              application lead for CTEBA, I implemented CRON jobs with automated email tracking and
              acknowledgment monitoring. I served as lead developer on the IBM Partner Plus Awards
              application with internationalization support for 11 languages, architected the IBM
              Amenities application with dual workflow systems and comprehensive currency
              conversion, and integrated AI-based compliance tools that eliminated hundreds of
              manual support hours. I've spearheaded multiple Vue 2 to Vue 3 migrations, improving
              performance and user experience across the IBM portfolio.
            </p>

            <!-- Career Highlights -->
            <div class="career-highlights mb-6">
              <h3 class="text-h5 mb-4 text-primary">Career Highlights</h3>
              <v-row>
                <v-col cols="12" sm="6">
                  <div class="highlight-item mb-3">
                    <v-icon color="success" size="small" class="mr-2">mdi-briefcase</v-icon>
                    <span class="font-weight-medium"
                      >7+ years architecting enterprise-grade applications</span
                    >
                  </div>
                  <div class="highlight-item mb-3">
                    <v-icon color="success" size="small" class="mr-2">mdi-robot</v-icon>
                    <span class="font-weight-medium"
                      >Integrated AI tools saving hundreds of support hours</span
                    >
                  </div>
                  <div class="highlight-item mb-3">
                    <v-icon color="success" size="small" class="mr-2">mdi-cloud</v-icon>
                    <span class="font-weight-medium"
                      >Deployed production apps to AWS (ECS, Route 53, CloudFront)</span
                    >
                  </div>
                  <div class="highlight-item mb-3">
                    <v-icon color="success" size="small" class="mr-2">mdi-earth</v-icon>
                    <span class="font-weight-medium"
                      >Built internationalization supporting 11+ languages</span
                    >
                  </div>
                  <div class="highlight-item mb-3">
                    <v-icon color="success" size="small" class="mr-2">mdi-rocket-launch</v-icon>
                    <span class="font-weight-medium"
                      >Led multiple Vue 2 → Vue 3 migration projects</span
                    >
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="highlight-item mb-3">
                    <v-icon color="success" size="small" class="mr-2">mdi-account-star</v-icon>
                    <span class="font-weight-medium"
                      >Project lead on mission-critical IBM applications</span
                    >
                  </div>
                  <div class="highlight-item mb-3">
                    <v-icon color="success" size="small" class="mr-2">mdi-database-sync</v-icon>
                    <span class="font-weight-medium"
                      >Optimized database queries reducing retrieval time by 40%</span
                    >
                  </div>
                  <div class="highlight-item mb-3">
                    <v-icon color="success" size="small" class="mr-2">mdi-shield-lock</v-icon>
                    <span class="font-weight-medium"
                      >Implemented OAuth, OIDC authentication & PII encryption</span
                    >
                  </div>
                  <div class="highlight-item mb-3">
                    <v-icon color="success" size="small" class="mr-2">mdi-currency-usd</v-icon>
                    <span class="font-weight-medium"
                      >Contributed to Series A to Series B funding growth</span
                    >
                  </div>
                  <div class="highlight-item mb-3">
                    <v-icon color="success" size="small" class="mr-2">mdi-barcode-scan</v-icon>
                    <span class="font-weight-medium"
                      >Designed industry-standard barcode & QR scanning systems</span
                    >
                  </div>
                </v-col>
              </v-row>
            </div>

            <!-- Personal Interests -->
            <div class="personal-section">
              <h3 class="text-h5 mb-4 text-primary">Beyond Code</h3>
              <p class="text-body-1 mb-4">
                When I'm not developing applications, you'll find me enjoying live music—especially
                blues and jazz. I play guitar and piano when I get a chance, which provides a
                perfect creative outlet and helps me think through complex technical challenges.
              </p>
              <p class="text-body-1 mb-4">
                I'm also passionate about staying current with emerging technologies and exploring
                new AI tools like Cursor AI and Claude for agentic programming. Having seen
                firsthand how software can revolutionize traditional industries like agriculture, I
                enjoy discovering how innovative technologies can make a real-world impact.
              </p>
              <p class="text-body-1">
                Outside of tech, I enjoy experimenting with new cocktail recipes and exploring the
                craft of mixology. I'm an advocate for clean code practices, accessibility
                standards, and mentoring the next generation of developers. Whether it's jamming on
                guitar, testing out a new recipe, or diving into the latest JavaScript frameworks,
                I'm always looking for ways to grow both personally and professionally.
              </p>
            </div>

            <div class="text-center mt-8">
              <div class="d-flex justify-center flex-wrap ga-4">
                <v-btn to="/experience" color="primary" size="large" prepend-icon="mdi-briefcase">
                  View My Experience
                </v-btn>
                <v-btn
                  to="/projects"
                  :color="isDark ? 'primary' : 'secondary'"
                  variant="outlined"
                  size="large"
                  prepend-icon="mdi-code-braces"
                >
                  See My Projects
                </v-btn>
                <v-btn
                  to="/"
                  :color="isDark ? 'primary' : 'secondary'"
                  variant="outlined"
                  size="large"
                  prepend-icon="mdi-arrow-left"
                >
                  Back to Home
                </v-btn>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme()

const isDark = computed(() => theme.global.name.value === 'dark')
</script>

<style scoped>
.about-page {
  padding: 80px 0;
  min-height: 100vh;
}

.career-highlights {
  background-color: rgba(var(--v-theme-primary), 0.05);
  border-radius: 12px;
  padding: 24px;
  border-left: 4px solid rgb(var(--v-theme-primary));
}

.highlight-item {
  display: flex;
  align-items: center;
}

.personal-section {
  background-color: rgba(var(--v-theme-surface), 0.5);
  border-radius: 12px;
  padding: 24px;
  margin-top: 24px;
}

@media (max-width: 600px) {
  .about-page {
    padding: 60px 0;
  }
}
</style>
