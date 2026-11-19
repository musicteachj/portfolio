import { readdirSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { describe, expect, it } from 'vitest'
import { EXCLUDED, SYNC_PASSES, matches } from '../../infra/deploy/sync-passes.mjs'
import { OUTPUT_DIR } from './helpers'

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  )
}

const files = walk(OUTPUT_DIR).map((f) => relative(OUTPUT_DIR, f).split(sep).join('/'))
const excluded = (rel: string) =>
  matches(rel, [['exclude', '*'], ...EXCLUDED.map((p) => ['include', p] as ['include', string])])
const claims = (rel: string) => SYNC_PASSES.filter((p) => matches(rel, p.filters))

function passFor(rel: string) {
  const found = claims(rel)
  expect(found, rel).toHaveLength(1)
  return found[0]
}

describe('sync coverage of the built site', () => {
  it('has built files to check', () => {
    expect(files.length).toBeGreaterThan(50)
  })

  it('claims every file with exactly one pass, except the excluded ones', () => {
    const unclaimed: string[] = []
    const doubled: string[] = []
    for (const rel of files) {
      if (excluded(rel)) continue
      const found = claims(rel)
      if (found.length === 0) unclaimed.push(rel)
      if (found.length > 1) doubled.push(`${rel} (${found.map((p) => p.name).join(', ')})`)
    }
    expect({ unclaimed, doubled }).toEqual({ unclaimed: [], doubled: [] })
  })

  it('excludes 200.html and _og-static-fonts', () => {
    expect(excluded('200.html')).toBe(true)
    expect(claims('200.html')).toHaveLength(0)
    const fonts = files.filter((f) => f.startsWith('_og-static-fonts/'))
    expect(fonts.length).toBeGreaterThan(0)
    for (const f of fonts) {
      expect(excluded(f), f).toBe(true)
      expect(claims(f), f).toHaveLength(0)
    }
  })

  it('makes hashed _nuxt files immutable and the build manifest no-cache', () => {
    const js = files.find((f) => /^_nuxt\/[^/]+\.js$/.test(f))!
    expect(passFor(js).cacheControl).toBe('max-age=31536000, immutable')
    const font = files.find((f) => f.startsWith('_nuxt/fonts/'))!
    expect(passFor(font).cacheControl).toBe('max-age=31536000, immutable')
    expect(passFor('_nuxt/builds/latest.json').cacheControl).toBe('no-cache')
  })

  it('gives _ipx files an explicit content type per format', () => {
    const type = (prefix: string) => {
      const f = files.find((x) => x.startsWith(prefix))
      expect(f, prefix).toBeTruthy()
      return passFor(f!)
    }
    expect(type('_ipx/f_avif').contentType).toBe('image/avif')
    expect(type('_ipx/f_webp').contentType).toBe('image/webp')
    expect(type('_ipx/f_png').contentType).toBe('image/png')
    expect(type('_ipx/f_jpeg').contentType).toBe('image/jpeg')
    expect(type('_ipx/f_avif').cacheControl).toBe('max-age=86400')
  })

  it('keeps pages, data and crawler files no-cache', () => {
    for (const rel of [
      'index.html',
      '404.html',
      '_payload.json',
      'projects/folio/_payload.json',
      '__ai-ready/pages.json',
      'llms.txt',
      'llms-full.txt',
      'sitemap.xml',
      'robots.txt',
    ]) {
      expect(passFor(rel).cacheControl, rel).toBe('no-cache')
    }
  })

  it('serves Markdown as text/markdown without caching', () => {
    const pass = passFor('projects/folio.md')
    expect(pass.cacheControl).toBe('no-cache')
    expect(pass.contentType).toBe('text/markdown; charset=utf-8')
  })

  it('caches other assets for a day', () => {
    const og = files.find((f) => /^_og\/s\/.+\.png$/.test(f))!
    for (const rel of ['images/james.jpg', 'resume.pdf', 'favicon.svg', og]) {
      expect(passFor(rel).cacheControl, rel).toBe('max-age=86400')
    }
  })

  it('covers videos and captions even though none are built yet', () => {
    expect(passFor('videos/demo.mp4').cacheControl).toBe('max-age=86400')
    expect(passFor('videos/demo.vtt').contentType).toBe('text/vtt')
  })
})
