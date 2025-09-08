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
        'Vue 2 & Vue 3',
        'React',
        'TypeScript',
        'Vuetify 2 & 3',
        'Nuxt.js',
        'JavaScript ES6+',
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
        'GraphQL',
        'Hasura',
        'RESTful APIs',
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
        'Vuex/Pinia State Management',
        'Jira',
        'IBM API Services',
        'XLSX Processing',
        'NPM',
        'Slack/Teams',
        'Cursor AI',
      ],
    },
  ])

  return {
    skillsList,
  }
})
