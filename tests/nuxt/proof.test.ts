import { expect, it } from 'vitest'
import { projects } from '../../app/data/projects'
import { hasVideo, proofItems } from '../../app/utils/proof'
import type { Project } from '../../app/types/project'

const base = projects[0]!

function withLinks(links: Partial<Project['links']>): Project {
  return { ...base, links: { ...base.links, ...links } }
}

it('home order and launch-state hrefs', () => {
  const items = proofItems(base, 'home')
  expect(items.map((i) => i.key)).toEqual(['case', 'video', 'code', 'demo'])
  expect(items.map((i) => i.href)).toEqual(['/projects/open-door', undefined, undefined, undefined])
  expect(items.map((i) => i.sub)).toEqual(['read', '3.5 min', 'GitHub', 'view'])
})

it('page order omits case study', () => {
  expect(proofItems(base, 'page').map((i) => i.key)).toEqual(['demo', 'video', 'code'])
})

it('enabled video links to the page video anchor', () => {
  const p = withLinks({ video: { enabled: true, src: '/videos/x.mp4' } })
  expect(proofItems(p, 'home').find((i) => i.key === 'video')?.href).toBe('/projects/open-door#video')
})

it('enabled code and demo link to their urls', () => {
  const p = withLinks({
    code: { url: 'https://example.com/code', enabled: true },
    demo: { url: 'https://example.com/demo', enabled: true },
  })
  const items = proofItems(p, 'home')
  expect(items.find((i) => i.key === 'code')?.href).toBe('https://example.com/code')
  expect(items.find((i) => i.key === 'demo')?.href).toBe('https://example.com/demo')
})

it('enabled flags without a url or src stay disabled', () => {
  const p = withLinks({ demo: { enabled: true }, video: { enabled: true } })
  const items = proofItems(p, 'home')
  expect(items.find((i) => i.key === 'demo')?.href).toBeUndefined()
  expect(items.find((i) => i.key === 'video')?.href).toBeUndefined()
})

it('video sub falls back to watch', () => {
  expect(proofItems(projects[1]!, 'home')[1]!.sub).toBe('watch')
})

it('hasVideo needs both enabled and a src', () => {
  expect(hasVideo(withLinks({ video: { enabled: true, src: '/videos/x.mp4' } }))).toBe(true)
  expect(hasVideo(withLinks({ video: { enabled: true } }))).toBe(false)
  expect(hasVideo(withLinks({ video: { enabled: false, src: '/videos/x.mp4' } }))).toBe(false)
})
