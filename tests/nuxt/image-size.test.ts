import { mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it } from 'vitest'
import { projects } from '../../app/data/projects'
import { imageSize } from '../helpers/image-size'
import { repoPath } from '../helpers/paths'

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

it('reads every image in public/images with the recorded size', () => {
  const expected = new Map<string, { width: number; height: number }>([
    [repoPath('public/images/james.jpg'), { width: 628, height: 640 }],
  ])
  for (const p of projects) {
    expected.set(repoPath('public', p.hero.src), { width: p.hero.width, height: p.hero.height })
    for (const g of p.caseStudy.gallery) {
      expected.set(repoPath('public', g.src), { width: g.width, height: g.height })
    }
  }
  const files = walk(repoPath('public/images'))
  expect(files.length).toBeGreaterThan(0)
  for (const file of files) {
    expect(expected.has(file), `unrecorded image ${file}`).toBe(true)
    expect(imageSize(file), file).toEqual(expected.get(file))
  }
})

it('reads a progressive JPEG after a fill byte', () => {
  const dir = mkdtempSync(join(tmpdir(), 'img-size-'))
  try {
    const file = join(dir, 'synthetic.jpg')
    const buf = Buffer.from([
      0xff,
      0xd8, // SOI
      0xff,
      0xff,
      0xff,
      0xe0,
      0x00,
      0x04,
      0x00,
      0x00, // fill bytes, APP0 (length 4)
      0xff,
      0xc2,
      0x00,
      0x0b,
      0x08,
      0x01,
      0x2c,
      0x00,
      0xc8,
      0x01,
      0x01,
      0x11,
      0x00, // SOF2 200x300
    ])
    writeFileSync(file, buf)
    expect(imageSize(file)).toEqual({ width: 200, height: 300 })
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

it('throws on an unknown format', () => {
  const dir = mkdtempSync(join(tmpdir(), 'img-size-'))
  try {
    const file = join(dir, 'x.bin')
    writeFileSync(file, Buffer.from('not an image'))
    expect(() => imageSize(file)).toThrow()
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
