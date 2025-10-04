export interface Project {
  id: number
  title: string
  description: string
  longDescription: string
  image: string
  technologies: SkillsList
  liveUrl?: string
  githubUrl?: string
  featured: boolean
  category: ProjectCategory
  year: number
  features: string[]
  status: ProjectStatus
  viewport: ProjectViewport[]
}

export type ProjectCategory = 'Full Stack' | 'Frontend' | 'Backend' | 'Mobile' | 'Design'
export type ProjectStatus = 'completed' | 'in-progress' | 'maintained'
export type ProjectViewport = 'desktop' | 'mobile' | 'tablet'

export interface Experience {
  id: number
  title: string
  company: string
  period: string
  current: boolean
  achievements: string[]
  technologies: string[]
  location?: string
  description?: string
  highlights?: Array<{
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

export type ProgrammingLanguage = 'JavaScript ES6+' | 'TypeScript' | 'Python'
export type FrontendTechnology =
  | 'Vue.js'
  | 'Vue 2'
  | 'Vue 3'
  | 'React.js'
  | 'Vuex'
  | 'Vuetify'
  | 'Vuetify 2'
  | 'Vuetify 3'
  | 'Vue Router 3'
  | 'Vue Router 4'
  | 'Pinia'
  | 'HTML'
  | 'CSS'
  | 'Sass'
  | 'Bootstrap'
  | 'Carbon-vue'
export type BackendTechnology =
  | 'Node.js'
  | 'Express.js'
  | 'REST APIs'
  | 'GraphQL'
  | 'FastAPI'
  | 'Pydantic'
  | 'Motor'
export type Database = 'PostgreSQL' | 'MongoDB' | 'Cloudant DB' | 'NoSQL'
export type CloudTechnology = 'Docker' | 'CI/CD' | 'GitHub Actions' | 'Git/GitHub' | 'Railway'
export type Tool = string

export interface ProgrammingSkill {
  category: 'Programming Languages'
  icon: 'mdi-code-json'
  color: 'blue'
  skills: ProgrammingLanguage[]
}

export interface FrontendSkill {
  category: 'Frontend Technologies'
  icon: 'mdi-monitor'
  color: 'green'
  skills: FrontendTechnology[]
}

export interface BackendSkill {
  category: 'Backend Technologies'
  icon: 'mdi-server'
  color: 'orange'
  skills: BackendTechnology[]
}

export interface DatabaseSkill {
  category: 'Databases & Storage'
  icon: 'mdi-database-outline'
  color: 'red'
  skills: Database[]
}

export interface CloudSkill {
  category: 'Cloud & DevOps'
  icon: 'mdi-cloud-outline'
  color: 'purple'
  skills: CloudTechnology[]
}

export interface ToolSkill {
  category: 'Tools & Others'
  icon: 'mdi-tools'
  color: 'brown'
  skills: Tool[]
}

export type Skill =
  | ProgrammingSkill
  | FrontendSkill
  | BackendSkill
  | DatabaseSkill
  | CloudSkill
  | ToolSkill

export type SkillsList = [
  ProgrammingSkill,
  FrontendSkill,
  BackendSkill,
  DatabaseSkill,
  CloudSkill,
  ToolSkill,
]
