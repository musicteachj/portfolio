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
      image: '/assets/Portfolio.png',
      technologies: ['Vue.js', 'TypeScript', 'Vuetify', 'Vite', 'Pinia', 'CSS3', 'Node.js'],
      liveUrl: 'https://musicteachj.github.io/portfolio/',
      githubUrl: 'https://github.com/musicteachj/portfolio',
      featured: true,
      category: 'Frontend',
      year: 2025,
      status: 'completed',
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
      title: 'Barcode Gen',
      description:
        'Modern CRUD application designed for users to create, scan, and print their own barcodes',
      longDescription:
        'An accessible, simple to use application designed for users to create, scan and print their own barcodes. Built with Vue 3, Typescript, Node.js, Mongo DB, Vuelidate form validation and more. Deployed with railway',
      image: '/assets/BarcodeCrud.png',
      technologies: [
        'Vue.js',
        'TypeScript',
        'Vuetify',
        'Vite',
        'Pinia',
        'CSS3',
        'Node.js',
        'Express.js',
        'Mongo DB',
        'Quagga scanner',
      ],
      liveUrl: 'https://musicteachj.github.io/portfolio/',
      githubUrl: 'https://github.com/musicteachj/barcode-crud',
      featured: true,
      category: 'Full Stack',
      year: 2025,
      status: 'in-progress',
      features: [
        'Vue animations and transitions',
        'Form validation using Vuelidate',
        'Leveraged PrintD NPM library for printable barcodes',
        'Responsive design optimized for all devices',
        'TypeScript for enhanced code quality',
      ],
    },
  ])

  // Computed properties
  const featuredProjects = computed(() => projects.value.filter((project) => project.featured))

  const categories = computed(() => {
    const cats = [...new Set(projects.value.map((p) => p.category))]
    return ['All', ...cats] as Array<'All' | ProjectCategory>
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

  return {
    projects,
    featuredProjects,
    categories,
    getProjectsByCategory,
    getProjectById,
  }
})
