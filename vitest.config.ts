import { defineVitestProject } from '@nuxt/test-utils/config'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      await defineVitestProject({
        test: {
          name: 'unit',
          environment: 'nuxt',
          include: ['tests/nuxt/**/*.test.ts'],
          environmentOptions: {
            nuxt: {
              // The Nuxt test environment forces ssr: false, which makes the SEO modules
              // warn on every run. Test-only: production nuxt.config.ts is unchanged.
              // Cast: the tooling tsconfig does not load the Nuxt module type augmentations.
              overrides: { ogImage: { enabled: false }, site: { indexable: false } } as Record<
                string,
                unknown
              >,
            },
          },
        },
      }),
    ],
  },
})
