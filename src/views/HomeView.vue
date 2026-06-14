<template>
  <div>
    <!-- ============================ HERO ============================ -->
    <section id="home" class="hero" :class="{ 'hero--in': heroVisible }">
      <div class="hero__bg" aria-hidden="true"></div>
      <div class="hero__noise" aria-hidden="true"></div>

      <v-container class="hero__inner">
        <div class="hero__grid">
          <!-- Left: copy -->
          <div class="hero__copy">
            <p class="hero__eyebrow">
              <span class="hero__status-dot"></span>
              Currently @ Surface Design Solutions
            </p>

            <h1 class="hero__name">
              <span class="hero__line">James</span>
              <span class="hero__line hero__line--accent">Littlefield</span>
            </h1>

            <p class="hero__role">
              <span class="hero__prompt">$</span> Senior Software Engineer · AI Products
            </p>

            <p class="hero__desc">
              I build AI-powered products — pairing LLM integration and agentic development with the
              full-stack engineering and go-to-market to ship them. {{ yearsOfExperience }}+ years
              turning complex problems into clean, scalable products.
            </p>

            <div class="hero__actions">
              <v-btn
                color="accent"
                size="large"
                class="text-none px-6"
                prepend-icon="mdi-email-outline"
                to="/contact"
              >
                Get in touch
              </v-btn>
              <!-- Résumé download — restore when back in the market / needed again
              <v-btn
                variant="outlined"
                size="large"
                class="text-none px-6 hero__btn-ghost"
                prepend-icon="mdi-download"
                @click="downloadResume"
              >
                Download résumé
              </v-btn>
              -->
            </div>

            <div class="hero__socials">
              <a
                href="https://github.com/musicteachj"
                target="_blank"
                rel="noopener"
                aria-label="GitHub"
                class="hero__social"
              >
                <v-icon>mdi-github</v-icon>
              </a>
              <a
                href="https://www.linkedin.com/in/james-littlefield-93037713b/"
                target="_blank"
                rel="noopener"
                aria-label="LinkedIn"
                class="hero__social"
              >
                <v-icon>mdi-linkedin</v-icon>
              </a>
            </div>
          </div>

          <!-- Right: portrait + floating tech badges -->
          <div class="hero__visual">
            <div class="hero__frame"></div>
            <div class="hero__portrait">
              <v-img :src="JamesPic2" alt="James Littlefield" cover />
            </div>
            <span
              v-for="badge in techBadges"
              :key="badge.label"
              class="tech-badge"
              :style="badge.style"
            >
              {{ badge.label }}
            </span>
          </div>
        </div>
      </v-container>

      <button class="hero__scroll" @click="scrollToNext" aria-label="Scroll to content">
        <v-icon>mdi-chevron-down</v-icon>
      </button>
    </section>

    <!-- ============================ ABOUT ============================ -->
    <section id="about" class="section-spacing">
      <v-container>
        <div ref="aboutSection" class="fade-in" :class="{ visible: aboutVisible }">
          <div class="section-head">
            <span class="section-number">01</span>
            <p class="eyebrow mb-2">About</p>
            <h2 class="section-title">Building AI-powered products that matter</h2>
            <div class="accent-rule" :class="{ 'is-visible': aboutVisible }"></div>
          </div>

          <v-row>
            <v-col cols="12" md="10" lg="8">
              <p class="lead-paragraph">
                I'm a Senior Software Engineer who builds AI-powered products, with
                {{ yearsOfExperience }}+ years across enterprise web apps and the go-to-market that
                gets them used.
              </p>
              <p class="body-paragraph">
                Right now I'm at Surface Design Solutions, a physics-informed AI SaaS for
                manufacturing. I lead the frontend rebuild and work with our PhD co-founders to turn
                deep-tech research into software people can actually use, and I own the brand,
                content, and SEO side too.
              </p>
              <p class="body-paragraph">
                Before that I spent four-plus years on IBM's global applications: framework
                migrations, internationalization across 11 languages, and AI compliance tooling that
                cut hundreds of hours of manual support. I've also run content and marketing for
                early-stage teams, so I'm comfortable on both sides of a product.
              </p>
              <p class="body-paragraph">
                These days I build mostly through agentic tools like Claude Code. I spend my time on
                architecture and the decisions that matter while AI handles more of the
                implementation. What keeps me hooked is how much AI changes what a small team can
                actually ship.
              </p>
              <v-btn
                to="/about"
                variant="text"
                color="accent"
                class="text-none px-0 mt-2"
                append-icon="mdi-arrow-right"
              >
                More about me
              </v-btn>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </section>

    <!-- ======================= FEATURED PROJECTS ======================= -->
    <section class="section-spacing section-spacing--tinted">
      <v-container>
        <div ref="projectsSection" class="fade-in" :class="{ visible: projectsVisible }">
          <div class="section-head">
            <span class="section-number">02</span>
            <p class="eyebrow mb-2">Selected Work</p>
            <h2 class="section-title">Featured projects</h2>
            <div class="accent-rule" :class="{ 'is-visible': projectsVisible }"></div>
          </div>

          <v-row>
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
                :style="{ 'transition-delay': `${0.1 + index * 0.1}s` }"
              >
                <ProjectCard :project="project" />
              </div>
            </v-col>
          </v-row>

          <div class="text-center mt-10">
            <v-btn
              to="/projects"
              variant="outlined"
              size="large"
              class="text-none px-6"
              append-icon="mdi-arrow-right"
            >
              View all projects
            </v-btn>
          </div>
        </div>
      </v-container>
    </section>

    <!-- ============================ SKILLS ============================ -->
    <section class="section-spacing">
      <v-container>
        <div ref="skillsSection" class="fade-in" :class="{ visible: skillsVisible }">
          <div class="section-head">
            <span class="section-number">03</span>
            <p class="eyebrow mb-2">Toolkit</p>
            <h2 class="section-title">Technical skills</h2>
            <div class="accent-rule" :class="{ 'is-visible': skillsVisible }"></div>
          </div>
          <Skills />
        </div>
      </v-container>
    </section>

    <!-- ============================ CTA ============================ -->
    <section class="section-spacing">
      <v-container>
        <div ref="ctaSection" class="fade-in cta-card" :class="{ visible: ctaVisible }">
          <div class="cta-card__bg" aria-hidden="true"></div>
          <div class="cta-card__content">
            <p class="eyebrow mb-3" style="color: #93c5fd">Let's talk</p>
            <h2 class="cta-card__title">Have a project in mind?</h2>
            <p class="cta-card__desc">
              Always happy to talk shop, trade ideas, or collaborate on something interesting.
            </p>
            <v-btn
              to="/contact"
              color="accent"
              size="large"
              class="text-none px-6 mt-2"
              prepend-icon="mdi-email-outline"
            >
              Start a conversation
            </v-btn>
          </div>
        </div>
      </v-container>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import ProjectCard from '@/components/ProjectCard.vue'
