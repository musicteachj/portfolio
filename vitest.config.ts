import { defineVitestProject } from '@nuxt/test-utils/config'
import { defineConfig } from 'vitest/config'

// Loading the Nuxt project boots the full module stack (and forces ssr: false), which prints
// SEO module warnings. Skip it when only the output project is requested.
const outputOnly = process.argv.some(
  (arg, i, args) => args[i - 1] === '--project' && arg === 'output',
)

const output = {
  test: {
    name: 'output',
    environment: 'node',
    include: ['tests/output/**/*.test.ts'],
  },
}

export default defineConfig({
  test: {
    passWithNoTests: true,
    projects: outputOnly
      ? [output]
      : [
          await defineVitestProject({
            test: {
              name: 'unit',
              environment: 'nuxt',
              include: ['tests/unit/**/*.test.ts'],
              passWithNoTests: true,
            },
          }),
          output,
        ],
  },
})
