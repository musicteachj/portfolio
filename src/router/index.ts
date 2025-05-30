// src/router/index.ts - Updated with Experience route
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: 'Your Name - Portfolio',
      description: 'Full Stack Developer & Problem Solver',
    },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: {
      title: 'About - Your Name',
      description: 'Learn more about my background and experience',
    },
  },
  {
    path: '/experience',
    name: 'experience',
    component: () => import('@/views/ExperienceView.vue'),
    meta: {
      title: 'Experience - Your Name',
      description: 'My professional work experience and career journey',
    },
  },
  {
    path: '/projects',
    name: 'projects',
    component: () => import('@/views/ProjectsView.vue'),
    meta: {
      title: 'Projects - Your Name',
      description: 'Explore my featured projects and work',
    },
  },
  {
    path: '/projects/:id',
    name: 'project-detail',
    component: () => import('@/views/ProjectDetailView.vue'),
    meta: {
      title: 'Project Details - Your Name',
      description: 'Detailed view of my project',
    },
    props: true,
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('@/views/ContactView.vue'),
    meta: {
      title: 'Contact - Your Name',
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
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      title: 'Page Not Found - Your Name',
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
