import { expect, test, type Page } from '@playwright/test'
import { waitForHydration } from './helpers/hydration'
import { recordScrolls, scrollsBetween, waitForScrollIdle } from './helpers/scroll'

const scrollY = (page: Page) => page.evaluate(() => window.scrollY)
const inView = (page: Page, sel: string) =>
  page.locator(sel).evaluate((e) => {
    const r = e.getBoundingClientRect()
    return r.top >= -2 && r.top < window.innerHeight / 2
  })
const activeId = (page: Page) => page.evaluate(() => document.activeElement?.id ?? '')
const routerHash = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { useNuxtApp: () => { $router: { currentRoute: { value: { hash: string } } } } }
    return w.useNuxtApp().$router.currentRoute.value.hash
  })

test('case study opens at the top and Back restores Home', async ({ page }) => {
  await page.goto('/')
  await waitForHydration(page)
  await expect
    .poll(async () => {
      await page.evaluate(() => window.scrollTo(0, 2200))
      return scrollY(page)
    })
    .toBeGreaterThan(2100)
  await recordScrolls(page)
  await page.locator('#folio h2 a').evaluate((a) => (a as HTMLAnchorElement).click())
  await expect(page).toHaveURL('/projects/folio')
  await expect.poll(() => scrollY(page)).toBeLessThan(10)
  await page.goBack()
  await expect(page).toHaveURL('/')
  await expect.poll(() => scrollY(page)).toBeGreaterThan(2150)
  // Both moves are jumps: nothing between the top of the case study and the Home offset.
  expect(await scrollsBetween(page, 10, 2100)).toEqual([])
})

test('focus moves to the case study heading', async ({ page }) => {
  await page.goto('/')
  await waitForHydration(page)
  await page.locator('#packwright h2 a').click()
  await expect(page).toHaveURL('/projects/packwright')
  await expect(page.locator('#case-title')).toBeFocused()
})

test('a first load of a case study leaves focus alone', async ({ page }) => {
  await page.goto('/projects/packwright')
  await waitForHydration(page)
  expect(await activeId(page)).not.toBe('case-title')
})

test('Back and Forward to a case study leave focus where the browser puts it', async ({ page }) => {
  await page.goto('/projects/packwright')
  await waitForHydration(page)
  await page.getByRole('link', { name: /Next project/ }).click()
  await expect(page).toHaveURL('/projects/folio')
  await expect(page.locator('#case-title')).toBeFocused()
  await page.goBack()
  await expect(page).toHaveURL('/projects/packwright')
  await expect(page.locator('#case-title')).toHaveText('Packwright')
  // The heading's onMounted has run by the time it shows, so a focus move would be visible now.
  expect(await activeId(page)).not.toBe('case-title')
  await page.goForward()
  await expect(page).toHaveURL('/projects/folio')
  await expect(page.locator('#case-title')).toHaveText('Folio')
  expect(await activeId(page)).not.toBe('case-title')
})

test('route announcer announces the new page', async ({ page }) => {
  await page.goto('/')
  await waitForHydration(page)
  const live = page.locator('.nuxt-route-announcer [aria-live]')
  await expect(live).toHaveAttribute('aria-live', 'polite')
  await page.locator('#packwright h2 a').click()
  await expect(page).toHaveURL('/projects/packwright')
  await expect(live).toContainText('Packwright')
})

test('toc and direct hash land on the section heading', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  // The section lands at its scroll-margin-top (v11: var(--s-4)); its heading sits below the
  // section's top padding and must be fully visible.
  const landed = () =>
    page.locator('#results').evaluate((s) => {
      const h = document.getElementById('results-h')!.getBoundingClientRect()
      const margin = parseFloat(getComputedStyle(s).scrollMarginTop)
      return (
        margin > 0 &&
        Math.abs(s.getBoundingClientRect().top - margin) <= 1 &&
        h.top >= 0 &&
        h.bottom <= window.innerHeight
      )
    })
  await page.goto('/projects/folio')
  await waitForHydration(page)
  await page.locator('.toc a[href="#results"]').click()
  await expect(page).toHaveURL('/projects/folio#results')
  // The browser jumps first; wait until the router has taken the hash change, so the check
  // reads the router's own scroll (instant under reduced motion), not the native jump.
  await expect.poll(() => routerHash(page)).toBe('#results')
  expect(await landed()).toBe(true)
  await page.goto('/')
  await page.goto('/projects/folio#results')
  await waitForHydration(page)
  await expect.poll(landed).toBe(true)
})

