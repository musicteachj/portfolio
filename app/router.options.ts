import type { RouterConfig } from '@nuxt/schema'
import type { RouteLocationNormalized } from 'vue-router'
import { START_LOCATION } from 'vue-router'

type Position = { left?: number; top: number; behavior?: ScrollBehavior }

// Upper bound on waiting for the new page to render. Nuxt fires page:loading:end within a
// few ms of a client navigation; this only covers paths where it never fires (for example
// a page that throws into the error page), so the scroll still happens and never hangs.
const RENDER_TIMEOUT_MS = 500

// Set by the first call that isn't part of the landing (see `landing` below).
let landed = false

export default <RouterConfig>{
  scrollBehavior(to, from, saved) {
    const nuxtApp = useNuxtApp()
    // The first load: Nuxt passes START_LOCATION, and any call while the app hydrates counts.
    const first = from === START_LOCATION || nuxtApp.isHydrating
    // The landing: the first load, plus Nuxt's last step of it on a prerendered page whose URL
    // has a hash or query. Just after hydration, Nuxt replaces the route with the URL the page
    // loaded at, so `to` and `from` are the same location (and it isn't Back/Forward).
    const landing = first || (!landed && to.fullPath === from.fullPath && !nuxtApp.$isHistoryNav())
    if (!landing) landed = true
    // One page: the same path, or two of Home's URLs (/, /projects, /contact share a key).
    const samePage = !first && pageKey(to) === pageKey(from)
    // The page is already in place on the first load (server-rendered) and when the page
    // doesn't change, so those scroll right away. A page change waits for the new page to
    // render: scrolling earlier would apply to the old page's layout.
    const when = (pos: () => Position | false) => (first || samePage ? pos() : afterRender(to, pos))
    // Within one page, a move follows the reader's motion preference (a glide, or a jump
    // under reduced motion). A new page jumps, rather than gliding from the old offset.
    const motion: ScrollBehavior = samePage ? scrollBehaviorPref() : 'instant'

    // 1. Back/Forward (or a reload) restores the saved offset without inheriting the
    //    smooth scrolling from base.css.
    if (saved) return when(() => ({ ...saved, behavior: 'instant' }))
    // 2. An explicit hash (skip link, TOC, #packwright) wins over the section path.
    //    A direct landing jumps, so a shared deep link opens at its section: base.css
    //    keeps the browser's own jump to the hash instant until the app has hydrated,
    //    and this jump puts the section at its scroll margin.
    if (to.hash) return when(() => hashPosition(to.hash, landing ? 'instant' : motion))
    // 3. A section URL (/projects, /contact) scrolls to its section. A direct landing
    //    follows the motion preference, as a click within Home does.
    const id = sectionIdForPath(to.path)
    if (id) return when(() => hashPosition(`#${id}`, first ? scrollBehaviorPref() : motion))
    // 4. On the first load, leave the page where it is: the reader may already have
    //    scrolled before hydration.
    if (first) return false
    // 5. Leaving a hash on the same path (Back out of a TOC jump, which the router never
    //    saved a position for): go to the top, as Nuxt's default does, so Back visibly
    //    goes back. A history move jumps, like every other Back.
    if (to.path === from.path) {
      if (!from.hash) return false
      return { left: 0, top: 0, behavior: nuxtApp.$isHistoryNav() ? 'instant' : motion }
    }
    // 6. Anything else opens at the top: a glide within Home (the wordmark from
    //    /contact), a jump to a new page once it has rendered.
    return when(() => ({ left: 0, top: 0, behavior: motion }))
  },
}

// The page a route renders: Home's aliases share the key 'home', other pages their path.
function pageKey(r: RouteLocationNormalized): string {
  return typeof r.meta.key === 'string' ? r.meta.key : r.path
}

// Like Nuxt's default router options: wait for page:loading:end, then for the next
// animation frame. That frame's callbacks run before the new page is first painted, so
// the scroll lands without a visible frame at the old offset. The fallback timer resolves
// the scroll if the hook never fires.
function afterRender(
  to: RouteLocationNormalized,
  pos: () => Position | false,
): Promise<Position | false> {
  const nuxtApp = useNuxtApp()
  const router = useRouter()
  return new Promise((resolve) => {
    let settled = false
    const settle = () => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      off()
      requestAnimationFrame(() => {
        // A newer navigation owns the scroll now.
        resolve(router.currentRoute.value.fullPath === to.fullPath ? pos() : false)
      })
    }
    const timer = setTimeout(settle, RENDER_TIMEOUT_MS)
    const off = nuxtApp.hooks.hookOnce('page:loading:end', settle)
  })
}

// vue-router's `el` option ignores scroll-margin-top, so compute the offset here. The
// router has already decoded the hash, so decoding it again would break ids with a %.
function hashPosition(hash: string, behavior: ScrollBehavior): Position | false {
  const el = document.getElementById(hash.slice(1))
  if (!el) return false
  const margin = Number.parseFloat(getComputedStyle(el).scrollMarginTop) || 0
  return { top: el.getBoundingClientRect().top + window.scrollY - margin, behavior }
}
