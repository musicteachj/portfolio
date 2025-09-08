// src/stores/projects.ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Project, ProjectCategory } from '@/types'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([
    {
      id: 1,
      title: 'Portfolio Website',
      description:
        'This responsive portfolio website showcasing projects and skills, built with modern web technologies and best practices.',
      longDescription:
        'A modern, responsive portfolio website built with Vue 3, TypeScript, and Vuetify 3. Features include dark/light theme toggle, smooth animations, optimized performance, and a clean, professional design. Deployed with automated CI/CD pipeline.',
      image: '/api/placeholder/400/200',
      gallery: ['/api/placeholder/800/600', '/api/placeholder/800/600'],
      technologies: ['Vue.js', 'TypeScript', 'Vuetify', 'Vite', 'Pinia', 'CSS3'],
      liveUrl: 'https://musicteachj.github.io/portfolio/',
      githubUrl: 'https://github.com/musicteachj/portfolio',
      featured: true,
      category: 'Frontend',
      year: 2025,
      status: 'in-progress',
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
    {
      id: 2,
      title: 'Barcode CRUD',
      description:
        'This responsive portfolio website showcasing projects and skills, built with modern web technologies and best practices.',
      longDescription:
        'A modern, responsive portfolio website built with Vue 3, TypeScript, and Vuetify 3. Features include dark/light theme toggle, smooth animations, optimized performance, and a clean, professional design. Deployed with automated CI/CD pipeline.',
      image: '/api/placeholder/400/200',
      gallery: ['/api/placeholder/800/600', '/api/placeholder/800/600'],
      technologies: [
        'Vue.js',
        'TypeScript',
        'Vuetify',
        'Vite',
        'Pinia',
        'CSS3',
        'Node.js',
        'Express.js',
        'PostgreSQL',
        'Cloudant DB',
        'GraphQL',
        'Hasura',
        'RESTful APIs',
        'Database Optimization',
      ],
      liveUrl: 'https://musicteachj.github.io/portfolio/',
      githubUrl: 'https://github.com/musicteachj/portfolio',
      featured: true,
      category: 'Full Stack',
      year: 2025,
      status: 'in-progress',
      features: [
        'Full Stack development with Vue.js, TypeScript, and Vuetify',
        'Database optimization with PostgreSQL and Cloudant DB',
        'GraphQL with Hasura',
        'RESTful APIs',
        'Database optimization',
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
