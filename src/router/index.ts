// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Import views
import HomeView from '@/views/HomeView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
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
    props: true, // Pass route params as props to component
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
  // Redirect old URLs or common variations
  {
    path: '/home',
    redirect: '/',
  },
  {
    path: '/portfolio',
    redirect: '/projects',
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
  scrollBehavior(to, from, savedPosition) {
    // Handle scroll behavior for better UX
    if (savedPosition) {
      // Return to saved position (browser back/forward)
      return savedPosition
    } else if (to.hash) {
      // Smooth scroll to anchor links
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    } else {
      // Scroll to top for new pages
      return { top: 0 }
    }
  },
})

// Global navigation guards
router.beforeEach((to, from, next) => {
  // Update page title
  if (to.meta.title) {
    document.title = to.meta.title as string
  }

  // Update meta description
  if (to.meta.description) {
    let metaDescription = document.querySelector('meta[name="description"]')
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      document.head.appendChild(metaDescription)
    }
    metaDescription.setAttribute('content', to.meta.description as string)
  }

  // Continue navigation
  next()
})

// Optional: Add loading state for lazy-loaded routes
router.beforeResolve((to, from, next) => {
  // You can add a loading spinner here if needed
  next()
})

// Handle navigation errors
router.onError((error) => {
  console.error('Router error:', error)
  // You could redirect to an error page or show a notification
})

export default router
