import { describe, expect, it } from 'vitest'
import { EXCLUDED, KEPT_ON_DELETE, SYNC_PASSES, matches, syncCommands } from '../../infra/deploy/sync-passes.mjs'

const IMMUTABLE = 'max-age=31536000, immutable'
const NO_CACHE = 'no-cache'
const ASSET = 'max-age=86400'

describe('matches', () => {
  it('includes everything until a filter says otherwise', () => {
    expect(matches('a/b.txt', [])).toBe(true)
  })

  it('lets a later include beat an earlier exclude', () => {
    const filters: ['exclude' | 'include', string][] = [
      ['exclude', '*'],
      ['include', 'images/*'],
    ]
    expect(matches('images/a.png', filters)).toBe(true)
    expect(matches('index.html', filters)).toBe(false)
  })

  it('lets a later exclude beat an earlier include', () => {
    const filters: ['exclude' | 'include', string][] = [
      ['exclude', '*'],
      ['include', '_nuxt/*'],
      ['exclude', '_nuxt/builds/*'],
    ]
    expect(matches('_nuxt/a.js', filters)).toBe(true)
    expect(matches('_nuxt/builds/latest.json', filters)).toBe(false)
  })

  it('lets * cross slashes and ? match one character', () => {
    expect(
      matches('_nuxt/fonts/a.woff2', [
        ['exclude', '*'],
        ['include', '_nuxt/*'],
      ]),
    ).toBe(true)
    expect(
      matches('a1.txt', [
        ['exclude', '*'],
        ['include', 'a?.txt'],
      ]),
    ).toBe(true)
    expect(
      matches('a12.txt', [
        ['exclude', '*'],
        ['include', 'a?.txt'],
      ]),
    ).toBe(false)
  })

  it('treats regex characters in patterns literally', () => {
    expect(
      matches('axmd', [
        ['exclude', '*'],
        ['include', 'a.md'],
      ]),
    ).toBe(false)
    expect(
      matches('f_avif&s_1x1/a.png', [
        ['exclude', '*'],
        ['include', '_ipx/f_avif&*'],
      ]),
    ).toBe(false)
  })
})

describe('SYNC_PASSES', () => {
  it('starts every pass by excluding everything', () => {
    for (const pass of SYNC_PASSES) expect(pass.filters[0]).toEqual(['exclude', '*'])
  })

  it('uses only the three cache values', () => {
    const values = new Set(SYNC_PASSES.map((p) => p.cacheControl))
    expect([...values].sort()).toEqual([ASSET, IMMUTABLE, NO_CACHE].sort())
  })

  it('uploads the no-cache pages after every asset pass', () => {
    const lastAsset = SYNC_PASSES.map((p) => p.cacheControl).lastIndexOf(IMMUTABLE)
    const lastOther = SYNC_PASSES.map((p) => p.cacheControl).lastIndexOf(ASSET)
    const firstNoCachePage = SYNC_PASSES.findIndex(
      (p) => p.cacheControl === NO_CACHE && p.name !== 'nuxt-builds',
    )
    expect(firstNoCachePage).toBeGreaterThan(Math.max(lastAsset, lastOther))
    expect(SYNC_PASSES.at(-1)?.cacheControl).toBe(NO_CACHE)
  })

  it('sets an explicit content type on each _ipx format', () => {
    const types = Object.fromEntries(
      SYNC_PASSES.filter((p) => p.name.startsWith('ipx-')).map((p) => [p.name, p.contentType]),
    )
    expect(types).toEqual({
      'ipx-avif': 'image/avif',
      'ipx-webp': 'image/webp',
      'ipx-png': 'image/png',
      'ipx-jpeg': 'image/jpeg',
    })
  })
})

describe('syncCommands', () => {
  const commands = syncCommands('.output/public', 's3://bucket')

  it('builds one command per pass plus a final delete', () => {
    expect(commands).toHaveLength(SYNC_PASSES.length + 1)
    for (const argv of commands)
      expect(argv.slice(0, 4)).toEqual(['s3', 'sync', '.output/public', 's3://bucket'])
  })

  it('never deletes before the last command', () => {
    for (const argv of commands.slice(0, -1)) expect(argv).not.toContain('--delete')
  })

  it('ends with --delete and an exclude for each EXCLUDED and KEPT_ON_DELETE pattern', () => {
    const last = commands.at(-1)!
    expect(last).toContain('--delete')
    const excludes = last.flatMap((a, i) => (a === '--exclude' ? [last[i + 1]] : []))
    expect(excludes).toEqual([...EXCLUDED, ...KEPT_ON_DELETE])
    expect(last).not.toContain('--cache-control')
  })

  it('keeps old _nuxt files, so tabs open on the previous build can still load them', () => {
    expect(KEPT_ON_DELETE).toEqual(['_nuxt/*'])
    const last = commands.at(-1)!
    const filters = last.flatMap((a, i) =>
      a === '--exclude' || a === '--include' ? [[a.slice(2), last[i + 1]] as [string, string]] : [],
    )
    // The cleanup pass skips (so never deletes) these; anything else stale is deleted.
    expect(matches('_nuxt/OldChunk.abc123.js', filters)).toBe(false)
    expect(matches('_nuxt/builds/meta/old-build-id.json', filters)).toBe(false)
    expect(matches('projects/old-page/index.html', filters)).toBe(true)
  })

  it('passes cache control and content type', () => {
    const avif = commands.find((a) => a.includes('image/avif'))!
    expect(avif).toContain('--cache-control')
    expect(avif[avif.indexOf('--content-type') + 1]).toBe('image/avif')
    expect(avif[avif.indexOf('--cache-control') + 1]).toBe(ASSET)
  })

  it('keeps filters in order', () => {
    const first = commands[0]
    expect(first.slice(4, 8)).toEqual(['--exclude', '*', '--include', '_nuxt/*'])
  })
})

describe('EXCLUDED', () => {
  it('is exactly the two never-uploaded patterns', () => {
    expect(EXCLUDED).toEqual(['200.html', '_og-static-fonts/*'])
  })
})
