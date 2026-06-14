import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mountComponent } from '@/test/utils'
import Skills from '../Skills.vue'
import { useSkillsStore } from '@/stores/skills'

describe('Skills Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Rendering', () => {
    it('should render all skill categories', () => {
      const wrapper = mountComponent(Skills)
      const skillsStore = useSkillsStore()

      // One bento cell per skill category
      const cells = wrapper.findAll('.skill-cell')
      expect(cells.length).toBe(skillsStore.skillsList.length)
    })

    it('should render category titles correctly', () => {
      const wrapper = mountComponent(Skills)
      const skillsStore = useSkillsStore()

      skillsStore.skillsList.forEach((skillCategory) => {
        expect(wrapper.text()).toContain(skillCategory.category)
      })
    })

    it('should render category icons with correct icon classes', () => {
      const wrapper = mountComponent(Skills)
      const skillsStore = useSkillsStore()

      const icons = wrapper.findAll('.skill-cell__icon .v-icon')
      expect(icons.length).toBe(skillsStore.skillsList.length)

      skillsStore.skillsList.forEach((skillCategory, index) => {
        expect(icons[index].classes()).toContain(skillCategory.icon)
      })
    })

    it('should render all individual skills', () => {
      const wrapper = mountComponent(Skills)
      const skillsStore = useSkillsStore()

      skillsStore.skillsList.forEach((skillCategory) => {
        skillCategory.skills.forEach((skill) => {
          expect(wrapper.text()).toContain(skill)
        })
      })
    })

    it('should render a tag for each skill', () => {
      const wrapper = mountComponent(Skills)
      const skillsStore = useSkillsStore()

      const totalSkills = skillsStore.skillsList.reduce(
        (total, category) => total + category.skills.length,
        0,
      )

      const allTags = wrapper.findAll('.tech-tag')
      expect(allTags.length).toBe(totalSkills)
    })
  })

  describe('Layout and Structure', () => {
    it('should use a bento grid layout', () => {
      const wrapper = mountComponent(Skills)
      const skillsStore = useSkillsStore()

      // Root is the bento grid container
      expect(wrapper.find('.skills-bento').exists()).toBe(true)

      const cells = wrapper.findAll('.skill-cell')
      expect(cells.length).toBe(skillsStore.skillsList.length)
    })

    it('should give each cell a column span', () => {
      const wrapper = mountComponent(Skills)

      const cells = wrapper.findAll('.skill-cell')
      cells.forEach((cell) => {
        // spanFor() sets an inline grid-column span on every cell
        expect(cell.attributes('style')).toContain('grid-column')
      })
    })
  })

  describe('Store Integration', () => {
    it('should use skills store correctly', () => {
      const wrapper = mountComponent(Skills)
      const skillsStore = useSkillsStore()

      expect(skillsStore.skillsList).toBeDefined()
      expect(skillsStore.skillsList.length).toBeGreaterThan(0)

      const cells = wrapper.findAll('.skill-cell')
      expect(cells.length).toBe(skillsStore.skillsList.length)
    })

    it('should react to store changes', async () => {
      const wrapper = mountComponent(Skills)
      const skillsStore = useSkillsStore()

      const initialText = wrapper.text()
      expect(initialText).not.toContain('Postman')

      // Tools & Others accepts any string
      const toolsCategory = skillsStore.skillsList.find((c) => c.category === 'Tools & Others')!
      ;(toolsCategory.skills as string[]).push('Postman')
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Postman')
    })

    it('should handle empty skills gracefully', async () => {
      const wrapper = mountComponent(Skills)
      const skillsStore = useSkillsStore()

      const categoryIndex = 5
      expect(skillsStore.skillsList.length).toBeGreaterThan(categoryIndex)

      const initialCategoryName = skillsStore.skillsList[categoryIndex].category
      const initialChipsCount = skillsStore.skillsList[categoryIndex].skills.length
      expect(initialChipsCount).toBeGreaterThan(0)

      const initialTotalTags = wrapper.findAll('.tech-tag').length

      skillsStore.skillsList[categoryIndex].skills = []
      await wrapper.vm.$nextTick()

      // Cell + category title still rendered, just with fewer tags
      expect(wrapper.text()).toContain(initialCategoryName)

      const updatedTotalTags = wrapper.findAll('.tech-tag').length
      expect(updatedTotalTags).toBe(initialTotalTags - initialChipsCount)
    })
  })

  describe('Styling and Appearance', () => {
    it('should render a category icon per cell', () => {
      const wrapper = mountComponent(Skills)
      const skillsStore = useSkillsStore()

      const icons = wrapper.findAll('.skill-cell__icon .v-icon')
      expect(icons.length).toBe(skillsStore.skillsList.length)
    })

    it('should render category titles as headings', () => {
      const wrapper = mountComponent(Skills)
      const skillsStore = useSkillsStore()

      const titles = wrapper.findAll('h3.skill-cell__title')
      expect(titles.length).toBe(skillsStore.skillsList.length)
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const wrapper = mountComponent(Skills)
      const skillsStore = useSkillsStore()

      const headings = wrapper.findAll('h3')
      expect(headings.length).toBe(skillsStore.skillsList.length)

      headings.forEach((heading) => {
        expect(heading.text().trim()).toBeTruthy()
      })
    })

    it('should have meaningful icon usage', () => {
      const wrapper = mountComponent(Skills)

      const icons = wrapper.findAll('.v-icon')
      expect(icons.length).toBeGreaterThan(0)

      const skillsStore = useSkillsStore()
      skillsStore.skillsList.forEach((category) => {
        expect(category.icon).toMatch(/^mdi-/)
      })
    })
  })

  describe('Performance', () => {
    it('should use v-for keys correctly', () => {
      const wrapper = mountComponent(Skills)
      const skillsStore = useSkillsStore()

      const cells = wrapper.findAll('.skill-cell')
      expect(cells.length).toBe(skillsStore.skillsList.length)

      skillsStore.skillsList.forEach((category) => {
        expect(wrapper.text()).toContain(category.category)
        category.skills.forEach((skill) => {
          expect(wrapper.text()).toContain(skill)
        })
      })
    })
  })
})