import { useSnackbarStore } from '@/stores/snackbar'
import { useProjectsStore } from '@/stores/projects'
import Skills from '@/components/Skills.vue'
import JamesPic2 from '../assets/images/James2.jpg'

const snackbar = useSnackbarStore()
const projectsStore = useProjectsStore()

const yearsOfExperience = ref<number>(8)
const featuredProjects = computed(() => projectsStore.featuredProjects)

// Floating hero badges (positions are decorative)
const techBadges = [
  { label: 'Claude', style: 'top: 6%; left: -6%;' },
  { label: 'TypeScript', style: 'top: 28%; right: -12%;' },
  { label: 'Node.js', style: 'bottom: 20%; left: -12%;' },
  { label: 'AWS', style: 'bottom: 4%; right: -4%;' },
] as const

// Visibility flags
const heroVisible = ref<boolean>(false)
const aboutVisible = ref<boolean>(false)
const projectsVisible = ref<boolean>(false)
const skillsVisible = ref<boolean>(false)
const ctaVisible = ref<boolean>(false)

// Section template refs
const aboutSection = ref<HTMLElement | null>(null)
const projectsSection = ref<HTMLElement | null>(null)
const skillsSection = ref<HTMLElement | null>(null)
const ctaSection = ref<HTMLElement | null>(null)

