import { expect, test } from 'vitest'
import { exists, html } from './helpers'

test('404.html has real content and is noindex', () => {
  const root = html('404.html')
  expect(root.querySelector('h1')?.text.trim()).toBe('Page not found')
  expect(root.querySelector('a[href="/"]')).not.toBeNull()
  const robots = root.querySelectorAll('meta[name="robots"]')
  expect(robots).toHaveLength(1)
  expect(robots[0]?.getAttribute('content')).toContain('noindex')
})

test('unknown project slugs are not prerendered', () => {
  expect(exists('projects/does-not-exist/index.html')).toBe(false)
})
