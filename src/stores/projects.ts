import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Project, ProjectCategory } from '@/types'

import PortfolioPic from '../assets/images/Portfolio2.png'
import BarcodeCrudPic from '../assets/images/BarcodeCrud.png'
import EmployeeManagementPic from '../assets/images/Employee.png'
import CrapsGamePic from '../assets/images/Craps.png'

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
        {
          category: 'Programming Languages',
          icon: 'mdi-code-json',
          color: 'blue',
          skills: ['JavaScript ES6+', 'TypeScript'],
        },
        {
          category: 'Frontend Technologies',
          icon: 'mdi-monitor',
          color: 'green',
          skills: ['Vue 3', 'Vuetify 3', 'Vue Router 4', 'Pinia', 'CSS'],
        },
        {
          category: 'Backend Technologies',
          icon: 'mdi-server',
          color: 'orange',
          skills: ['Node.js'],
        },
        {
          category: 'Databases & Storage',
          icon: 'mdi-database-outline',
          color: 'red',
          skills: [],
        },
        {
          category: 'Cloud & DevOps',
          icon: 'mdi-cloud-outline',
          color: 'purple',
          skills: ['CI/CD', 'Git/GitHub', 'GitHub Actions'],
        },
        {
          category: 'Tools & Others',
          icon: 'mdi-tools',
          color: 'brown',
          skills: [
            'Vite',
            'UI/UX Design',
            'Responsive Design',
            'Vitest',
            'Unit Tests',
            'Component Testing',
          ],
        },
      ],
      liveUrl: 'https://jameslittlefield.net',
      githubUrl: 'https://github.com/musicteachj/portfolio',
      featured: false,
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
        'Barcode Gen is a comprehensive barcode lifecycle management system that enables users to scan existing barcodes using their device camera or manually create new ones with real-time validation and preview. The application supports 8+ professional barcode formats including EAN-13, UPC, CODE128, and CODE39, with automatic check digit calculation and industry-standard compliance. Built as a full-stack TypeScript application with Vue.js frontend and Express.js backend, it features MongoDB cloud storage, professional print layouts, and a mobile-optimized responsive design with fullscreen scanning interface. Users can manage up to 20 barcodes with complete CRUD operations, including bulk printing capabilities and haptic feedback for enhanced mobile experience. The application is production-ready with AWS deployment using ECS for container orchestration on EC2 instances, Route 53 for DNS management, CloudFront for content delivery, Docker containerization, comprehensive error handling, Jest unit tests, and health monitoring endpoints.',
      image: BarcodeCrudPic,
      technologies: [
        {
          category: 'Programming Languages',
          icon: 'mdi-code-json',
          color: 'blue',
          skills: ['JavaScript ES6+', 'TypeScript'],
        },
        {
          category: 'Frontend Technologies',
          icon: 'mdi-monitor',
          color: 'green',
          skills: ['Vue 2', 'Vuetify 2', 'Vuex', 'Vue Router 3', 'CSS'],
        },
        {
          category: 'Backend Technologies',
          icon: 'mdi-server',
          color: 'orange',
          skills: ['Express.js', 'Node.js', 'REST APIs'],
        },
        {
          category: 'Databases & Storage',
          icon: 'mdi-database-outline',
          color: 'red',
          skills: ['MongoDB', 'NoSQL'],
        },
        {
          category: 'Cloud & DevOps',
          icon: 'mdi-cloud-outline',
          color: 'purple',
          skills: [
            'CI/CD',
            'Docker',
            'Git/GitHub',
            'GitHub Actions',
            'AWS',
            'CloudFront',
            'S3',
            'Route 53',
            'EC2',
            'ECS',
          ],
        },
        {
          category: 'Tools & Others',
          icon: 'mdi-tools',
          color: 'brown',
          skills: [
            'Vue CLI',
            'Jest Unit Tests',
            'UI/UX Design',
            'Quagga scanner',
            'PrintD',
            'Vuelidate',
            'Vue-barcode',
          ],
        },
      ],
      liveUrl: 'https://barcode.jameslittlefield.net',
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
        'Jest unit tests for frontend and backend',
        'Production-ready AWS deployment with ECS, EC2, Route 53 & monitoring',
      ],
      viewport: ['desktop', 'mobile', 'tablet'],
    },
    {
      id: 3,
      title: 'Employee Management System',
      description:
        'Full‑stack employee management system to create/search/update records, assign managers, visualize org charts, run bulk updates, and schedule/conduct reviews with real‑time analytics on headcount, departments, salaries, and trends.',
      longDescription:
        'Employee Management System is a full-stack web application for centralizing and streamlining HR operations that lets you create, update, search, and organize employee records; assign managers; visualize the org chart; perform bulk updates; and manage performance reviews end-to-end (scheduling, conducting, tracking, and monitoring overdue reviews), with an interactive analytics dashboard that surfaces key insights like department and status distributions, job levels, salaries, and hiring/performance trends via rich charts. The frontend is built with Vue 3, Vuetify, Pinia, and Chart.js, while the backend uses FastAPI with async MongoDB (Motor), featuring JWT authentication, environment-based configuration, and Vite-powered local development with SPA serving in production. The application is deployed on AWS using ECS Fargate for serverless container orchestration, ECR for Docker image registry, Application Load Balancer for HTTPS routing with host-based rules, Route 53 for DNS management, AWS Secrets Manager for secure credential storage (MongoDB and JWT secrets), and CloudWatch Logs for monitoring, with the database hosted on MongoDB Atlas for managed, scalable data persistence. The entire stack is containerized using multi-stage Docker builds and deployed via a GitHub Actions CI/CD pipeline, enabling automated builds and deployments on every push to main.',
      image: EmployeeManagementPic,
      technologies: [
        {
          category: 'Programming Languages',
          icon: 'mdi-code-json',
          color: 'blue',
          skills: ['JavaScript ES6+', 'TypeScript', 'Python'],
        },
        {
          category: 'Frontend Technologies',
          icon: 'mdi-monitor',
          color: 'green',
          skills: ['Vue 3', 'Vuetify 3', 'Vue Router 4', 'Pinia', 'CSS'],
        },
        {
          category: 'Backend Technologies',
          icon: 'mdi-server',
          color: 'orange',
          skills: ['FastAPI', 'Pydantic', 'Motor'],
        },
        {
          category: 'Databases & Storage',
          icon: 'mdi-database-outline',
          color: 'red',
          skills: ['MongoDB', 'NoSQL'],
        },
        {
          category: 'Cloud & DevOps',
          icon: 'mdi-cloud-outline',
          color: 'purple',
          skills: [
            'CI/CD',
            'Docker',
            'Git/GitHub',
            'GitHub Actions',
            'AWS',
            'ECS',
            'EC2',
            'Route 53',
          ],
        },
        {
          category: 'Tools & Others',
          icon: 'mdi-tools',
          color: 'brown',
          skills: ['Vite', 'Vee-validate', 'Chart.js', 'JWT', 'PIP', 'Zod', 'XLSX'],
        },
      ],
      liveUrl: 'https://employees.jameslittlefield.net',
      githubUrl: 'https://github.com/musicteachj/employee-management-system',
      featured: true,
      category: 'Full Stack',
      year: 2025,
      status: 'completed',
      features: [
        'JWT authentication built from scratch (no external auth libraries)',
        'Full-stack TypeScript + Python with type-safe validation',
        'Interactive analytics dashboard with 8 real-time chart visualizations',
        'Advanced multi-criteria employee search and filtering',
        'Bulk operations for managing multiple employees simultaneously',
        'Interactive organizational hierarchy chart with manager reporting',
        'Performance review tracking and scheduling system',
        'RESTful API with auto-generated FastAPI documentation',
        'Reactive state management using Pinia stores',
        'Responsive Material Design UI with Vuetify components',
        'MongoDB with async operations using Motor driver',
        'Docker containerized and AWS cloud-ready architecture',
        'Protected routes with token-based stateless authentication',
        'Password hashing with bcrypt for security best practices',
        'Vue 3 Composition API with modern reactive programming patterns',
      ],
      viewport: ['desktop', 'tablet'],
    },
    {
      id: 4,
      title: 'Craps Game',
      description:
        'Craps is an interactive web-based dice game that simulates a simplified version of casino craps. Built with React.js, Vite, Styled-Components, and Vitest for testing.',
      longDescription:
        'An interactive web-based implementation of simplified craps featuring a React-based UI with animated dice, real-time game state management, and comprehensive game statistics. Built with TypeScript, styled-components, and Vitest for testing, this application demonstrates modern frontend development practices including component composition, type safety, and test-driven development.',
      image: CrapsGamePic,
      technologies: [
        {
          category: 'Programming Languages',
          icon: 'mdi-code-json',
          color: 'blue',
          skills: ['JavaScript ES6+', 'TypeScript'],
        },
        {
          category: 'Frontend Technologies',
          icon: 'mdi-monitor',
          color: 'green',
          skills: ['React.js', 'React DOM', 'CSS', 'Styled-Components'],
        },
        {
          category: 'Backend Technologies',
          icon: 'mdi-server',
          color: 'orange',
          skills: ['Node.js'],
        },
        {
          category: 'Databases & Storage',
          icon: 'mdi-database-outline',
          color: 'red',
          skills: [],
        },
        {
          category: 'Cloud & DevOps',
          icon: 'mdi-cloud-outline',
          color: 'purple',
          skills: ['Git/GitHub', 'GitHub Actions', 'CI/CD', 'GitHub Pages'],
        },
        {
          category: 'Tools & Others',
          icon: 'mdi-tools',
          color: 'brown',
          skills: [
            'Vite',
            'Vitest',
            'ESLint',
            'Yarn',
            'Cursor AI',
            'Claude AI',
            'Agentic Programming',
          ],
        },
      ],
      liveUrl: 'https://musicteachj.github.io/city-base-craps/',
      githubUrl: 'https://github.com/musicteachj/city-base-craps',
      featured: true,
      category: 'Frontend',
      year: 2025,
      status: 'completed',
      features: [
        'Interactive casino-style craps game with simplified ruleset',
        'Built with React 18 and TypeScript for type safety',
        'Real-time bankroll management and betting system',
        'Animated 3D CSS dice displaying actual roll values',
        'Comprehensive input validation with user-friendly error messages',
        'Configurable bankroll ($5-$1000) and bet amounts',
        'Game statistics showing total wins/losses and final bankroll',
        'Fully responsive design for mobile, tablet, and desktop',
        'WCAG accessibility compliant with semantic HTML and ARIA labels',
        'Styled with styled-components for component-scoped CSS',
        'Built with Vite for fast development and optimized production builds',
        'Comprehensive unit tests using Vitest and React Testing Library',
        'Automated deployment to GitHub Pages via GitHub Actions',
      ],
      viewport: ['desktop', 'mobile', 'tablet'],
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
