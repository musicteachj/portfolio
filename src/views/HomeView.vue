<template>
  <div>
    <!-- Hero Section -->
    <section id="home" class="hero-section">
      <v-container class="fill-height">
        <v-row align="center" justify="center" class="text-center">
          <v-col cols="12" md="8">
            <div class="fade-in" :class="{ visible: heroVisible }">
              <v-avatar size="180" class="mb-8 elevation-8">
                <v-img
                  src="/api/placeholder/180/180"
                  alt="Profile Picture"
                  class="profile-image"
                ></v-img>
              </v-avatar>

              <h1 class="display-1 font-weight-bold mb-4">
                Hi, I'm <span class="text-accent">Your Name</span>
              </h1>

              <div class="text-h4 mb-6">
                <v-icon size="small" class="mr-2">mdi-code-tags</v-icon>
                Full Stack Developer & Problem Solver
              </div>

              <p class="text-h6 mb-8 mx-auto" style="max-width: 600px; opacity: 0.9">
                Passionate about creating innovative web applications and solving complex problems
                with clean, efficient code.
              </p>

              <div class="d-flex justify-center flex-wrap ga-4">
                <v-btn
                  color="white"
                  variant="outlined"
                  size="large"
                  @click="downloadResume"
                  prepend-icon="mdi-download"
                >
                  Download Resume
                </v-btn>
                <v-btn
                  to="/contact"
                  color="white"
                  variant="flat"
                  size="large"
                  prepend-icon="mdi-email"
                >
                  Get In Touch
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Scroll Indicator -->
        <div class="text-center" style="position: absolute; bottom: 20px; width: 100%">
          <v-btn icon variant="text" color="white" @click="scrollToNext" class="scroll-indicator">
            <v-icon>mdi-chevron-down</v-icon>
          </v-btn>
        </div>
      </v-container>
    </section>

    <!-- Quick About Section -->
    <section class="section-spacing">
      <v-container>
        <v-row>
          <v-col cols="12" md="8" offset-md="2" class="text-center">
            <div class="fade-in" :class="{ visible: aboutVisible }">
              <h2 class="text-h3 font-weight-bold mb-6">Building Digital Experiences</h2>
              <p class="text-h6 mb-8" style="opacity: 0.8">
                {{ yearsOfExperience }}+ years of experience creating web applications that solve
                real-world problems with modern technologies.
              </p>

              <div class="d-flex justify-center flex-wrap ga-2 mb-8">
                <v-chip
                  v-for="skill in featuredSkills"
                  :key="skill"
                  color="primary"
                  variant="outlined"
                  size="large"
                >
                  {{ skill }}
                </v-chip>
              </div>

              <v-btn
                to="/about"
                color="primary"
                variant="outlined"
                size="large"
                append-icon="mdi-arrow-right"
              >
                Learn More About Me
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Featured Projects -->
    <section class="section-spacing" style="background-color: rgb(var(--v-theme-surface))">
      <v-container>
        <v-row>
          <v-col cols="12" class="text-center mb-8">
            <h2 class="text-h3 font-weight-bold mb-4">Featured Projects</h2>
            <p class="text-h6" style="opacity: 0.7">My recent work that I'm proud of</p>
          </v-col>

          <v-col
            v-for="(project, index) in featuredProjects"
            :key="project.id"
            cols="12"
            md="6"
            lg="4"
          >
            <div
              class="fade-in"
              :class="{ visible: projectsVisible }"
              :style="{ 'transition-delay': `${index * 0.1}s` }"
            >
              <ProjectCard :project="project" />
            </div>
          </v-col>

          <v-col cols="12" class="text-center mt-6">
            <v-btn
              to="/projects"
              color="primary"
              variant="flat"
              size="large"
              append-icon="mdi-arrow-right"
            >
              View All Projects
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Skills Overview -->
    <section class="section-spacing">
      <v-container>
        <v-row>
          <v-col cols="12" class="text-center mb-8">
            <h2 class="text-h3 font-weight-bold mb-4">Technical Skills</h2>
          </v-col>

          <v-col
            v-for="(skillCategory, index) in skillCategories"
            :key="skillCategory.name"
            cols="12"
            md="4"
          >
            <div
              class="fade-in"
              :class="{ visible: skillsVisible }"
              :style="{ 'transition-delay': `${index * 0.1}s` }"
            >
              <v-card elevation="4" class="pa-4 fill-height">
                <div class="text-center mb-4">
                  <v-icon :color="skillCategory.color" size="48">{{ skillCategory.icon }}</v-icon>
                  <h3 class="text-h5 mt-2">{{ skillCategory.name }}</h3>
                </div>
                <div class="d-flex flex-wrap justify-center ga-2">
                  <v-chip
                    v-for="skill in skillCategory.skills"
                    :key="skill"
                    :color="skillCategory.color"
                    variant="outlined"
                    size="small"
                  >
                    {{ skill }}
                  </v-chip>
                </div>
              </v-card>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Contact CTA -->
    <section class="section-spacing">
      <v-container>
        <v-row>
          <v-col cols="12" md="8" offset-md="2">
            <v-card elevation="12" class="pa-8 text-center" color="primary" theme="dark">
              <h2 class="text-h3 font-weight-bold mb-4">Let's Work Together</h2>
              <p class="text-h6 mb-6" style="opacity: 0.9">
                I'm always interested in new opportunities and exciting projects.
              </p>
              <v-btn
                to="/contact"
                color="white"
                variant="flat"
                size="large"
                prepend-icon="mdi-email"
              >
                Start a Conversation
              </v-btn>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import ProjectCard from '@/components/ProjectCard.vue'
