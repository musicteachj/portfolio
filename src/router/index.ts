// src/router/index.ts - Updated with Experience route
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Views
import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import ExperienceView from '@/views/ExperienceView.vue'
import ProjectsView from '@/views/ProjectsView.vue'
import ProjectDetailView from '@/views/ProjectDetailView.vue'
import ContactView from '@/views/ContactView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'James Littlefield - Portfolio',
      description: 'Senior Full Stack Developer & Problem Solver',
    },
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
    meta: {
      title: 'About - James Littlefield',
      description: 'Learn more about my background and experience',
    },
  },
  {
    path: '/experience',
    name: 'experience',
    component: ExperienceView,
    meta: {
      title: 'Experience - James Littlefield',
      description: 'My professional work experience and career journey',
    },
  },
  {
    path: '/projects',
    name: 'projects',
    component: ProjectsView,
    meta: {
      title: 'Projects - James Littlefield',
      description: 'Explore my featured projects and work',
    },
  },
  {
    path: '/projects/:id',
    name: 'project-detail',
    component: ProjectDetailView,
    meta: {
      title: 'Project Details - James Littlefield',
      description: 'Detailed view of my project',
    },
    props: true,
  },
  {
    path: '/contact',
    name: 'contact',
    component: ContactView,
    meta: {
      title: 'Contact - James Littlefield',
      description: 'Get in touch for opportunities and collaborations',
    },
  },
  // Redirects
  {
    path: '/home',
    redirect: '/',
  },
  {
    path: '/portfolio',
    redirect: '/projects',
  },
  {
    path: '/work',
    redirect: '/experience',
  },
  // 404 Not Found - must be last
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: {
      title: 'Page Not Found - James Littlefield',
      description: 'The page you are looking for does not exist',
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    } else {
      return { top: 0 }
    }
  },
})

router.beforeEach((to, _from, next) => {
  if (to.meta?.title) {
    document.title = to.meta.title as string
  }

  if (to.meta?.description) {
    let metaDescription = document.querySelector('meta[name="description"]')
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      document.head.appendChild(metaDescription)
    }
    metaDescription.setAttribute('content', to.meta.description as string)
  }

  next()
})

router.beforeResolve((_to, _from, next) => {
  next()
})

router.onError((error) => {
  console.error('Router error:', error)
})

export default router
