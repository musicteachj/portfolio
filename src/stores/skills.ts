import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { SkillsList } from '@/types'

export const useSkillsStore = defineStore('skills', () => {
  const skillsList = ref<SkillsList>([
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
        'React.js',
        'Vuetify',
        'Vuex',
        'Pinia',
        'HTML',
        'CSS',
        'Sass',
        'Bootstrap',
        'Carbon-vue',
      ],
    },
    {
      category: 'Backend Technologies',
      icon: 'mdi-server',
      color: 'orange',
      skills: ['Node.js', 'Express.js', 'REST APIs', 'GraphQL', 'FastAPI'],
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
      skills: ['Docker', 'CI/CD', 'GitHub Actions', 'Git/GitHub', 'Railway'],
    },
    {
      category: 'Tools & Others',
      icon: 'mdi-tools',
      color: 'brown',
      skills: [
        'Vite',
        'Jest',
        'UI/UX Design',
        'Jira',
        'OAuth',
        'Cursor AI',
        'Claude AI',
        'Agent Programming',
        'Slack/Teams',
      ],
    },
  ])

  return {
    skillsList,
  }
})
