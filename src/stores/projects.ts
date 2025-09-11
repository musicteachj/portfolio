// src/stores/projects.ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Project, ProjectCategory } from '@/types'

import PortfolioPic from '../assets/images/Portfolio.png'
import BarcodeCrudPic from '../assets/images/BarcodeCrud.png'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([
    {
      id: 1,
      title: 'Portfolio Website',
      description:
        'This responsive portfolio website showcasing projects and skills, built with modern web technologies and best practices.',
      longDescription:
        'A modern, responsive portfolio website built with Vue 3, TypeScript, and Vuetify 3. Features include dark/light theme toggle, smooth animations, optimized performance, and a clean, professional design. Deployed with automated CI/CD pipeline.',
      image: PortfolioPic,
      technologies: [
        'Vue 3',
        'Vuetify 3',
        'Vite',
        'Vue Router 4',
        'Pinia',
        'JavaScript ES6+',
        'TypeScript',
        'CSS3',
        'Responsive Design',
        'Node.js',
        'Vitest',
        'GitHub Actions',
        'CI/CD',
      ],
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
      viewport: ['desktop', 'mobile', 'tablet'],
    },
    {
      id: 2,
      title: 'Barcode Gen',
      description:
        'A full-stack barcode app for scanning, creating, storing, and printing professional barcodes. Built with Vue.js/Express.js, supports 8+ types with cloud storage.',
      longDescription:
        'Barcode Gen is a comprehensive barcode lifecycle management system that enables users to scan existing barcodes using their device camera or manually create new ones with real-time validation and preview. The application supports 8+ professional barcode formats including EAN-13, UPC, CODE128, and CODE39, with automatic check digit calculation and industry-standard compliance. Built as a full-stack TypeScript application with Vue.js frontend and Express.js backend, it features MongoDB cloud storage, professional print layouts, and a mobile-optimized responsive design with fullscreen scanning interface. Users can manage up to 20 barcodes with complete CRUD operations, including bulk printing capabilities and haptic feedback for enhanced mobile experience. The application is production-ready with Railway deployment, Docker containerization, comprehensive error handling, and health monitoring endpoints.',
      image: BarcodeCrudPic,
      technologies: [
        'Vue 2',
        'Vuetify 2',
        'Vue CLI',
        'Vue Router 3',
        'Vuex',
        'JavaScript ES6+',
        'TypeScript',
        'Vuelidate',
        'PrintD',
        'Quagga scanner',
        'CSS3',
        'Responsive Design',
        'Node.js',
        'Express.js',
        'Mongo DB',
        'Railway',
        'Docker',
        'CI/CD',
      ],
      liveUrl: 'https://barcode-crud-production.up.railway.app',
      githubUrl: 'https://github.com/musicteachj/barcode-crud',
      featured: true,
      category: 'Full Stack',
      year: 2025,
      status: 'completed',
      features: [
        'Real-time barcode scanning using device camera with Quagga.js',
        'Support for 8+ barcode types (EAN-13, UPC, CODE128, etc.)',
        'MongoDB cloud storage with 20-barcode limit management',
        'Professional print functionality for individual/bulk printing',
        'Mobile-optimized responsive design with fullscreen scanning',
        'Full-stack TypeScript with Vue.js frontend & Express.js API',
        'Real-time barcode preview and validation with form checks',
        'Production-ready Railway deployment with Docker & monitoring',
      ],
      viewport: ['desktop', 'mobile', 'tablet'],
    },
    {
      id: 3,
      title: 'New Project',
      description: 'Thinking of a new project...',
      longDescription: 'Thinking of a new project...',
      image: 'https://via.placeholder.com/150',
      technologies: [
        'Vue 3',
        'Vuetify 3',
        'Vite',
        'Vue Router 4',
        'Pinia',
        'JavaScript ES6+',
        'TypeScript',
        'CSS3',
        'Node.js',
        'CI/CD',
      ],
      liveUrl: '',
      githubUrl: '',
      featured: true,
      category: 'Full Stack',
      year: 2025,
      status: 'in-progress',
      features: ['Thinking of a new project...'],
      viewport: ['desktop'],
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
