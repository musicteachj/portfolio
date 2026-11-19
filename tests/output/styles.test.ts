import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from 'vitest'
import { OUTPUT_DIR, cssBundle, read } from './helpers'

test('palette A tokens ship in the CSS bundle', () => {
  const css = cssBundle()
  expect(css).toContain('--accent:#12354e')
  expect(css).toContain('--field-border:#8a8f88')
})

test('fonts are self-hosted', () => {
  const css = cssBundle()
  expect(css).toMatch(/@font-face\{[^}]*font-family:"?onest"?/)
  // @nuxt/fonts 1.2 emits fonts as hashed build assets under /_nuxt/fonts/
  expect(css).toContain('url(/_nuxt/fonts/')
  expect(read('index.html')).not.toContain('fonts.googleapis.com')
  expect(css).not.toContain('fonts.gstatic.com')
  expect(readdirSync(join(OUTPUT_DIR, '_nuxt', 'fonts')).some((f) => f.endsWith('.woff2'))).toBe(
    true,
  )
})
