import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'
import { projects, projectBySlug } from '../../app/data/projects'
import { site } from '../../app/data/site'

function imageSize(file: string): { width: number; height: number } {
  const buf = readFileSync(file)
  if (buf.subarray(1, 4).toString('ascii') === 'PNG') {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2
    while (i < buf.length) {
      if (buf[i] !== 0xff) {
        i++
        continue
      }
      const marker = buf[i + 1]!
      if (marker === 0xc0 || marker === 0xc2) {
        return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) }
      }
      i += 2 + buf.readUInt16BE(i + 2)
    }
  }
  throw new Error(`Unsupported image: ${file}`)
}

it('has the four projects in order', () => {
  expect(projects.map((p) => p.slug)).toEqual(['open-door', 'packwright', 'folio', 'resumeiq'])
})

it('looks projects up by slug', () => {
  expect(projectBySlug('folio')?.name).toBe('Folio')
  expect(projectBySlug('nope')).toBeUndefined()
})

it('every project has 3 stats and the 5 stack groups in order', () => {
  for (const p of projects) {
    expect(p.stats).toHaveLength(3)
    expect(p.stack.map((s) => s.group)).toEqual(['AI', 'Frontend', 'Backend', 'Data', 'Infra'])
  }
})

it('hero screenshots exist in public with the declared size', () => {
  for (const p of projects) {
    const file = join('public', p.hero.src)
    expect(existsSync(file), file).toBe(true)
    expect(imageSize(file), file).toEqual({ width: p.hero.width, height: p.hero.height })
  }
})

it('enabling a link stays a data-only change: enabled links are complete', () => {
  const pub = (rel: string) => fileURLToPath(new URL(`../../public/${rel.replace(/^\//, '')}`, import.meta.url))
  for (const p of projects) {
    const { demo, video, code } = p.links
    if (demo.enabled) expect(demo.url?.trim(), `${p.slug} demo url`).toBeTruthy()
    if (video.enabled) {
      expect(video.src, `${p.slug} video src`).toBeTruthy()
      expect(existsSync(pub(video.src!)), `${p.slug} video file`).toBe(true)
      if (video.poster) expect(existsSync(pub(video.poster)), `${p.slug} poster file`).toBe(true)
    }
    if (code.enabled) expect(new URL(code.url).protocol, `${p.slug} code url`).toBe('https:')
  }
})

it('no copy contains an em dash or an arrow', () => {
  expect(JSON.stringify({ projects, site })).not.toMatch(/[—→]/)
})

it('resume ships at /resume.pdf', () => {
  expect(existsSync('public/resume.pdf')).toBe(true)
})
