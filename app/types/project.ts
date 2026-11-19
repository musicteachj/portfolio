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

/** A case study gallery item: the caption is required. */
export type GalleryScreenshot = Screenshot & { caption: string }

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

export interface StepGroup {
  title: string
  steps: { title: string; text: string }[]
}

export type Architecture =
  | { kind: 'steps'; groups: StepGroup[] }
  /** Rendered by RequestFlow.vue (Open Door only). */
  | { kind: 'flow'; ariaLabel: string }

export interface ResultsData {
  ariaLabel: string
  /** Header cells; the first is the row-label column. */
  columns: string[]
  /** values.length === columns.length - 1 */
  rows: { label: string; values: string[]; miss?: boolean }[]
  note?: string
}

/** Rendered as "<b>title.</b> text"; title has no trailing period. */
export interface Decision {
  title: string
  text: string
}

export interface CaseStudy {
  overview: string
  features: string[]
  /** Inline code is marked with backticks, e.g. `search_handbook`. */
  howAiWorks: { intro: string; points: string[] }
  architecture: Architecture
  results: ResultsData
  decisions: Decision[]
  gallery: GalleryScreenshot[]
}

export interface Project {
  slug: ProjectSlug
  /** Home section id, kept from the mockup. */
  anchorId: 'opendoor' | 'packwright' | 'folio' | 'resumeiq'
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
  caseStudy: CaseStudy
}
