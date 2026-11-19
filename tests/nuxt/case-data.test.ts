import { expect, it } from 'vitest'
import { projects, projectBySlug } from '../../app/data/projects'
import type { GalleryScreenshot } from '../../app/types/project'
import { imageSize } from '../helpers/image-size'
import { repoPath } from '../helpers/paths'

it('every project has a complete case study', () => {
  for (const p of projects) {
    const c = p.caseStudy
    expect(c.overview.length).toBeGreaterThan(80)
    expect(c.features.length).toBeGreaterThanOrEqual(4)
    expect(c.howAiWorks.points.length).toBeGreaterThanOrEqual(3)
    expect(c.decisions.length).toBeGreaterThanOrEqual(3)
    expect(c.gallery.length).toBeGreaterThanOrEqual(1)
    for (const g of c.gallery) expect(g.caption).toBeTruthy()
  }
})

it('gallery items require a caption at the type level', () => {
  // Checked by typecheck: a gallery item without a caption must not compile.
  // @ts-expect-error caption is required
  const missing: GalleryScreenshot = { src: '/x.png', width: 1, height: 1, alt: 'x' }
  expect(missing.src).toBe('/x.png')
})

it('architecture is a flow for Open Door and steps for the others', () => {
  expect(projectBySlug('open-door')!.caseStudy.architecture.kind).toBe('flow')
  for (const s of ['packwright', 'folio', 'resumeiq'])
    expect(projectBySlug(s)!.caseStudy.architecture.kind).toBe('steps')
})

it('results rows match the column count', () => {
  for (const p of projects)
    for (const r of p.caseStudy.results.rows)
      expect(r.values).toHaveLength(p.caseStudy.results.columns.length - 1)
})

it('Open Door marks exactly the two missed targets', () => {
  expect(
    projectBySlug('open-door')!
      .caseStudy.results.rows.filter((r) => r.miss)
      .map((r) => r.values),
  ).toEqual([
    ['80%', '85%'],
    ['1,817 ms', '800 ms'],
  ])
})

it('gallery images exist at their declared size', () => {
  for (const p of projects)
    for (const g of p.caseStudy.gallery)
      expect(imageSize(repoPath('public', g.src)), g.src).toEqual({
        width: g.width,
        height: g.height,
      })
})

it('anchor ids', () => {
  expect(projects.map((p) => p.anchorId)).toEqual(['opendoor', 'packwright', 'folio', 'resumeiq'])
})

it('case study copy has no em dashes, arrows or HTML entities', () => {
  expect(JSON.stringify(projects.map((p) => p.caseStudy))).not.toMatch(
    /[—→]|&#x?[0-9a-f]+;|&amp;|<\/?(b|code|li|p)>/i,
  )
})
