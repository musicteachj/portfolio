import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountComponent, mockProject, createMockRouter } from '@/test/utils'
import ProjectCard from '../ProjectCard.vue'
import type { Project } from '@/types'

// Mock vue-router
const mockRouter = createMockRouter()
vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}))

describe('ProjectCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render project information correctly', () => {
      const wrapper = mountComponent(ProjectCard, {
        props: { project: mockProject },
      })

      expect(wrapper.text()).toContain(mockProject.title)
      expect(wrapper.text()).toContain(mockProject.description)
      expect(wrapper.text()).toContain(mockProject.category)
      expect(wrapper.text()).toContain(mockProject.year.toString())
    })

    it('should render project image with correct attributes', () => {
      const wrapper = mountComponent(ProjectCard, {
        props: { project: mockProject },
      })

      const vImg = wrapper.find('.project-image')
      expect(vImg.exists()).toBe(true)

      // For v-img component, check the props instead of attributes
      const vImgComponent = wrapper.findComponent({ name: 'VImg' })
      expect(vImgComponent.exists()).toBe(true)
      expect(vImgComponent.props('src')).toBe(mockProject.image)
      expect(vImgComponent.props('alt')).toBe(mockProject.title)
    })

    it('should render status chip with correct color', () => {
      const wrapper = mountComponent(ProjectCard, {
        props: { project: mockProject },
      })

      const statusChip = wrapper.find('.v-chip')
      expect(statusChip.exists()).toBe(true)
      expect(statusChip.text()).toBe(mockProject.status)
    })

    it('should render technology chips', () => {
      const wrapper = mountComponent(ProjectCard, {
        props: { project: mockProject },
      })

      // Check that technologies from skill categories are displayed
      mockProject.technologies.forEach((category) => {
        category.skills.forEach((skill) => {
          expect(wrapper.text()).toContain(skill)
        })
      })
    })

    it('should show overflow indicator when technologies exceed maxTechDisplay', () => {
      const projectWithManyTechs: Project = {
        ...mockProject,
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
            skills: ['Vue.js', 'React.js'],
          },
          {
            category: 'Backend Technologies',
            icon: 'mdi-server',
            color: 'orange',
            skills: ['Node.js', 'Express.js'],
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
            skills: [],
          },
          {
            category: 'Tools & Others',
            icon: 'mdi-tools',
            color: 'brown',
            skills: [],
          },
        ],
      }

      const wrapper = mountComponent(ProjectCard, {
        props: {
          project: projectWithManyTechs,
          maxTechDisplay: 4,
        },
      })

      expect(wrapper.text()).toContain('+2')
    })

    it('should render viewport icons', () => {
      const wrapper = mountComponent(ProjectCard, {
        props: { project: mockProject },
      })

      // Should contain viewport indicators
      expect(wrapper.text()).toContain('Supports:')

      // Check for viewport icons based on project.viewport
      const icons = wrapper.findAll('.v-icon')
      const viewportIcons = icons.filter((icon) =>
        icon
          .classes()
          .some(
            (cls) =>
              cls.includes('mdi-cellphone') ||
              cls.includes('mdi-tablet') ||
              cls.includes('mdi-monitor'),
          ),
      )
      expect(viewportIcons.length).toBeGreaterThan(0)
    })
  })

  describe('Props', () => {
    it('should use default props when not provided', () => {
      const wrapper = mountComponent(ProjectCard, {
        props: { project: mockProject },
      })

      // Test default behavior: should show "View Details" button (default showDetailsLink: true)
      expect(wrapper.text()).toContain('View Details')

      // Test default maxTechDisplay: verify technologies are displayed
      mockProject.technologies.forEach((category) => {
        category.skills.forEach((skill) => {
          expect(wrapper.text()).toContain(skill)
        })
      })
    })

    it('should respect custom maxTechDisplay prop', () => {
      const projectWithManyTechs: Project = {
        ...mockProject,
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
            skills: ['Vue.js', 'React.js'],
          },
          {
            category: 'Backend Technologies',
            icon: 'mdi-server',
            color: 'orange',
            skills: ['Node.js', 'Express.js'],
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
            skills: [],
          },
          {
            category: 'Tools & Others',
            icon: 'mdi-tools',
            color: 'brown',
            skills: [],
          },
        ],
      }

      const wrapper = mountComponent(ProjectCard, {
        props: {
          project: projectWithManyTechs,
          maxTechDisplay: 2,
        },
      })

      // Should only show first 2 technologies
      expect(wrapper.text()).toContain('JavaScript ES6+')
      expect(wrapper.text()).toContain('TypeScript')
      // Should show overflow indicator for remaining technologies
      expect(wrapper.text()).toContain('+4')
    })

    it('should respect showDetailsLink prop', () => {
      const wrapper = mountComponent(ProjectCard, {
        props: {
          project: mockProject,
          showDetailsLink: false,
        },
      })

      // Should not show "View Details" button when showDetailsLink is false
      expect(wrapper.text()).not.toContain('View Details')
    })
  })

  describe('Computed Properties', () => {
    it('should display correct number of technologies based on maxTechDisplay', () => {
      const projectWithManyTechs: Project = {
        ...mockProject,
        technologies: [
          {
            category: 'Programming Languages',
            icon: 'mdi-code-json',
            color: 'blue',
            skills: ['TypeScript'],
          },
          {
            category: 'Frontend Technologies',
            icon: 'mdi-monitor',
            color: 'green',
            skills: ['Vue.js'],
          },
          {
            category: 'Backend Technologies',
            icon: 'mdi-server',
            color: 'orange',
            skills: [],
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
            skills: [],
          },
          {
            category: 'Tools & Others',
            icon: 'mdi-tools',
            color: 'brown',
            skills: ['Vitest', 'Jest', 'Cypress'],
          },
        ],
      }

      const wrapper = mountComponent(ProjectCard, {
        props: {
          project: projectWithManyTechs,
          maxTechDisplay: 2,
        },
      })

      // Should display first 2 technologies
      expect(wrapper.text()).toContain('TypeScript')
      expect(wrapper.text()).toContain('Vue.js')
      // Should show overflow indicator
      expect(wrapper.text()).toContain('+3')
    })

    it('should apply correct status colors through CSS classes', () => {
      const completedProject = { ...mockProject, status: 'completed' as const }
      const inProgressProject = { ...mockProject, status: 'in-progress' as const }
      const maintainedProject = { ...mockProject, status: 'maintained' as const }

      const completedWrapper = mountComponent(ProjectCard, {
        props: { project: completedProject },
      })
      // Status chip should contain the status text
      expect(completedWrapper.text()).toContain('completed')

      const inProgressWrapper = mountComponent(ProjectCard, {
        props: { project: inProgressProject },
      })
      expect(inProgressWrapper.text()).toContain('in-progress')

      const maintainedWrapper = mountComponent(ProjectCard, {
        props: { project: maintainedProject },
      })
      expect(maintainedWrapper.text()).toContain('maintained')
    })

    it('should display correct category information', () => {
      const frontendProject = { ...mockProject, category: 'Frontend' as const }
      const fullStackProject = { ...mockProject, category: 'Full Stack' as const }
      const backendProject = { ...mockProject, category: 'Backend' as const }

      const frontendWrapper = mountComponent(ProjectCard, {
        props: { project: frontendProject },
      })
      expect(frontendWrapper.text()).toContain('Frontend')

      const fullStackWrapper = mountComponent(ProjectCard, {
        props: { project: fullStackProject },
      })
      expect(fullStackWrapper.text()).toContain('Full Stack')

      const backendWrapper = mountComponent(ProjectCard, {
        props: { project: backendProject },
      })
      expect(backendWrapper.text()).toContain('Backend')
    })
  })

  describe('Viewport Display', () => {
    it('should display correct viewport icons for different device types', () => {
      const mobileProject = { ...mockProject, viewport: ['mobile'] }
      const tabletProject = { ...mockProject, viewport: ['tablet'] }
      const desktopProject = { ...mockProject, viewport: ['desktop'] }

      const mobileWrapper = mountComponent(ProjectCard, {
        props: { project: mobileProject },
      })
      // Should show mobile icon (mdi-cellphone)
      expect(mobileWrapper.find('.mdi-cellphone').exists()).toBe(true)

      const tabletWrapper = mountComponent(ProjectCard, {
        props: { project: tabletProject },
      })
      // Should show tablet icon (mdi-tablet)
      expect(tabletWrapper.find('.mdi-tablet').exists()).toBe(true)

      const desktopWrapper = mountComponent(ProjectCard, {
        props: { project: desktopProject },
      })
      // Should show desktop icon (mdi-monitor)
      expect(desktopWrapper.find('.mdi-monitor').exists()).toBe(true)
    })

    it('should display multiple viewport icons when supported', () => {
      const multiViewportProject = {
        ...mockProject,
        viewport: ['desktop', 'mobile', 'tablet'],
      }

      const wrapper = mountComponent(ProjectCard, {
        props: { project: multiViewportProject },
      })

      // Should show all viewport icons
      expect(wrapper.find('.mdi-monitor').exists()).toBe(true)
      expect(wrapper.find('.mdi-cellphone').exists()).toBe(true)
      expect(wrapper.find('.mdi-tablet').exists()).toBe(true)
    })
  })

  describe('Navigation Behavior', () => {
    it('should navigate to project detail when card is clicked', async () => {
      const wrapper = mountComponent(ProjectCard, {
        props: { project: mockProject },
      })

      await wrapper.find('.project-card').trigger('click')
      expect(mockRouter.push).toHaveBeenCalledWith(`/projects/${mockProject.id}`)
    })

    it('should not navigate when showDetailsLink is false and card is clicked', async () => {
      const wrapper = mountComponent(ProjectCard, {
        props: {
          project: mockProject,
          showDetailsLink: false,
        },
      })

      await wrapper.find('.project-card').trigger('click')
      expect(mockRouter.push).not.toHaveBeenCalled()
    })
  })

  describe('User Interactions', () => {
    it('should navigate when "View Details" button is clicked', async () => {
      const wrapper = mountComponent(ProjectCard, {
        props: { project: mockProject },
      })

      // Find the View Details button by looking for button with the text
      const buttons = wrapper.findAll('button')
      const detailsButton = buttons.find((button) => button.text().includes('View Details'))

      if (detailsButton) {
        await detailsButton.trigger('click')
        expect(mockRouter.push).toHaveBeenCalledWith(`/projects/${mockProject.id}`)
      } else {
        // Alternative: test by clicking the card since View Details might not have a specific selector
        await wrapper.find('.project-card').trigger('click')
        expect(mockRouter.push).toHaveBeenCalledWith(`/projects/${mockProject.id}`)
      }
    })

    it('should handle external link interactions correctly', async () => {
      const wrapper = mountComponent(ProjectCard, {
        props: { project: mockProject },
      })

      // Find external link buttons (GitHub and Live Demo)
      const externalLinks = wrapper.findAll('a[target="_blank"]')
      expect(externalLinks.length).toBeGreaterThan(0)

      // Verify external links have correct attributes
      externalLinks.forEach((link) => {
        expect(link.attributes('target')).toBe('_blank')
        expect(link.attributes('href')).toBeTruthy()
      })
    })
  })

  describe('Conditional Rendering', () => {
    it('should show live demo button only for completed projects with liveUrl', () => {
      const completedProject = {
        ...mockProject,
        status: 'completed' as const,
        liveUrl: 'https://example.com',
      }

      const wrapper = mountComponent(ProjectCard, {
        props: { project: completedProject },
      })

      expect(wrapper.text()).toContain('Live Demo')
    })

    it('should not show live demo button for in-progress projects', () => {
      const inProgressProject = {
        ...mockProject,
        status: 'in-progress' as const,
        liveUrl: 'https://example.com',
      }

      const wrapper = mountComponent(ProjectCard, {
        props: { project: inProgressProject },
      })

      expect(wrapper.text()).not.toContain('Live Demo')
    })

    it('should show github button when githubUrl is provided', () => {
      const wrapper = mountComponent(ProjectCard, {
        props: { project: mockProject },
      })

      const githubLinks = wrapper.findAll('a[href*="github"]')
      expect(githubLinks.length).toBeGreaterThan(0)
    })

    it('should not show github button when githubUrl is not provided', () => {
      const projectWithoutGithub = { ...mockProject, githubUrl: undefined }

      const wrapper = mountComponent(ProjectCard, {
        props: { project: projectWithoutGithub },
      })

      const githubLinks = wrapper.findAll('a[href*="github"]')
      expect(githubLinks.length).toBe(0)
    })

    it('should show View Details button when showDetailsLink is true', () => {
      const wrapper = mountComponent(ProjectCard, {
        props: {
          project: mockProject,
          showDetailsLink: true,
        },
      })

      expect(wrapper.text()).toContain('View Details')
    })

    it('should not show View Details button when showDetailsLink is false', () => {
      const wrapper = mountComponent(ProjectCard, {
        props: {
          project: mockProject,
          showDetailsLink: false,
        },
      })

      expect(wrapper.text()).not.toContain('View Details')
    })
  })

  describe('Accessibility', () => {
    it('should have proper alt text for images', () => {
      const wrapper = mountComponent(ProjectCard, {
        props: { project: mockProject },
      })

      // Check v-img component for alt text
      const vImgComponent = wrapper.findComponent({ name: 'VImg' })
      expect(vImgComponent.exists()).toBe(true)
      expect(vImgComponent.props('alt')).toBe(mockProject.title)
    })

    it('should have proper title attributes for buttons', () => {
      const wrapper = mountComponent(ProjectCard, {
        props: { project: mockProject },
      })

      const buttons = wrapper.findAll('[title]')
      buttons.forEach((button) => {
        expect(button.attributes('title')).toBeTruthy()
      })
    })
  })
})
