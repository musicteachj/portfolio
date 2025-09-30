import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSkillsStore } from '../skills'
import type { Skill } from '@/types'

describe('Skills Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Initial State', () => {
    it('should have initial skills data', () => {
      const store = useSkillsStore()

      expect(store.skillsList).toBeDefined()
      expect(Array.isArray(store.skillsList)).toBe(true)
      expect(store.skillsList.length).toBeGreaterThan(0)
    })

    it('should have skills with correct structure', () => {
      const store = useSkillsStore()

      store.skillsList.forEach((skill) => {
        expect(skill).toHaveProperty('category')
        expect(skill).toHaveProperty('icon')
        expect(skill).toHaveProperty('color')
        expect(skill).toHaveProperty('skills')

        expect(typeof skill.category).toBe('string')
        expect(typeof skill.icon).toBe('string')
        expect(typeof skill.color).toBe('string')
        expect(Array.isArray(skill.skills)).toBe(true)
      })
    })
  })

  describe('Data Integrity', () => {
    it('should have non-empty categories', () => {
      const store = useSkillsStore()

      store.skillsList.forEach((skill) => {
        expect(skill.category.trim()).toBeTruthy()
        expect(skill.category.length).toBeGreaterThan(0)
      })
    })

    it('should have valid Material Design icons', () => {
      const store = useSkillsStore()

      store.skillsList.forEach((skill) => {
        expect(skill.icon).toMatch(/^mdi-/)
        expect(skill.icon.length).toBeGreaterThan(4) // 'mdi-' + at least one character
      })
    })

    it('should have valid color values', () => {
      const store = useSkillsStore()
      const validColors = [
        'red',
        'pink',
        'purple',
        'deep-purple',
        'indigo',
        'blue',
        'light-blue',
        'cyan',
        'teal',
        'green',
        'light-green',
        'lime',
        'yellow',
        'amber',
        'orange',
        'deep-orange',
        'brown',
        'blue-grey',
        'grey',
        'black',
        'white',
      ]

      store.skillsList.forEach((skill) => {
        expect(skill.color.trim()).toBeTruthy()
        // Should be either a valid Vuetify color or a CSS color
        expect(
          validColors.includes(skill.color) ||
            /^#[0-9A-Fa-f]{6}$/.test(skill.color) ||
            /^rgb\(/.test(skill.color) ||
            /^rgba\(/.test(skill.color),
        ).toBe(true)
      })
    })

    it('should have non-empty skills arrays', () => {
      const store = useSkillsStore()

      store.skillsList.forEach((skill) => {
        expect(skill.skills.length).toBeGreaterThan(0)

        skill.skills.forEach((skillName) => {
          expect(typeof skillName).toBe('string')
          expect(skillName.trim()).toBeTruthy()
        })
      })
    })

    it('should have unique categories', () => {
      const store = useSkillsStore()
      const categories = store.skillsList.map((skill) => skill.category)
      const uniqueCategories = [...new Set(categories)]

      expect(uniqueCategories.length).toBe(categories.length)
    })

    it('should have expected skill categories', () => {
      const store = useSkillsStore()
      const categories = store.skillsList.map((skill) => skill.category)

      // Check for expected categories (adjust based on your actual data)
      expect(categories).toContain('Programming Languages')
      expect(categories).toContain('Frontend Technologies')
      expect(categories).toContain('Backend Technologies')
      expect(categories).toContain('Databases & Storage')
      expect(categories).toContain('Cloud & DevOps')
      expect(categories).toContain('Tools & Others')
    })
  })

  describe('Skills Content Validation', () => {
    it('should have frontend skills in Frontend Technologies category', () => {
      const store = useSkillsStore()
      const frontendSkill = store.skillsList.find(
        (skill) => skill.category === 'Frontend Technologies',
      )

      if (frontendSkill) {
        const frontendTechnologies = [
          'Vue.js',
          'React.js',
          'JavaScript',
          'TypeScript',
          'CSS',
          'HTML',
        ]

        const hasRelevantSkills = frontendSkill.skills.some((skill) =>
          frontendTechnologies.some((tech) => skill.toLowerCase().includes(tech.toLowerCase())),
        )

        expect(hasRelevantSkills).toBe(true)
      }
    })

    it('should have backend skills in Backend Technologies category', () => {
      const store = useSkillsStore()
      const backendSkill = store.skillsList.find((skill) =>
        skill.category.toLowerCase().includes('backend'),
      )

      if (backendSkill) {
        const backendTechnologies = ['Node.js', 'Express', 'Database', 'API', 'SQL', 'MongoDB']

        const hasRelevantSkills = backendSkill.skills.some((skill) =>
          backendTechnologies.some((tech) => skill.toLowerCase().includes(tech.toLowerCase())),
        )

        expect(hasRelevantSkills).toBe(true)
      }
    })

    it('should have tools/devops skills in Tools category', () => {
      const store = useSkillsStore()
      const toolsSkill = store.skillsList.find(
        (skill) =>
          skill.category.toLowerCase().includes('tools') ||
          skill.category.toLowerCase().includes('devops'),
      )

      if (toolsSkill) {
        const toolsTechnologies = ['Git', 'Docker', 'CI/CD', 'Jira', 'Vite', 'CLI']

        const hasRelevantSkills = toolsSkill.skills.some((skill) =>
          toolsTechnologies.some((tech) => skill.toLowerCase().includes(tech.toLowerCase())),
        )

        expect(hasRelevantSkills).toBe(true)
      }
    })
  })

  describe('Reactivity', () => {
    it('should be reactive when skills are modified', () => {
      const store = useSkillsStore()
      const initialLength = store.skillsList.length

      // Add a new skill category
      const newSkill: Skill = {
        category: 'Tools & Others',
        icon: 'mdi-tools',
        color: 'brown',
        skills: ['Vitest', 'Jest', 'Vue Test Utils'],
      }

      store.skillsList.push(newSkill)

      expect(store.skillsList.length).toBe(initialLength + 1)
      expect(store.skillsList[store.skillsList.length - 1]).toEqual(newSkill)
    })

    it('should be reactive when individual skills are modified', () => {
      const store = useSkillsStore()

      if (store.skillsList.length > 0) {
        const firstSkill = store.skillsList[0]
        const initialSkillsCount = firstSkill.skills.length

        // Use type assertion to test reactivity with dynamic data
        firstSkill.skills.push('TypeScript' as any)

        expect(firstSkill.skills.length).toBe(initialSkillsCount + 1)
        expect(firstSkill.skills[firstSkill.skills.length - 1]).toBe('TypeScript')
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty skills array gracefully', () => {
      const store = useSkillsStore()

      // This test ensures the store can handle edge cases
      // In a real scenario, you might want to validate that skills arrays are never empty
      expect(() => {
        const emptySkill = {
          category: 'Tools & Others',
          icon: 'mdi-tools',
          color: 'brown',
          skills: [],
        } as Skill
        store.skillsList.push(emptySkill)
      }).not.toThrow()
    })

    it('should maintain data types after modifications', () => {
      const store = useSkillsStore()

      store.skillsList.forEach((skill) => {
        expect(typeof skill.category).toBe('string')
        expect(typeof skill.icon).toBe('string')
        expect(typeof skill.color).toBe('string')
        expect(Array.isArray(skill.skills)).toBe(true)
      })
    })
  })
})
