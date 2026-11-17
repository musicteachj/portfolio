import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig>{
  scrollBehavior(to, _from, saved) {
    // Back/Forward restore must not inherit the smooth scrolling from base.css.
    if (saved) return { ...saved, behavior: 'instant' }
    // An explicit hash (skip link, #packwright) wins over the section path.
    if (to.hash) return { el: to.hash, top: 0, behavior: scrollBehaviorPref() }
    const id = sectionIdForPath(to.path)
    if (id) return { el: `#${id}`, top: 0, behavior: scrollBehaviorPref() }
    return { top: 0, left: 0, behavior: scrollBehaviorPref() }
  },
}
