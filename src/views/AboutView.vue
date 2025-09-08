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
              world of vertical farming at 80 Acres Farms. Starting as a Jr. Developer in 2018, I
              discovered my passion for creating technology solutions that solve real-world problems
              when I helped build custom MRP systems for indoor agriculture operations.
            </p>
            <p class="text-body-1 mb-4">
              During my time at 80 Acres Farms, I grew from junior developer to software engineer,
              contributing to the company's remarkable journey from Series A to Series B funding. I
              specialized in Vue.js applications for automated packaging systems, integrated barcode
              scanning technology, and led the modernization of legacy systems by migrating from
              Vuetify 1.5 to 2.3 while mentoring junior developers.
            </p>
            <p class="text-body-1 mb-4">
              In 2021, I transitioned to KollaCode/IBM, where I expanded my expertise in
              enterprise-scale applications. As a Frontend Developer, I focused on compliance with
              IBM's rigorous security standards, migrated UI frameworks to align with the Carbon
              Design System, and contributed to applications used globally by IBMers. My work
              included complex database optimization and multi-language support for over 30
              languages.
            </p>
            <p class="text-body-1 mb-4">
              Currently, as a Senior Full Stack Engineer at KollaCode, I lead the development of
              international applications like the IBM Partner Plus Awards platform, which I built
              with full internationalization support for 11 languages. I spearhead modernization
              initiatives, migrating applications from Vue 2 to Vue 3, and architect scalable
              solutions that serve IBM's global partner ecosystem.
            </p>
            <p class="text-body-1 mb-6">
              What drives me is the intersection of innovative technology and meaningful impact.
              Whether it's optimizing crop production through smart farming systems or enabling
              global business partnerships through enterprise applications, I'm passionate about
              writing clean, efficient code that makes a difference. I thrive in collaborative
              environments and enjoy mentoring other developers while continuously learning new
              technologies and best practices.
            </p>

            <!-- Career Highlights -->
            <div class="career-highlights mb-6">
              <h3 class="text-h5 mb-4 text-primary">Career Highlights</h3>
              <v-row>
                <v-col cols="12" sm="6">
                  <div class="highlight-item mb-3">
                    <v-icon color="success" size="small" class="mr-2">mdi-rocket-launch</v-icon>
                    <span class="font-weight-medium"
                      >Led Vue 2 → Vue 3 modernization initiatives</span
                    >
                  </div>
                  <div class="highlight-item mb-3">
                    <v-icon color="success" size="small" class="mr-2">mdi-earth</v-icon>
                    <span class="font-weight-medium"
                      >Built applications supporting 11+ languages</span
                    >
                  </div>
                  <div class="highlight-item mb-3">
                    <v-icon color="success" size="small" class="mr-2">mdi-sprout</v-icon>
                    <span class="font-weight-medium"
                      >Developed agricultural technology solutions</span
                    >
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="highlight-item mb-3">
                    <v-icon color="success" size="small" class="mr-2">mdi-account-group</v-icon>
                    <span class="font-weight-medium"
                      >Mentored junior developers and led code reviews</span
                    >
                  </div>
                  <div class="highlight-item mb-3">
                    <v-icon color="success" size="small" class="mr-2">mdi-database</v-icon>
                    <span class="font-weight-medium"
                      >Optimized database performance and scaling</span
                    >
                  </div>
                  <div class="highlight-item mb-3">
                    <v-icon color="success" size="small" class="mr-2">mdi-security</v-icon>
                    <span class="font-weight-medium">Ensured enterprise security compliance</span>
                  </div>
                </v-col>
              </v-row>
            </div>

            <!-- Personal Interests -->
            <div class="personal-section">
              <h3 class="text-h5 mb-4 text-primary">Beyond Code</h3>
              <p class="text-body-1 mb-4">
                When I'm not developing applications, I'm passionate about staying current with
                emerging technologies and contributing to the developer community. I enjoy exploring
                the intersection of technology and sustainability, having seen firsthand how
                software can revolutionize traditional industries like agriculture.
              </p>
              <p class="text-body-1">
                I'm also an advocate for clean code practices, accessibility standards, and
                mentoring the next generation of developers. Whether it's playing guitar,
                experimenting with new JavaScript frameworks, or contributing to open source
                projects, I'm always looking for ways to grow both personally and professionally.
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
