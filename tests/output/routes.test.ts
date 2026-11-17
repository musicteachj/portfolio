import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from 'vitest'
import { OUTPUT_DIR, exists, html } from './helpers'

test('prerenders the four tracer routes', () => {
  for (const f of [
    'index.html',
    'projects/index.html',
    'contact/index.html',
    'projects/open-door/index.html',
  ])
    expect(exists(f)).toBe(true)
  expect(html('projects/index.html').querySelector('h1')?.text.trim()).toBe('James Littlefield')
  expect(html('contact/index.html').querySelector('section#contact')).not.toBeNull()
  expect(html('projects/open-door/index.html').querySelector('h1')?.text.trim()).toBe('Open Door')
})

test('exactly one canonical per page', () => {
  const expected: Record<string, string> = {
    'index.html': 'https://jameslittlefield.net/',
    'projects/index.html': 'https://jameslittlefield.net/',
    'contact/index.html': 'https://jameslittlefield.net/',
    'projects/open-door/index.html': 'https://jameslittlefield.net/projects/open-door',
  }
  for (const [f, href] of Object.entries(expected)) {
    const tags = html(f).querySelectorAll('link[rel="canonical"]')
    expect(tags).toHaveLength(1)
    expect(tags[0]!.getAttribute('href')).toBe(href)
  }
})

test('screenshot ships as avif and webp via ipx with dimensions', () => {
  const root = html('index.html')
  expect(root.querySelector('source[type="image/avif"]')).not.toBeNull()
  expect(root.querySelector('source[type="image/webp"]')).not.toBeNull()
  const img = root.querySelector('picture img')!
  expect(img.getAttribute('width')).toBe('1800')
  expect(img.getAttribute('height')).toBe('1125')
})

test('ipx files hold the formats they claim', () => {
  const sources = html('index.html').querySelectorAll('picture source')
  expect(sources.length).toBeGreaterThan(0)
  for (const s of sources) {
    const type = s.getAttribute('type')!
    const candidates = s
      .getAttribute('srcset')!
      .split(',')
      .map((c) => c.trim().split(/\s+/))
    const widths: number[] = []
    for (const [url, desc] of candidates) {
      const rel = decodeURIComponent(url!).replace(/^\//, '')
      console.log(`ipx ${type} ${desc}: ${rel}`)
      expect(exists(rel)).toBe(true)
      const buf = readFileSync(join(OUTPUT_DIR, rel))
      if (type === 'image/avif') {
        expect(buf.subarray(4, 12).toString('latin1')).toBe('ftypavif')
      } else if (type === 'image/webp') {
        expect(buf.subarray(0, 4).toString('latin1')).toBe('RIFF')
        expect(buf.subarray(8, 12).toString('latin1')).toBe('WEBP')
      }
      widths.push(parseInt(desc!, 10))
    }
    expect(Math.max(...widths)).toBeGreaterThanOrEqual(1160)
    expect(Math.min(...widths)).toBeGreaterThanOrEqual(300)
    expect(Math.max(...widths)).toBeLessThanOrEqual(1800)
  }
})
