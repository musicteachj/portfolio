import type { Project } from '../types/project'

export type ProofKey = 'case' | 'video' | 'code' | 'demo'

/** An undefined href means the item is disabled. */
export interface ProofItem {
  key: ProofKey
  label: string
  sub: string
  href?: string
}

export function proofItems(project: Project, context: 'home' | 'page'): ProofItem[] {
  const { video, code, demo } = project.links
  const caseStudy: ProofItem = {
    key: 'case',
    label: 'Case study',
    sub: 'read',
    href: `/projects/${project.slug}`,
  }
  const videoItem: ProofItem = {
    key: 'video',
    label: 'Video',
    sub: video.durationLabel ?? 'watch',
    href: video.enabled && video.src ? `/projects/${project.slug}#video` : undefined,
  }
  const codeItem: ProofItem = {
    key: 'code',
    label: 'Code',
    sub: 'GitHub',
    href: code.enabled ? code.url : undefined,
  }
  const demoItem: ProofItem = {
    key: 'demo',
    label: 'Live demo',
    sub: 'view',
    href: demo.enabled && demo.url ? demo.url : undefined,
  }
  return context === 'home'
    ? [caseStudy, videoItem, codeItem, demoItem]
    : [demoItem, videoItem, codeItem]
}
