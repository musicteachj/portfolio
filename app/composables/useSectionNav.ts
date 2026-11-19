// The Projects and Contact URLs are aliases of the Home page. These helpers keep
// them behaving like in-page navigation: scroll, then (for nav clicks) focus.
const SECTION_PATHS: Record<'/projects' | '/contact', string> = {
  '/projects': 'projects',
  '/contact': 'contact',
}

export function sectionIdForPath(path: string): string | undefined {
  return (SECTION_PATHS as Record<string, string>)[path]
}

// Explicit values, so the motion doesn't depend on CSS: 'auto' would follow html's
// scroll-behavior, which is set by `html.smooth-scroll` (added after hydration, and off
// under reduced motion).
export function scrollBehaviorPref(): ScrollBehavior {
  if (import.meta.server) return 'auto'
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
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