test('a direct landing on a case study hash jumps there @cross-browser', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  // Record from the earliest point, before any of the page's own scripts or its fragment jump:
  // every scroll position, and the motion of every scripted scroll (the router's).
  await page.addInitScript(() => {
    const w = window as unknown as { __scrolls: number[]; __asked: string[] }
    w.__scrolls = []
    w.__asked = []
    addEventListener('scroll', () => w.__scrolls.push(Math.round(window.scrollY)), { passive: true })
    const scrollTo = window.scrollTo.bind(window) as (...args: unknown[]) => void
    window.scrollTo = ((...args: unknown[]) => {
      const opts = args[0]
      w.__asked.push(typeof opts === 'object' && opts ? ((opts as ScrollToOptions).behavior ?? 'auto') : 'auto')
      scrollTo(...args)
    }) as typeof window.scrollTo
  })
  // Where #results sits at its scroll margin, and whether the page is there now.
  const place = () =>
    page.locator('#results').evaluate((s) => {
      const margin = parseFloat(getComputedStyle(s).scrollMarginTop)
      const top = s.getBoundingClientRect().top
      return { margin, target: Math.round(top + window.scrollY - margin), landed: Math.abs(top - margin) <= 1 }
    })
  await page.goto('/projects/folio#results')
  await waitForHydration(page)
  // Nuxt puts the hash back on the route just after hydration, and scrolls for it once more.
  await expect.poll(() => routerHash(page)).toBe('#results')
  await expect.poll(async () => (await place()).landed).toBe(true)
  await waitForScrollIdle(page)
  const { margin, target, landed } = await place()
  expect(margin).toBeGreaterThan(0)
  expect(landed).toBe(true)
  // A jump, not a glide. The browser's own jump to the fragment can stop once or twice
  // short of the target before the layout settles (Firefox on Linux in CI did, once,
  // at 2652 for a target past 2700), and the router then jumps to the exact spot. A glide
  // from the top would record a position on nearly every frame of the way down.
  expect((await scrollsBetween(page, 10, target - 10)).length).toBeLessThanOrEqual(2)
  // Including the router's own scrolls, which would glide wherever the page happened to be.
  const asked = await page.evaluate(() => (window as unknown as { __asked: string[] }).__asked)
  expect(asked.filter((b) => b !== 'instant')).toEqual([])
})

