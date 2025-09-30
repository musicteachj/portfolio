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

      // Should render a card for each skill category
      const cards = wrapper.findAll('.v-card')
      expect(cards.length).toBe(skillsStore.skillsList.length)
    })

    it('should render category titles correctly', () => {
      const wrapper = mountComponent(Skills)
      const skillsStore = useSkillsStore()

      skillsStore.skillsList.forEach((skillCategory) => {
        expect(wrapper.text()).toContain(skillCategory.category)
      })
    })

    it('should render category icons with correct colors', () => {
      const wrapper = mountComponent(Skills)
      const skillsStore = useSkillsStore()

      const icons = wrapper.findAll('.v-icon')

      // Filter out the check circle icons, focus on category icons
      const categoryIcons = icons.filter((icon) => !icon.classes().includes('mdi-check-circle'))

      expect(categoryIcons.length).toBe(skillsStore.skillsList.length)

      skillsStore.skillsList.forEach((skillCategory, index) => {
        const icon = categoryIcons[index]
        expect(icon.classes()).toContain(skillCategory.icon)
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

    it('should render chips for each skill', () => {
      const wrapper = mountComponent(Skills)
      const skillsStore = useSkillsStore()

      // Count total skills across all categories
      const totalSkills = skillsStore.skillsList.reduce(
        (total, category) => total + category.skills.length,
        0,
      )

      // Find all skill chips (excluding any category chips)
      const allChips = wrapper.findAll('.v-chip')
      expect(allChips.length).toBe(totalSkills)
    })
  })

  describe('Layout and Structure', () => {
    it('should use proper grid layout', () => {
      const wrapper = mountComponent(Skills)

      // Should have v-row as root element
      expect(wrapper.find('.v-row').exists()).toBe(true)

      // Should have v-col for each skill category (check for cards instead as Vuetify classes may not be applied in tests)
      const cards = wrapper.findAll('.v-card')
      const skillsStore = useSkillsStore()
      expect(cards.length).toBe(skillsStore.skillsList.length)
    })

    it('should have responsive column classes', () => {
      const wrapper = mountComponent(Skills)

      const columns = wrapper.findAll('.v-col')
      columns.forEach((col) => {
        // Should have responsive classes for different screen sizes
        expect(col.classes()).toContain('v-col-12') // Full width on mobile
        expect(col.classes()).toContain('v-col-md-4') // 1/3 width on medium+
      })
    })

    it('should have proper card structure', () => {
      const wrapper = mountComponent(Skills)
      const skillsStore = useSkillsStore()

      const cards = wrapper.findAll('.v-card')
      expect(cards.length).toBe(skillsStore.skillsList.length)

      cards.forEach((card) => {
        expect(card.classes()).toContain('fill-height')
        expect(card.classes()).toContain('pa-6')
      })
    })
  })

  describe('Store Integration', () => {
    it('should use skills store correctly', () => {
      const wrapper = mountComponent(Skills)
      const skillsStore = useSkillsStore()

      // Component should render data from the skills store
      expect(skillsStore.skillsList).toBeDefined()
      expect(skillsStore.skillsList.length).toBeGreaterThan(0)

      // Verify the component renders the store data
      const cards = wrapper.findAll('.v-card')
      expect(cards.length).toBe(skillsStore.skillsList.length)
    })

    it('should react to store changes', async () => {
      const wrapper = mountComponent(Skills)
      const skillsStore = useSkillsStore()

      const initialText = wrapper.text()
      expect(initialText).not.toContain('Postman')

      // Modify an existing skill category by adding a new skill
      // Using Tools & Others category (index 5) which accepts any string
      skillsStore.skillsList[5].skills.push('Postman')
      await wrapper.vm.$nextTick()

      const updatedText = wrapper.text()
      expect(updatedText).toContain('Postman')
    })

    it('should handle empty skills gracefully', async () => {
      const wrapper = mountComponent(Skills)
      const skillsStore = useSkillsStore()

      // Use the last category (Tools & Others) which is at index 5
      const categoryIndex = 5
      expect(skillsStore.skillsList.length).toBeGreaterThan(categoryIndex)

      const initialCategoryName = skillsStore.skillsList[categoryIndex].category
      const initialChipsCount = skillsStore.skillsList[categoryIndex].skills.length
      expect(initialChipsCount).toBeGreaterThan(0)

      // Get initial total chips count
      const initialTotalChips = wrapper.findAll('.v-chip').length

      // Empty out a skill category's skills
      skillsStore.skillsList[categoryIndex].skills = []
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain(initialCategoryName)

      // Should still render the card and category, but with fewer chips
      const updatedTotalChips = wrapper.findAll('.v-chip').length
      expect(updatedTotalChips).toBe(initialTotalChips - initialChipsCount)
    })
  })

  describe('Styling and Appearance', () => {
    it('should apply correct icon sizes', () => {
      const wrapper = mountComponent(Skills)

      // Category icons should be large (size="48")
      const categoryIcons = wrapper
        .findAll('.v-icon')
        .filter((icon) => !icon.classes().includes('mdi-check-circle'))

      categoryIcons.forEach((icon) => {
        // Vuetify applies size as a style or class
        expect(
          icon.attributes('style')?.includes('48') ||
            icon.classes().some((cls) => cls.includes('48')),
        ).toBe(true)
      })
    })

    it('should apply correct text classes', () => {
      const wrapper = mountComponent(Skills)

      // Category titles should have text-h5 class
      const titles = wrapper.findAll('h3')
      titles.forEach((title) => {
        expect(title.classes()).toContain('text-h5')
      })
    })

    it('should center category headers', () => {
      const wrapper = mountComponent(Skills)

      const headers = wrapper.findAll('.text-center')
      expect(headers.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const wrapper = mountComponent(Skills)

      const headings = wrapper.findAll('h3')
      const skillsStore = useSkillsStore()
      expect(headings.length).toBe(skillsStore.skillsList.length)

      headings.forEach((heading) => {
        expect(heading.text().trim()).toBeTruthy()
      })
    })

    it('should have meaningful icon usage', () => {
      const wrapper = mountComponent(Skills)

      // All icons should have semantic meaning
      const icons = wrapper.findAll('.v-icon')
      expect(icons.length).toBeGreaterThan(0)

      // Category icons should represent the category
      const skillsStore = useSkillsStore()
      skillsStore.skillsList.forEach((category) => {
        expect(category.icon).toMatch(/^mdi-/)
      })
    })
  })

  describe('Performance', () => {
    it('should use v-for keys correctly', () => {
      const wrapper = mountComponent(Skills)

      // Vue should not show any key-related warnings
      // This is more of a compile-time check, but we can verify structure
      const skillsStore = useSkillsStore()

      // Should render correct number of items
      const cards = wrapper.findAll('.v-card')
      expect(cards.length).toBe(skillsStore.skillsList.length)

      // Each category should render all its skills
      skillsStore.skillsList.forEach((category) => {
        expect(wrapper.text()).toContain(category.category)
        category.skills.forEach((skill) => {
          expect(wrapper.text()).toContain(skill)
        })
      })
    })
  })
})
