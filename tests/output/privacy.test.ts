import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'
import { OUTPUT_DIR } from './helpers'

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    return entry.isDirectory() ? walk(full) : [full]
  })
}

const files = walk(OUTPUT_DIR)

// The email address and mailto: scans live in scripts/check-seo.ts (email-address check).
describe('privacy of the generated output', () => {
  it('the EmailJS SDK is lazy-loaded', () => {
    const needle = Buffer.from('api.emailjs.com')
    const sdkChunks = files
      .filter((f) => f.includes(`${join('_nuxt', '')}`) && f.endsWith('.js'))
      .filter((f) => readFileSync(f).includes(needle))
      .map((f) => relative(OUTPUT_DIR, f))
    expect(sdkChunks.length, 'no _nuxt chunk contains the EmailJS SDK').toBeGreaterThan(0)
    const html = readFileSync(join(OUTPUT_DIR, 'index.html'), 'utf8')
    const preloaded = [...html.matchAll(/<link[^>]*rel="modulepreload"[^>]*>/g)]
      .map((m) => /href="\/?([^"]+)"/.exec(m[0])?.[1])
      .filter((href): href is string => !!href && sdkChunks.includes(href))
    expect(preloaded, `modulepreload of the SDK chunk: ${preloaded.join(', ')}`).toEqual([])
  })
})
