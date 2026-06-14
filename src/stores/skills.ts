import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { SkillsList } from '@/types'

export const useSkillsStore = defineStore('skills', () => {
  const skillsList = ref<SkillsList>([
    {
      category: 'AI & Agentic Development',
      icon: 'mdi-robot-outline',
      color: 'blue',
      skills: [
        'Claude / LLM Integration',
        'Agentic Development',
        'Claude Code',
        'Claude Design',
        'Cursor AI',
        'Prompt Engineering',
        'AI Product Design',
      ],
    },
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
      skills: [
        'Vue.js',
        'Nuxt.js',
        'React.js',
        'Vuetify',
        'PrimeVue',
        'Vuex',
        'Pinia',
        'HTML',
        'CSS',
        'Sass',
        'Bootstrap',
        'Carbon-vue',
        'AG Grid',
        'Chart.js',
        'D3',
      ],
    },
    {
      category: 'Backend Technologies',
      icon: 'mdi-server',
      color: 'orange',
      skills: ['Node.js', 'Express.js', 'REST APIs', 'GraphQL', 'FastAPI', 'OAuth', 'OIDC'],
    },
    {
      category: 'Databases & Storage',
      icon: 'mdi-database-outline',
      color: 'red',
      skills: ['PostgreSQL', 'MongoDB', 'Cloudant DB', 'NoSQL'],
    },
    {
      category: 'Cloud & DevOps',
      icon: 'mdi-cloud-outline',
      color: 'purple',
      skills: [
        'Docker',
        'CI/CD',
        'GitHub Actions',
        'Git/GitHub',
        'GitHub Pages',
        'AWS',
        'CloudFront',
        'S3',
        'Route 53',
        'EC2',
        'ECS',
        'ECR',
        'RDS',
        'Secrets Manager',
      ],
    },
    {
      category: 'Tools & Others',
      icon: 'mdi-tools',
      color: 'brown',
      skills: [
        'NPM',
        'Yarn',
        'Vite',
        'Jest',
        'Vitest',
        'UI/UX Design',
        'Jira',
        'Slack/Teams',
      ],
    },
  ])

  return {
    skillsList,
  }
})
