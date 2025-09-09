// src/stores/projects.ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Skill } from '@/types'

export const useSkillsStore = defineStore('skills', () => {
  const skillsList = ref<Skill[]>([
    {
      category: 'Frontend',
      icon: 'mdi-monitor',
      color: 'blue',
      skills: [
        'Vue.js',
        'Nuxt.js',
        'React.js',
        'Vuex/Pinia State Management',
        'JavaScript ES6+',
        'TypeScript',
        'Vuetify',
        'Bootstrap',
        'CSS/Sass',
        'Responsive Design',
        'vue-i18n (Internationalization)',
      ],
    },
    {
      category: 'Backend & Database',
      icon: 'mdi-server',
      color: 'green',
      skills: [
        'Node.js',
        'Express.js',
        'PostgreSQL',
        'Cloudant DB (NoSQL)',
        'Mongo DB (NoSQL)',
        'GraphQL',
        'REST APIs',
        'Hasura',
        'Database Optimization',
      ],
    },
    {
      category: 'Tools & DevOps',
      icon: 'mdi-tools',
      color: 'orange',
      skills: [
        'Git/GitHub',
        'Vite/Vue CLI',
        'Jira',
        'IBM API Services',
        'XLSX Processing',
        'NPM',
        'Slack/Teams',
        'Cursor AI',
        'Agent Programming',
        'Claude',
        'CI/CD',
      ],
    },
  ])

  return {
    skillsList,
  }
})
