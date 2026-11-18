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

test('404 page links to the projects section', () => {
  expect(html('404.html').querySelector('a[href="/projects"]')).not.toBeNull()
})

test('error page uses button actions', () => {
  const root = html('404.html')
  const links = root.querySelectorAll('main .actions a.btn')
  expect(links.map((a) => a.getAttribute('href'))).toEqual(['/', '/projects'])
  expect(links.map((a) => a.text.trim())).toEqual(['Go to the home page', 'See the projects'])
  expect(links[0]?.classList.contains('btn--primary')).toBe(true)
  expect(root.querySelector('main .error-page p')?.text.trim()).toBe("That page doesn't exist or has moved.")
})
