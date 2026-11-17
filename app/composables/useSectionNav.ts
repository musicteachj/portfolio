// The Projects and Contact URLs are aliases of the Home page. These helpers keep
// them behaving like in-page navigation: scroll, then (for nav clicks) focus.
export const SECTION_PATHS: Record<'/projects' | '/contact', string> = {
  '/projects': 'projects',
  '/contact': 'contact',
}

export function sectionIdForPath(path: string): string | undefined {
  return (SECTION_PATHS as Record<string, string>)[path]
}

export function scrollBehaviorPref(): ScrollBehavior {
  if (import.meta.server) return 'auto'
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

export function focusSectionHeading(id: string) {
  document.getElementById(`${id}-h`)?.focus({ preventScroll: true })
}

export function scrollToSection(id: string, opts: { focus?: boolean } = {}) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: scrollBehaviorPref(), block: 'start' })
  if (opts.focus) focusSectionHeading(id)
}
