export interface Project {
  id: number
  title: string
  description: string
  longDescription: string
  image: string
  gallery: string[]
  technologies: string[]
  liveUrl?: string
  githubUrl?: string
  featured: boolean
  category: ProjectCategory
  year: number
  features: string[]
  status: ProjectStatus
}

export type ProjectCategory = 'Full Stack' | 'Frontend' | 'Backend' | 'Mobile' | 'Design'
export type ProjectStatus = 'completed' | 'in-progress' | 'maintained'

export interface Skill {
  name: string
  category: SkillCategory
  level: SkillLevel
  icon?: string
}

export type SkillCategory = 'Frontend' | 'Backend' | 'Database' | 'Tools' | 'Cloud' | 'Design'
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export interface Experience {
  id: number
  title: string
  company: string
  period: string
  current: boolean
  achievements: string[]
  technologies: string[]
  location?: string
  description?: string // Add this
  highlights?: Array<{
    // Add this
    name: string
    description: string
  }>
}

export interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}

export interface SnackbarState {
  show: boolean
  message: string
  color: 'success' | 'error' | 'warning' | 'info'
  timeout: number
}

export interface NavigationItem {
  title: string
  to: string
  icon: string
  external?: boolean
}

export interface SocialLink {
  name: string
  url: string
  icon: string
  color?: string
}
