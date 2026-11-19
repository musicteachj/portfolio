import { existsSync } from 'node:fs'
import { expect, it } from 'vitest'
import { projects, projectBySlug } from '../../app/data/projects'
import type { Project } from '../../app/types/project'
import { site } from '../../app/data/site'
import { imageSize } from '../helpers/image-size'
import { repoPath } from '../helpers/paths'

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
    const file = repoPath('public', p.hero.src)
    expect(existsSync(file), file).toBe(true)
    expect(imageSize(file), file).toEqual({ width: p.hero.width, height: p.hero.height })
  }
})

// What would make an enabled link a broken or inaccessible feature.
function linkProblems(p: Project): string[] {
  const inPublic = (rel: string) => existsSync(repoPath('public', rel))
  const out: string[] = []
  const { demo, video, code } = p.links
  if (demo.enabled && !demo.url?.trim()) out.push(`${p.slug}: demo url`)
  if (video.enabled) {
    if (!video.src || !inPublic(video.src)) out.push(`${p.slug}: video file`)
    if (video.poster && !inPublic(video.poster)) out.push(`${p.slug}: poster file`)
    if (video.captions && !inPublic(video.captions)) out.push(`${p.slug}: captions file`)
    // WCAG 1.2.1: a video with no sound needs a text description; narration needs captions.
    if (!video.description?.trim() && !video.captions) out.push(`${p.slug}: video description or captions`)
  }
  if (code.enabled && new URL(code.url).protocol !== 'https:') out.push(`${p.slug}: code url`)
  return out
}

it('enabling a link stays a data-only change: enabled links are complete', () => {
  expect(projects.flatMap(linkProblems)).toEqual([])
})

it('an enabled video needs a description or captions', () => {
  const p = projects[0]!
  const withVideo = (video: Project['links']['video']) => ({ ...p, links: { ...p.links, video } })
  // Any existing public file stands in for the video file here.
  const src = p.hero.src
  expect(linkProblems(withVideo({ enabled: true, src }))).toEqual([`${p.slug}: video description or captions`])
  expect(linkProblems(withVideo({ enabled: true, src, description: 'No sound.' }))).toEqual([])
})

it('no copy contains an em dash or an arrow', () => {
  expect(JSON.stringify({ projects, site })).not.toMatch(/[—→]/)
})

it('resume ships at /resume.pdf', () => {
  expect(existsSync(repoPath('public/resume.pdf'))).toBe(true)
})

it('the portrait file has the size IntroHero declares', () => {
  expect(imageSize(repoPath('public/images/james.jpg'))).toEqual({ width: 628, height: 640 })
})
