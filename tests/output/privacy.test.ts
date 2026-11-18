import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'
import { site } from '../../app/data/site'
import { OUTPUT_DIR, exists } from './helpers'

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    return entry.isDirectory() ? walk(full) : [full]
  })
}

const files = walk(OUTPUT_DIR)

// The resume PDF carries the address by design until James decides whether to replace it (an open decision, tracked in the carry-forward notes).
const ALLOWED = ['resume.pdf']

describe('privacy of the generated output', () => {
  it('no output file contains the email address', () => {
    expect(typeof site.emailUser).toBe('string')
    expect(site.emailUser.length).toBeGreaterThan(0)
    for (const rel of ALLOWED) expect(exists(rel), `${rel} is allowed but missing from the output`).toBe(true)
    const needle = Buffer.from(`${site.emailUser}@`)
    const offenders = files
      .filter((f) => readFileSync(f).includes(needle))
      .map((f) => relative(OUTPUT_DIR, f))
      .filter((rel) => !ALLOWED.includes(rel))
    expect(offenders, `files containing the address: ${offenders.join(', ')}`).toEqual([])
  })

  it('no HTML, JSON, Markdown, XML or TXT file contains mailto:', () => {
    const needle = Buffer.from('mailto:')
    const offenders = files
      .filter((f) => /\.(html|json|md|xml|txt)$/.test(f))
      .filter((f) => readFileSync(f).includes(needle))
      .map((f) => relative(OUTPUT_DIR, f))
    expect(offenders, `files containing mailto: ${offenders.join(', ')}`).toEqual([])
  })

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
