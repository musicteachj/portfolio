import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'output',
    environment: 'node',
    include: ['tests/output/**/*.test.ts'],
  },
})
