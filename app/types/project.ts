export type ProjectSlug = 'open-door' | 'packwright' | 'folio' | 'resumeiq'
export type StackGroup = 'AI' | 'Frontend' | 'Backend' | 'Data' | 'Infra'

export interface Stat {
  value: string
  unit?: string
  label: string
}

export interface Screenshot {
  src: string
  width: number
  height: number
  alt: string
  caption?: string
  dark?: boolean
}

export interface ProjectLinks {
  code: { url: string; enabled: boolean }
  demo: { url?: string; enabled: boolean }
  video: {
    enabled: boolean
    src?: string
    poster?: string
    durationLabel?: string
    captions?: string
    description?: string
  }
}

export interface Project {
  slug: ProjectSlug
  name: string
  typeLabel: string
  /** Case study lede (v11 class="lede"). */
  oneLine: string
  /** Home paragraph (v11 class="p-over"). */
  overview: string
  /** Always the 5 groups, in StackGroup order. */
  stack: { group: StackGroup; items: string }[]
  stats: [Stat, Stat, Stat]
  /** The Home screenshot. */
  hero: Screenshot
  /** Browser-frame address label. */
  frameLabel: string
  links: ProjectLinks
}
