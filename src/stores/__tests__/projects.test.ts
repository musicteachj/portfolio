import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProjectsStore } from '../projects'
import type { Project, ProjectCategory } from '@/types'

describe('Projects Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Initial State', () => {
    it('should have initial projects data', () => {
      const store = useProjectsStore()

      expect(store.projects).toBeDefined()
      expect(Array.isArray(store.projects)).toBe(true)
      expect(store.projects.length).toBeGreaterThan(0)
    })

    it('should have projects with correct structure', () => {
      const store = useProjectsStore()
      const project = store.projects[0]

      expect(project).toHaveProperty('id')
      expect(project).toHaveProperty('title')
      expect(project).toHaveProperty('description')
      expect(project).toHaveProperty('longDescription')
      expect(project).toHaveProperty('image')
      expect(project).toHaveProperty('technologies')
      expect(project).toHaveProperty('featured')
      expect(project).toHaveProperty('category')
      expect(project).toHaveProperty('year')
      expect(project).toHaveProperty('status')
      expect(project).toHaveProperty('features')
      expect(project).toHaveProperty('viewport')
    })
  })

  describe('Computed Properties', () => {
    it('should return featured projects', () => {
      const store = useProjectsStore()

      expect(store.featuredProjects).toBeDefined()
      expect(Array.isArray(store.featuredProjects)).toBe(true)

      // All returned projects should be featured
      store.featuredProjects.forEach((project) => {
        expect(project.featured).toBe(true)
      })
    })

    it('should return unique categories with "All" prepended', () => {
      const store = useProjectsStore()

      expect(store.categories).toBeDefined()
      expect(Array.isArray(store.categories)).toBe(true)
      expect(store.categories[0]).toBe('All')

      // Should contain unique categories from projects
      const projectCategories = [...new Set(store.projects.map((p) => p.category))]
      expect(store.categories.slice(1)).toEqual(expect.arrayContaining(projectCategories))
    })
  })

  describe('Methods', () => {
    describe('getProjectsByCategory', () => {
      it('should return all projects when category is "All"', () => {
        const store = useProjectsStore()
        const result = store.getProjectsByCategory('All')

        expect(result).toEqual(store.projects)
      })

      it('should return filtered projects by category', () => {
        const store = useProjectsStore()
        const frontendProjects = store.getProjectsByCategory('Frontend')

        frontendProjects.forEach((project) => {
          expect(project.category).toBe('Frontend')
        })
      })

      it('should return empty array for non-existent category', () => {
        const store = useProjectsStore()
        const result = store.getProjectsByCategory('NonExistent' as ProjectCategory)

        expect(result).toEqual([])
      })
    })

    describe('getProjectById', () => {
      it('should return project with matching id', () => {
        const store = useProjectsStore()
        const firstProject = store.projects[0]
        const result = store.getProjectById(firstProject.id)

        expect(result).toEqual(firstProject)
      })

      it('should return undefined for non-existent id', () => {
        const store = useProjectsStore()
        const result = store.getProjectById(999)

        expect(result).toBeUndefined()
      })

      it('should return undefined for invalid id', () => {
        const store = useProjectsStore()
        const result = store.getProjectById(-1)

        expect(result).toBeUndefined()
      })
    })
  })

  describe('Data Integrity', () => {
    it('should have valid project IDs (unique and positive)', () => {
      const store = useProjectsStore()
      const ids = store.projects.map((p) => p.id)

      // All IDs should be positive
      ids.forEach((id) => {
        expect(id).toBeGreaterThan(0)
      })

      // All IDs should be unique
      const uniqueIds = [...new Set(ids)]
      expect(uniqueIds.length).toBe(ids.length)
    })

    it('should have valid project years', () => {
      const store = useProjectsStore()
      const currentYear = new Date().getFullYear()

      store.projects.forEach((project) => {
        expect(project.year).toBeGreaterThan(2000)
        expect(project.year).toBeLessThanOrEqual(currentYear + 1) // Allow next year for planning
      })
    })

    it('should have valid project statuses', () => {
      const store = useProjectsStore()
      const validStatuses = ['completed', 'in-progress', 'maintained']

      store.projects.forEach((project) => {
        expect(validStatuses).toContain(project.status)
      })
    })

    it('should have valid project categories', () => {
      const store = useProjectsStore()
      const validCategories = ['Full Stack', 'Frontend', 'Backend', 'Mobile', 'Design']

      store.projects.forEach((project) => {
        expect(validCategories).toContain(project.category)
      })
    })

    it('should have valid viewport configurations', () => {
      const store = useProjectsStore()
      const validViewports = ['desktop', 'mobile', 'tablet']

      store.projects.forEach((project) => {
        expect(Array.isArray(project.viewport)).toBe(true)
        expect(project.viewport.length).toBeGreaterThan(0)

        project.viewport.forEach((viewport) => {
          expect(validViewports).toContain(viewport)
        })
      })
    })

    it('should have non-empty required fields', () => {
      const store = useProjectsStore()

      store.projects.forEach((project) => {
        expect(project.title.trim()).toBeTruthy()
        expect(project.description.trim()).toBeTruthy()
        expect(project.longDescription.trim()).toBeTruthy()
        expect(Array.isArray(project.technologies)).toBe(true)
        expect(project.technologies.length).toBeGreaterThan(0)
        expect(Array.isArray(project.features)).toBe(true)
        expect(project.features.length).toBeGreaterThan(0)
      })
    })
  })
})