// After hydration a TOC link moves within the page, so it follows the motion preference.
for (const reduced of [false, true]) {
  test(`a TOC click ${reduced ? 'jumps to its section under reduced motion' : 'glides to its section'}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    if (reduced) await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/projects/folio')
    await waitForHydration(page)
    await recordScrolls(page)
    await page.locator('.toc a[href="#results"]').click()
    await expect(page).toHaveURL('/projects/folio#results')
    await expect.poll(() => routerHash(page)).toBe('#results')
    await expect.poll(() => scrollY(page)).toBeGreaterThan(1000)
    await waitForScrollIdle(page)
    const between = await scrollsBetween(page, 10, (await scrollY(page)) - 10)
    if (reduced) expect(between).toEqual([])
    else expect(between.length).toBeGreaterThan(1)
  })
}

test('Back out of a TOC jump returns to the top of the case study', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/projects/folio')
  await waitForHydration(page)
  await page.locator('.toc a[href="#results"]').click()
  await expect(page).toHaveURL('/projects/folio#results')
  // The browser changes the URL first; wait until the router has taken the hash change too.
  await expect.poll(() => routerHash(page)).toBe('#results')
  await expect.poll(() => scrollY(page)).toBeGreaterThan(1000)
  await waitForScrollIdle(page)
  const start = await scrollY(page)
  await recordScrolls(page)
  await page.goBack()
  await expect(page).toHaveURL('/projects/folio')
  await expect.poll(() => scrollY(page)).toBeLessThan(10)
  // A history move: a jump, like every other Back.
  expect(await scrollsBetween(page, 10, start - 10)).toEqual([])
})

test('header Projects from a scrolled case study jumps to the Home section', async ({ page }) => {
  await page.goto('/projects/folio')
  await waitForHydration(page)
  await expect
    .poll(async () => {
      await page.evaluate(() => window.scrollTo({ top: 1500, behavior: 'instant' }))
      return scrollY(page)
    })
    .toBeGreaterThan(1400)
  const start = await scrollY(page)
  await recordScrolls(page)
  await page
    .getByRole('navigation', { name: 'Primary' })
    .getByRole('link', { name: 'Projects' })
    .evaluate((a) => (a as HTMLAnchorElement).click())
  await expect(page).toHaveURL('/projects')
  await expect.poll(() => inView(page, '#projects')).toBe(true)
  await waitForScrollIdle(page)
  const end = await scrollY(page)
  // A page change: the new page renders, then jumps. No glide from the old offset.
  expect(await scrollsBetween(page, Math.min(start, end) + 10, Math.max(start, end) - 10)).toEqual([])
  await expect(page.locator('#projects-h')).toBeFocused()
})

test('a client push to a case study hash lands on that section and focuses its heading', async ({ page }) => {
  await page.goto('/')
  await waitForHydration(page)
  await page.evaluate(() => {
    const w = window as unknown as { useNuxtApp: () => { $router: { push: (to: string) => Promise<unknown> } } }
    return w.useNuxtApp().$router.push('/projects/folio#media')
  })
  await expect(page).toHaveURL('/projects/folio#media')
  await expect.poll(() => inView(page, '#media')).toBe(true)
  await expect(page.locator('#media-h')).toBeFocused()
  expect(await activeId(page)).not.toBe('case-title')
})

test('tabs and prev/next navigate between case studies at the top', async ({ page }) => {
  await page.goto('/projects/open-door')
  await waitForHydration(page)
  await expect
    .poll(async () => {
      await page.evaluate(() => window.scrollTo({ top: 1500, behavior: 'instant' }))
      return scrollY(page)
    })
    .toBeGreaterThan(1400)
  // A script click keeps the page scrolled down (a real click would scroll the tab into view).
  await page.locator('.ptabs a[href="/projects/folio"]').evaluate((a) => (a as HTMLAnchorElement).click())
  await expect(page).toHaveURL('/projects/folio')
  await expect.poll(() => scrollY(page)).toBeLessThan(10)
  await expect(page.locator('#case-title')).toBeFocused()
  await expect(page.locator('#case-title')).toHaveText('Folio')
  await page.getByRole('link', { name: /Next project/ }).click()
  await expect(page).toHaveURL('/projects/resumeiq')
  await expect.poll(() => scrollY(page)).toBeLessThan(10)
  await expect(page.locator('#case-title')).toBeFocused()
  await expect(page.locator('#case-title')).toHaveText('ResumeIQ')
})

test('All projects returns to the Home projects section with focus', async ({ page }) => {
  await page.goto('/projects/folio')
  await waitForHydration(page)
  await page.locator('.back').click()
  await expect(page).toHaveURL('/projects')
  await expect.poll(() => inView(page, '#projects')).toBe(true)
  await expect(page.locator('#projects-h')).toBeFocused()
})

test('404 page actions', async ({ page }) => {
  await page.goto('/nope')
  await waitForHydration(page)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found')
  const btns = page.locator('main .actions a.btn')
  expect(await btns.evaluateAll((as) => as.map((a) => [a.textContent?.trim(), a.getAttribute('href')]))).toEqual([
    ['Go to the home page', '/'],
    ['See the projects', '/projects'],
  ])
  for (let i = 0; i < 2; i++) {
    const box = await btns.nth(i).boundingBox()
    expect(box!.height, `button ${i}`).toBeGreaterThanOrEqual(44)
  }
  await page.getByRole('link', { name: 'See the projects' }).click()
  await expect(page).toHaveURL('/projects')
  await expect.poll(() => inView(page, '#projects')).toBe(true)
  await expect(page.locator('#projects-h')).toBeFocused()
})

test('hydration leaves a page the reader already scrolled where it is', async ({ page }) => {
  // Hold the app's scripts until the reader has scrolled the server-rendered page.
  let release!: () => void
  const gate = new Promise<void>((r) => (release = r))
  await page.route('**/_nuxt/*.js', async (route) => {
    await gate
    await route.continue()
  })
  await page.goto('/', { waitUntil: 'commit' })
  await page.locator('#packwright').waitFor({ state: 'attached' })
  await expect
    .poll(async () => {
      await page.evaluate(() => window.scrollTo({ top: 1600, behavior: 'instant' }))
      return scrollY(page)
    })
    .toBe(1600)
  release()
  await waitForHydration(page)
  await page.waitForLoadState('networkidle')
  expect(await scrollY(page)).toBe(1600)
})
