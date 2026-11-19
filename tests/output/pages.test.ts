import { expect, test } from 'vitest'
import { readdirSync } from 'node:fs'
import { OUTPUT_DIR, exists, html, read } from './helpers'

test('home is prerendered with real content', () => {
  expect(exists('index.html')).toBe(true)
  expect(html('index.html').querySelector('h1')?.text.trim()).toBe('James Littlefield')
})

test('skew protection is off', () => {
  expect(exists('_nuxt-skew-sw.js')).toBe(false)
  const pages = readdirSync(OUTPUT_DIR, { recursive: true })
    .map(String)
    .filter((f) => f.endsWith('.html'))
  expect(pages.length).toBeGreaterThan(0)
  for (const page of pages) {
    expect(read(page).toLowerCase(), page).not.toContain('skew')
  }
})