function reveal(
  target: Ref<HTMLElement | null>,
  flag: Ref<boolean>,
  threshold = 0.15,
): void {
  const { stop } = useIntersectionObserver(
    target,
    ([entry]) => {
      if (entry?.isIntersecting) {
        flag.value = true
        stop()
      }
    },
    { threshold },
  )
}

const downloadResume = (): void => {
  const link = document.createElement('a')
  link.href = `${import.meta.env.BASE_URL}James_Littlefield_Senior_Full_Stack_Developer.pdf`
  link.download = 'James_Littlefield_Senior_Full_Stack_Developer.pdf'
  link.click()
  snackbar.success('Resume download started!')
}

const scrollToNext = (): void => {
  document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  // Hero is above the fold — animate in on next frame
  requestAnimationFrame(() => {
    heroVisible.value = true
  })

  reveal(aboutSection, aboutVisible, 0.2)
  reveal(projectsSection, projectsVisible, 0.15)
  reveal(skillsSection, skillsVisible, 0.15)
  reveal(ctaSection, ctaVisible, 0.3)
})
</script>

<style scoped>
/* ============================ HERO ============================ */
.hero {
  position: relative;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  overflow: hidden;
  color: #f8fafc;
  /* Bleed the dark hero up behind the transparent fixed app-bar so the
     nav's light-on-dark text is readable at the top of the page.
     64px is Vuetify 3's default app-bar height at all breakpoints. */
  margin-top: -64px;
  padding-top: 64px;
}

.hero__bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(60% 70% at 75% 20%, rgba(37, 99, 235, 0.45) 0%, transparent 60%),
    radial-gradient(50% 60% at 10% 90%, rgba(59, 130, 246, 0.3) 0%, transparent 55%),
    linear-gradient(150deg, #0b1220 0%, #0f172a 45%, #111c33 100%);
}

/* Subtle film grain for depth */
.hero__noise {
  position: absolute;
  inset: 0;
  opacity: 0.5;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E");
}

.hero__inner {
  position: relative;
  z-index: 1;
}

.hero__grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  align-items: center;
  gap: 64px;
}

/* ---- Hero copy ---- */
.hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  color: #cbd5e1;
  margin-bottom: 22px;
  opacity: 0;
  transform: translateY(16px);
  transition: all 0.6s var(--ease-out) 0.1s;
}

.hero__status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #60a5fa;
  box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.2);
  animation: pulse 2.4s infinite;
}

.hero__name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(3rem, 7vw, 5.5rem);
  line-height: 0.98;
  letter-spacing: -0.04em;
  margin: 0 0 20px;
}

.hero__line {
  display: block;
  opacity: 0;
  transform: translateY(28px);
  transition: all 0.7s var(--ease-out);
}

