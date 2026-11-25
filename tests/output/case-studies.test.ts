import { expect, test } from 'vitest'
import { projects, projectBySlug } from '../../app/data/projects'
import { hasVideo, proofItems } from '../../app/utils/proof'
import { html } from './helpers'

const page = (slug: string) => html(`projects/${slug}/index.html`)

test('case study shell for every project', () => {
  for (const p of projects) {
    const r = page(p.slug)
    expect(r.querySelector('title')?.text).toContain(p.name)
    expect(r.querySelector('h1')?.text.trim()).toBe(p.name)
    expect(r.querySelector('.lede')?.text.trim()).toBe(p.oneLine)
    expect(r.querySelectorAll('.ptabs a').map((a) => a.getAttribute('href'))).toEqual(
      projects.map((x) => `/projects/${x.slug}`),
    )
    expect(r.querySelector(`.ptabs a[href="/projects/${p.slug}"]`)?.getAttribute('aria-current')).toBe('page')
    expect(r.querySelector('.pnav a.back')?.getAttribute('href')).toBe('/projects')
  }
})

test('eight numbered sections in order, mirrored by the toc', () => {
  for (const p of projects) {
    const r = page(p.slug)
    const ids = r.querySelectorAll('article > section.cs-sec').map((s) => s.id)
    expect(ids).toEqual(['overview', 'features', 'how-ai-works', 'stack', 'architecture', 'results', 'decisions', 'media'])
    expect(r.querySelectorAll('.toc a').map((a) => a.getAttribute('href'))).toEqual(ids.map((i) => `#${i}`))
    expect(r.querySelectorAll('.sec-n').map((s) => s.text)).toEqual(['01', '02', '03', '04', '05', '06', '07', '08'])
  }
})

test('case study proof links follow the data: enabled ones link out, the rest are disabled', () => {
  for (const p of projects) {
    const r = page(p.slug)
    const items = proofItems(p, 'page')
    const on = items.filter((i) => i.href).map((i) => i.href)
    expect(r.querySelectorAll('.cs-intro .proof [aria-disabled="true"]')).toHaveLength(items.length - on.length)
    expect(r.querySelectorAll('.cs-intro .proof a').map((a) => a.getAttribute('href'))).toEqual(on)
    expect(r.querySelector('video') !== null).toBe(hasVideo(p))
    expect(r.querySelector('#media-h')?.text).toContain(hasVideo(p) ? 'Video and screenshots' : 'Screenshots')
  }
})

test('the live apps link their demo and code', () => {
  for (const [slug, demo, code] of [
    ['open-door', 'https://opendoor.jameslittlefield.net', 'https://github.com/musicteachj/open-door'],
    ['packwright', 'https://packwright.jameslittlefield.net', 'https://github.com/musicteachj/packwright'],
  ] as const) {
    const hrefs = page(slug).querySelectorAll('.cs-intro .proof a').map((a) => a.getAttribute('href'))
    expect(hrefs).toEqual(expect.arrayContaining([demo, code]))
  }
})

test('hero is eager and high priority; prev/next cycle', () => {
  const order = projects.map((p) => p.slug)
  for (const [i, p] of projects.entries()) {
    const r = page(p.slug)
    const img = r.querySelector('.cs-hero img')
    expect(img).not.toBeNull()
    expect(img?.getAttribute('loading')).not.toBe('lazy')
    expect(img?.getAttribute('fetchpriority')).toBe('high')
    const prev = order[(i + order.length - 1) % order.length]
    const next = order[(i + 1) % order.length]
    expect(r.querySelectorAll('.prevnext a').map((a) => a.getAttribute('href'))).toEqual([
      `/projects/${prev}`,
      `/projects/${next}`,
    ])
  }
})

test('Open Door uses the request flow with an accessible label; others use steps', () => {
  const od = page('open-door')
  const arch = projectBySlug('open-door')!.caseStudy.architecture
  if (arch.kind !== 'flow') throw new Error('expected flow')
  expect(od.querySelector('#architecture .flow[role="img"]')?.getAttribute('aria-label')).toBe(arch.ariaLabel)
  for (const s of ['packwright', 'folio', 'resumeiq'])
    expect(page(s).querySelectorAll('#architecture ol.steps li').length).toBeGreaterThan(2)
})

test('results tables match the data', () => {
  for (const p of projects) {
    const t = p.caseStudy.results
    const r = page(p.slug)
    expect(r.querySelectorAll('#results thead th').map((h) => h.text.trim())).toEqual(t.columns)
    expect(r.querySelectorAll('#results tbody tr')).toHaveLength(t.rows.length)
    expect(r.querySelectorAll('#results tr.is-miss')).toHaveLength(t.rows.filter((x) => x.miss).length)
    expect(r.querySelector('#results .table-wrap')?.getAttribute('aria-label')).toBe(t.ariaLabel)
    if (t.note) expect(r.querySelector('#results .table-note')?.text.trim()).toBe(t.note)
  }
})

test('galleries: every image lazy, avif and webp, captioned', () => {
  for (const p of projects) {
    const r = page(p.slug)
    const figs = r.querySelectorAll('#media figure.g-item')
    expect(figs).toHaveLength(p.caseStudy.gallery.length)
    for (const [i, f] of figs.entries()) {
      expect(f.querySelector('figcaption')?.text.trim()).toBe(p.caseStudy.gallery[i]!.caption)
      const types = f.querySelectorAll('picture source').map((s) => s.getAttribute('type'))
      expect(types).toContain('image/avif')
      expect(types).toContain('image/webp')
      expect(f.querySelector('img')?.getAttribute('loading')).toBe('lazy')
    }
  }
})

test('hero srcsets never ask for more than the source width and the hero is preloaded', () => {
  for (const p of projects) {
    const r = page(p.slug)
    const sets = r.querySelectorAll('.cs-hero source, .cs-hero img').map((e) => e.getAttribute('srcset')!)
    expect(sets.length, p.slug).toBeGreaterThanOrEqual(3)
    for (const set of sets) {
      const widths = set.split(',').map((c) => parseInt(c.trim().split(/\s+/)[1]!, 10))
      expect(Math.max(...widths), `${p.slug} ${set}`).toBeLessThanOrEqual(p.hero.width)
    }
    const link = r.querySelector('link[rel="preload"][as="image"]')
    expect(link, p.slug).not.toBeNull()
    expect(link!.getAttribute('imagesrcset'), p.slug).toContain('f_avif')
    expect(link!.getAttribute('imagesizes'), p.slug).toBeTruthy()
  }
})