import { useSnackbarStore } from '@/stores/snackbar'
import { useProjectsStore } from '@/stores/projects'

// Stores
const snackbar = useSnackbarStore()
const projectsStore = useProjectsStore()

// Reactive data
const heroVisible = ref<boolean>(false)
const aboutVisible = ref<boolean>(false)
const projectsVisible = ref<boolean>(false)
const skillsVisible = ref<boolean>(false)

const yearsOfExperience = ref<number>(3)

const featuredSkills: string[] = ['Vue.js', 'React', 'TypeScript', 'Node.js', 'Python', 'AWS']

const skillCategories = ref([
  {
    name: 'Frontend',
    icon: 'mdi-monitor',
    color: 'blue',
    skills: ['Vue.js', 'React', 'TypeScript', 'HTML5', 'CSS3', 'Sass'],
  },
  {
    name: 'Backend',
    icon: 'mdi-server',
    color: 'green',
    skills: ['Node.js', 'Python', 'Express', 'Django', 'PostgreSQL', 'MongoDB'],
  },
  {
    name: 'Tools & Cloud',
    icon: 'mdi-tools',
    color: 'orange',
    skills: ['Git', 'Docker', 'AWS', 'Firebase', 'Vite', 'Jest'],
  },
])

// Computed
const featuredProjects = computed(() => projectsStore.featuredProjects)

// Methods
const downloadResume = (): void => {
  // In a real implementation, this would download your actual resume
  const link = document.createElement('a')
  link.href = '/resume.pdf' // Replace with actual resume path
  link.download = 'Your_Name_Resume.pdf'
  link.click()

  snackbar.success('Resume download started!')
}

const scrollToNext = (): void => {
  const nextSection = document.querySelector('.section-spacing')
  if (nextSection) {
    nextSection.scrollIntoView({ behavior: 'smooth' })
  }
}

// Intersection observers for animations
onMounted(() => {
  // Hero section observer
  const heroTarget = ref<HTMLElement | null>(null)
  const { stop: stopHeroObserver } = useIntersectionObserver(
    heroTarget,
    ([{ isIntersecting }]) => {
      if (isIntersecting) {
        heroVisible.value = true
        stopHeroObserver()
      }
    },
    { threshold: 0.1 },
  )

  // About section observer
  const aboutTarget = ref<HTMLElement | null>(null)
  const { stop: stopAboutObserver } = useIntersectionObserver(
    aboutTarget,
    ([{ isIntersecting }]) => {
      if (isIntersecting) {
        aboutVisible.value = true
        stopAboutObserver()
      }
    },
    { threshold: 0.3 },
  )

  // Projects section observer
  const projectsTarget = ref<HTMLElement | null>(null)
  const { stop: stopProjectsObserver } = useIntersectionObserver(
    projectsTarget,
    ([{ isIntersecting }]) => {
      if (isIntersecting) {
        projectsVisible.value = true
        stopProjectsObserver()
      }
    },
    { threshold: 0.2 },
  )

  // Skills section observer - FIXED
  const skillsTarget = ref<HTMLElement | null>(null)
  const { stop: stopSkillsObserver } = useIntersectionObserver(
    skillsTarget,
    ([{ isIntersecting }]) => {
      if (isIntersecting) {
        skillsVisible.value = true
        stopSkillsObserver()
      }
    },
    { threshold: 0.2 },
  )

  // Set targets to actual DOM elements
  setTimeout(() => {
    heroTarget.value = document.getElementById('home')
    aboutTarget.value = document.querySelector('.section-spacing:nth-of-type(1)')
    projectsTarget.value = document.querySelector('.section-spacing:nth-of-type(2)')
    skillsTarget.value = document.querySelector('.section-spacing:nth-of-type(3)')
  }, 100)
})
</script>

<style scoped>
.profile-image {
  border: 4px solid rgba(255, 255, 255, 0.3);
}

.scroll-indicator {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.fade-in {
  opacity: 0;
  transform: translateY(30px);
  transition:
    opacity 0.8s ease-out,
    transform 0.8s ease-out;
}

.fade-in.visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