.hero__line--accent {
  color: transparent;
  background: linear-gradient(120deg, #60a5fa 0%, #93c5fd 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

.hero__role {
  font-family: var(--font-mono);
  font-size: clamp(1.05rem, 2vw, 1.4rem);
  font-weight: 500;
  color: #e2e8f0;
  margin: 0 0 24px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.7s var(--ease-out) 0.35s;
}

.hero__prompt {
  color: #60a5fa;
  margin-right: 6px;
}

.hero__desc {
  max-width: 520px;
  font-size: 1.08rem;
  line-height: 1.7;
  color: #cbd5e1;
  margin: 0 0 36px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.7s var(--ease-out) 0.45s;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.7s var(--ease-out) 0.55s;
}

.hero__btn-ghost {
  color: #f8fafc;
  border-color: rgba(248, 250, 252, 0.3);
}

.hero__socials {
  display: flex;
  gap: 12px;
  margin-top: 32px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.7s var(--ease-out) 0.65s;
}

.hero__social {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  color: #cbd5e1;
  border: 1px solid rgba(248, 250, 252, 0.15);
  transition: all 0.25s var(--ease-out);
}

.hero__social:hover {
  color: #f8fafc;
  border-color: #60a5fa;
  transform: translateY(-3px);
}

/* Staggered entrance once .hero--in is set */
.hero--in .hero__eyebrow,
.hero--in .hero__role,
.hero--in .hero__desc,
.hero--in .hero__actions,
.hero--in .hero__socials {
  opacity: 1;
  transform: translateY(0);
}

.hero--in .hero__line {
  opacity: 1;
  transform: translateY(0);
}

.hero--in .hero__line:nth-child(1) {
  transition-delay: 0.15s;
}

.hero--in .hero__line:nth-child(2) {
  transition-delay: 0.28s;
}

/* ---- Hero visual ---- */
.hero__visual {
  position: relative;
  width: min(380px, 100%);
  aspect-ratio: 4 / 5;
  margin-inline: auto;
}

.hero__portrait {
  position: absolute;
  inset: 0;
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  border: 1px solid rgba(248, 250, 252, 0.15);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.45);
}

.hero__frame {
  position: absolute;
  inset: 0;
  transform: translate(20px, 20px);
  border: 1.5px solid rgba(96, 165, 250, 0.5);
  border-radius: var(--border-radius-xl);
}

.tech-badge {
  position: absolute;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 500;
  padding: 8px 14px;
  border-radius: 10px;
  color: #e2e8f0;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(96, 165, 250, 0.35);
  backdrop-filter: blur(8px);
  white-space: nowrap;
  animation: float 6s ease-in-out infinite;
}

.tech-badge:nth-child(odd) {
  animation-delay: 1.5s;
}

/* ---- Scroll indicator ---- */
.hero__scroll {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  color: #cbd5e1;
  background: transparent;
  border: none;
  cursor: pointer;
  animation: bounce 2.2s infinite;
}

/* ============================ SECTIONS ============================ */
.section-spacing--tinted {
  background-color: rgb(var(--v-theme-surface-variant));
}

.section-head {
  position: relative;
  margin-bottom: 48px;
}

.section-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin-bottom: 18px;
  color: rgb(var(--v-theme-primary));
  position: relative;
  z-index: 1;
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
  margin-bottom: 8px;
}

/* ============================ CTA ============================ */
.cta-card {
  position: relative;
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  padding: clamp(40px, 6vw, 72px);
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
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  letter-spacing: -0.02em;
  color: #f8fafc;
  margin-bottom: 16px;
}

.cta-card__desc {
  max-width: 520px;
  margin: 0 auto 12px;
  color: #cbd5e1;
  font-size: 1.08rem;
  line-height: 1.7;
}

/* ============================ RESPONSIVE ============================ */
@media (max-width: 960px) {
  .hero__grid {
    grid-template-columns: 1fr;
    gap: 56px;
    text-align: center;
    padding-top: 80px;
  }

  .hero__eyebrow,
  .hero__actions,
  .hero__socials {
    justify-content: center;
  }

  .hero__desc {
    margin-inline: auto;
  }

  .hero__visual {
    width: min(300px, 80%);
    order: -1;
  }

  /* Keep floating badges from overflowing on small screens */
  .tech-badge {
    font-size: 0.72rem;
    padding: 6px 11px;
  }
}

@media (max-width: 480px) {
  .hero__frame {
    transform: translate(12px, 12px);
  }
}
</style>
