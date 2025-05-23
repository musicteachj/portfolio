// src/stores/projects.ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Project, ProjectCategory } from '@/types'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([
    {
      id: 1,
      title: 'E-Commerce Dashboard',
      description:
        'A comprehensive admin dashboard for managing products, orders, and analytics with real-time data visualization.',
      longDescription:
        'This full-featured e-commerce dashboard provides administrators with powerful tools to manage their online store. Features include real-time sales analytics, inventory management, customer relationship tools, and automated reporting. Built with modern web technologies for optimal performance and user experience.',
      image: '/api/placeholder/400/200',
      gallery: ['/api/placeholder/800/600', '/api/placeholder/800/600', '/api/placeholder/800/600'],
      technologies: [
        'Vue.js',
        'TypeScript',
        'Vuetify',
        'Chart.js',
        'Node.js',
        'MongoDB',
        'Express',
        'JWT',
      ],
      liveUrl: 'https://your-project-url.com',
      githubUrl: 'https://github.com/yourusername/ecommerce-dashboard',
      featured: true,
      category: 'Full Stack',
      year: 2024,
      status: 'completed',
      features: [
        'Real-time analytics dashboard with interactive charts',
        'Comprehensive inventory management system',
        'Customer relationship management tools',
        'Automated email notifications and alerts',
        'Mobile-responsive design for all devices',
        'Role-based access control and security',
        'Advanced filtering and search capabilities',
        'Export functionality for reports and data',
      ],
    },
    {
      id: 2,
      title: 'Task Management App',
      description:
        'A collaborative project management tool with real-time updates, file sharing, and team communication features.',
      longDescription:
        'Modern project management application designed for remote teams. Includes kanban boards, time tracking, file sharing, and integrated chat functionality. Features real-time collaboration using WebSocket technology and offline support for seamless productivity.',
      image: '/api/placeholder/400/200',
      gallery: ['/api/placeholder/800/600', '/api/placeholder/800/600', '/api/placeholder/800/600'],
      technologies: ['React', 'TypeScript', 'Firebase', 'Material-UI', 'WebSocket', 'PWA'],
      liveUrl: 'https://your-task-app.com',
      githubUrl: 'https://github.com/yourusername/task-management',
      featured: true,
      category: 'Frontend',
      year: 2024,
      status: 'maintained',
      features: [
        'Real-time collaboration with WebSocket integration',
        'Drag-and-drop Kanban board interface',
        'Built-in time tracking and reporting',
        'File sharing and document management',
        'Team chat and notification system',
        'Offline support with data synchronization',
        'Progressive Web App (PWA) capabilities',
        'Advanced project analytics and insights',
      ],
    },
    {
      id: 3,
      title: 'Portfolio Website',
      description:
        'This responsive portfolio website showcasing projects and skills, built with modern web technologies and best practices.',
      longDescription:
        'A modern, responsive portfolio website built with Vue 3, TypeScript, and Vuetify. Features include dark/light theme toggle, smooth animations, optimized performance, and a clean, professional design. Deployed with automated CI/CD pipeline.',
      image: '/api/placeholder/400/200',
      gallery: ['/api/placeholder/800/600', '/api/placeholder/800/600'],
      technologies: ['Vue.js', 'TypeScript', 'Vuetify', 'Vite', 'Pinia', 'CSS3'],
      liveUrl: 'https://yourname.dev',
      githubUrl: 'https://github.com/yourusername/portfolio',
      featured: true,
      category: 'Frontend',
      year: 2024,
      status: 'maintained',
      features: [
        'Responsive design optimized for all devices',
        'Dark/light theme toggle with persistence',
        'Smooth scroll animations and transitions',
        'TypeScript for enhanced code quality',
        'SEO optimized with proper meta tags',
        'Fast loading with Vite build optimization',
        'Accessible design following WCAG guidelines',
        'Continuous deployment with GitHub Actions',
      ],
    },
  ])

  // Computed properties
  const featuredProjects = computed(() => projects.value.filter((project) => project.featured))

  const categories = computed(() => {
    const cats = [...new Set(projects.value.map((p) => p.category))]
    return ['All', ...cats] as Array<'All' | ProjectCategory>
  })

  const projectsByYear = computed(() => {
    const grouped = projects.value.reduce(
      (acc, project) => {
        const year = project.year
        if (!acc[year]) {
          acc[year] = []
        }
        acc[year].push(project)
        return acc
      },
      {} as Record<number, Project[]>,
    )

    return Object.entries(grouped)
      .sort(([a], [b]) => parseInt(b) - parseInt(a))
      .map(([year, projects]) => ({ year: parseInt(year), projects }))
  })

  // Methods
  const getProjectsByCategory = (category: ProjectCategory | 'All'): Project[] => {
    if (category === 'All') {
      return projects.value
    }
    return projects.value.filter((project) => project.category === category)
  }

  const getProjectById = (id: number): Project | undefined => {
    return projects.value.find((project) => project.id === id)
  }

  const addProject = (project: Omit<Project, 'id'>): void => {
    const newId = Math.max(...projects.value.map((p) => p.id)) + 1
    projects.value.push({ ...project, id: newId })
  }

  const updateProject = (id: number, updates: Partial<Project>): boolean => {
    const index = projects.value.findIndex((p) => p.id === id)
    if (index !== -1) {
      projects.value[index] = { ...projects.value[index], ...updates }
      return true
    }
    return false
  }

  const deleteProject = (id: number): boolean => {
    const index = projects.value.findIndex((p) => p.id === id)
    if (index !== -1) {
      projects.value.splice(index, 1)
      return true
    }
    return false
  }

  return {
    projects,
    featuredProjects,
    categories,
    projectsByYear,
    getProjectsByCategory,
    getProjectById,
    addProject,
    updateProject,
    deleteProject,
  }
})
