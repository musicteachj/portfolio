import { expect, test } from 'vitest'
import { projects } from '../../app/data/projects'
import { exists, html, read } from './helpers'

test('header nav uses clean section URLs and the stable résumé path', () => {
  const nav = html('index.html').querySelector('nav[aria-label="Primary"]')!
  expect(nav.querySelectorAll('a').map((a) => [a.text.trim(), a.getAttribute('href')])).toEqual([
    ['Projects', '/projects'],
    ['Contact', '/contact'],
    ['Résumé', '/resume.pdf'],
  ])
})

test('skip link targets main on every page', () => {
  for (const f of ['index.html', 'projects/open-door/index.html', '404.html']) {
    const r = html(f)
    expect(r.querySelector('a.skip')?.getAttribute('href'), f).toBe('#main')
    expect(r.querySelector('main#main'), f).not.toBeNull()
  }
})

test('footer shows the build year', () => {
  expect(html('index.html').querySelector('footer')?.text.trim()).toBe(
    `James Littlefield, ${new Date().getFullYear()}.`,
  )
})

const anchor = (p: { anchorId: string }) => p.anchorId

test('every project block renders its real content', () => {
  const r = html('index.html')
  for (const p of projects) {
    const s = r.querySelector(`section[aria-labelledby="h-${anchor(p)}"]`)!
    expect(s, p.slug).not.toBeNull()
    expect(s.getAttribute('id')).toBe(anchor(p))
    expect(s.querySelector('h2 a')?.getAttribute('href')).toBe(`/projects/${p.slug}`)
    expect(s.text).toContain(p.overview)
    expect(s.querySelectorAll('.stats dd')).toHaveLength(3)
    expect(s.querySelectorAll('.stack div')).toHaveLength(5)
    expect(s.querySelectorAll('.proof li')).toHaveLength(4)
  }
})

test('project screenshots are avif and webp, wide enough for 2x tablets, never tiny', () => {
  const pictures = html('index.html').querySelectorAll('.project picture')
  expect(pictures).toHaveLength(4)
  for (const pic of pictures) {
    const types = pic.querySelectorAll('source').map((s) => s.getAttribute('type'))
    expect(types).toContain('image/avif')
    expect(types).toContain('image/webp')
    for (const s of pic.querySelectorAll('source')) {
      const widths = s
        .getAttribute('srcset')!
        .split(',')
        .map((c) => c.trim().split(/\s+/))
        .map(([url, desc]) => {
          expect(exists(decodeURIComponent(url!).replace(/^\//, ''))).toBe(true)
          return parseInt(desc!, 10)
        })
      expect(Math.max(...widths)).toBeGreaterThanOrEqual(1600)
      expect(Math.min(...widths)).toBeGreaterThanOrEqual(300)
      const sizes = s.getAttribute('sizes')!
      expect(sizes).toContain('100vw')
      for (const entry of sizes.split(',')) expect(entry.trim()).toMatch(/\d(vw|px)$/)
    }
  }
})

test('first screenshot is eager, the rest lazy', () => {
  const imgs = html('index.html').querySelectorAll('.project img')
  expect(imgs).toHaveLength(4)
  expect(imgs[0]!.getAttribute('loading')).not.toBe('lazy')
  for (const i of imgs.slice(1)) expect(i.getAttribute('loading')).toBe('lazy')
})

test('Home and both section URLs share the Home title and root canonical', () => {
  for (const f of ['index.html', 'projects/index.html', 'contact/index.html']) {
    const r = html(f)
    expect(r.querySelector('title')?.text, f).toBe('James Littlefield, AI Engineer')
    const c = r.querySelectorAll('link[rel="canonical"]')
    expect(c, f).toHaveLength(1)
    expect(c[0]!.getAttribute('href'), f).toBe('https://jameslittlefield.net/')
  }
})

test('intro content and buttons', () => {
  const r = html('index.html')
  expect(r.querySelector('h1')?.text.trim()).toBe('James Littlefield')
  expect(
    r
      .querySelector('.actions')!
      .querySelectorAll('a')
      .map((a) => [a.text.trim(), a.getAttribute('href')]),
  ).toEqual([
    ['Résumé (PDF)', '/resume.pdf'],
    ['Email', '/contact'],
    ['GitHub', 'https://github.com/musicteachj'],
    ['LinkedIn', 'https://www.linkedin.com/in/james-littlefield-93037713b/'],
  ])
})

test('portrait loads eagerly with high priority', () => {
  const img = html('index.html').querySelector('.portrait-stage img')!
  expect(img).not.toBeNull()
  expect(img.getAttribute('loading')).not.toBe('lazy')
  expect(img.getAttribute('fetchpriority')).toBe('high')
  expect(img.getAttribute('alt')).toBe('James Littlefield')
})

test('no mailto and no mockup hint in the HTML', () => {
  const s = read('index.html')
  expect(s).not.toContain('mailto:')
  expect(s).not.toMatch(/type "fail"/i)
  expect(s).not.toMatch(/type &quot;fail&quot;/i)
})

test('capabilities strip lists the six capabilities', () => {
  const s = html('index.html').querySelector('section[aria-labelledby="caps-h"]')!
  expect(s.querySelector('h2')?.text).toBe('I work on')
  expect(s.querySelectorAll('li')).toHaveLength(6)
})

test('contact form fields are labeled and described', () => {
  const r = html('index.html')
  expect(r.querySelector('section#contact h2#contact-h')?.text).toBe('Contact')
  for (const k of ['name', 'email', 'subject', 'message']) {
    expect(r.querySelector(`label[for="f-${k}"]`), k).not.toBeNull()
    const el = r.querySelector(`#f-${k}`)!
    expect(el.hasAttribute('required'), k).toBe(true)
    expect(el.getAttribute('aria-describedby'), k).toBe(`f-${k}-err`)
    expect(r.querySelector(`#f-${k}-err`), k).not.toBeNull()
  }
  expect(r.querySelector('#f-status')?.getAttribute('role')).toBe('status')
})

test('nav marks only the current section in prerendered HTML', () => {
  const marks = (f: string) =>
    html(f)
      .querySelectorAll('nav[aria-label="Primary"] a')
      .map((a) => a.getAttribute('aria-current') ?? null)
  expect(marks('index.html')).toEqual([null, null, null])
  expect(marks('projects/index.html')).toEqual(['location', null, null])
  expect(marks('contact/index.html')).toEqual([null, 'location', null])
})

test('wordmark has no aria-current on section URLs', () => {
  for (const f of ['projects/index.html', 'contact/index.html']) {
    expect(html(f).querySelector('a.wordmark')?.getAttribute('aria-current') ?? null, f).toBeNull()
  }
})
