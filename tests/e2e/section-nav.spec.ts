import { expect, test, type Page } from '@playwright/test'
import { waitForHydration } from './helpers/hydration'
import { recordScrolls, scrollsBetween, waitForScrollIdle } from './helpers/scroll'

const inView = (page: Page, sel: string) =>
  page.locator(sel).evaluate((e) => {
    const r = e.getBoundingClientRect()
    return r.top >= -2 && r.top < window.innerHeight / 2
  })
const nav = (page: Page) => page.getByRole('navigation', { name: 'Primary' })

test('nav click changes URL to /contact and scrolls there', async ({ page }) => {
  await page.goto('/')
  await nav(page).getByRole('link', { name: 'Contact' }).click()
  await expect(page).toHaveURL('/contact')
  await expect.poll(() => inView(page, '#contact')).toBe(true)
  expect(page.url()).not.toContain('#')
})

test('direct load of /projects lands on the projects heading', async ({ page }) => {
  await page.goto('/projects')
  await expect.poll(() => inView(page, '#projects')).toBe(true)
})

test('direct load does not steal focus', async ({ page }) => {
  await page.goto('/contact')
  await expect.poll(() => inView(page, '#contact')).toBe(true)
  await expect(page.locator('#contact-h')).not.toBeFocused()
})

test('same-route nav click still scrolls', async ({ page }) => {
  await page.goto('/projects')
  await waitForHydration(page)
  await expect.poll(() => inView(page, '#projects')).toBe(true)
  await waitForScrollIdle(page)
  // Scroll away and let two frames pass, so the scroll is applied before the click starts
  // its own. A wheel event resolves before Chromium applies it, and a pending scroll can
  // cancel the click's smooth scroll.
  await page.evaluate(async () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  })
  expect(await inView(page, '#projects')).toBe(false)
  await nav(page)
    .getByRole('link', { name: 'Projects' })
    .evaluate((a: HTMLElement) => a.click())
  await expect.poll(() => inView(page, '#projects')).toBe(true)
  await expect(page.locator('#projects-h')).toBeFocused()
})

test('back restores previous position', async ({ page }) => {
  await page.goto('/')
  await expect
    .poll(() =>
      page.evaluate(() => {
        window.scrollTo(0, 1500)
        return window.scrollY
      }),
    )
    .toBe(1500)
  await nav(page)
    .getByRole('link', { name: 'Contact' })
    .evaluate((a: HTMLElement) => a.click())
  await expect(page).toHaveURL('/contact')
  await expect.poll(() => inView(page, '#contact')).toBe(true)
  await page.goBack()
  await expect(page).toHaveURL('/')
  await expect
    .poll(async () => Math.abs((await page.evaluate(() => window.scrollY)) - 1500))
    .toBeLessThanOrEqual(50)
})

test('wordmark from /contact returns to / at the top', async ({ page }) => {
  await page.goto('/contact')
  await expect.poll(() => inView(page, '#contact')).toBe(true)
  await page.getByRole('link', { name: /James Littlefield/ }).first().evaluate((a: HTMLElement) => a.click())
  await expect(page).toHaveURL('/')
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(50)
})

// /contact and / are one page, so the wordmark scrolls within it: a glide, or a jump under
// reduced motion. Only a real page change always jumps.
for (const reduced of [false, true]) {
  test(`wordmark from /contact ${reduced ? 'jumps to the top under reduced motion' : 'glides to the top'}`, async ({
    page,
  }) => {
    if (reduced) await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/contact')
    await waitForHydration(page)
    await expect.poll(() => inView(page, '#contact')).toBe(true)
    await waitForScrollIdle(page)
    const start = await page.evaluate(() => window.scrollY)
    expect(start).toBeGreaterThan(1000)
    await recordScrolls(page)
    await page.getByRole('link', { name: /James Littlefield/ }).first().evaluate((a: HTMLElement) => a.click())
    await expect(page).toHaveURL('/')
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
    const between = await scrollsBetween(page, 10, start - 10)
    if (reduced) expect(between).toEqual([])
    else expect(between.length).toBeGreaterThan(1)
  })
}

test('header Projects from /contact glides on Home', async ({ page }) => {
  await page.goto('/contact')
  await waitForHydration(page)
  await expect.poll(() => inView(page, '#contact')).toBe(true)
  await waitForScrollIdle(page)
  const start = await page.evaluate(() => window.scrollY)
  await recordScrolls(page)
  await nav(page)
    .getByRole('link', { name: 'Projects' })
    .evaluate((a: HTMLElement) => a.click())
  await expect(page).toHaveURL('/projects')
  await expect.poll(() => inView(page, '#projects')).toBe(true)
  await waitForScrollIdle(page)
  const end = await page.evaluate(() => window.scrollY)
  expect((await scrollsBetween(page, end + 10, start - 10)).length).toBeGreaterThan(1)
})

test('wordmark from a scrolled /projects returns to / at the top', async ({ page }) => {
  await page.goto('/projects')
  await expect.poll(() => inView(page, '#projects')).toBe(true)
  await expect
    .poll(() =>
      page.evaluate(() => {
        window.scrollTo(0, 1500)
        return window.scrollY
      }),
    )
    .toBe(1500)
  await page.getByRole('link', { name: /James Littlefield/ }).first().evaluate((a: HTMLElement) => a.click())
  await expect(page).toHaveURL('/')
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(50)
})

test('modified click on the wordmark opens a new page and leaves the URL', async ({ page, context }) => {
  await page.goto('/contact')
  const popup = context.waitForEvent('page')
  await page.getByRole('link', { name: /James Littlefield/ }).first().click({ modifiers: ['ControlOrMeta'] })
  await popup
  await expect(page).toHaveURL('/contact')
})

test('keyboard nav moves focus to the section heading', async ({ page }) => {
  await page.goto('/')
  await nav(page).getByRole('link', { name: 'Contact' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#contact-h')).toBeFocused()
})

test('typed text survives moving between section URLs (no remount)', async ({ page }) => {
  await page.goto('/contact')
  await page.fill('#f-name', 'Ada')
  await nav(page).getByRole('link', { name: 'Projects' }).click()
  await nav(page).getByRole('link', { name: 'Contact' }).click()
  await expect(page.locator('#f-name')).toHaveValue('Ada')
})

test('the /projects canonical stays the root after hydration', async ({ page }) => {
  await page.goto('/projects')
  await page.waitForLoadState('networkidle')
  const hrefs = await page
    .locator('link[rel="canonical"]')
    .evaluateAll((ls) => ls.map((l) => l.getAttribute('href')))
  expect(hrefs).toEqual(['https://jameslittlefield.net/'])
})

test('nav marks only the current section', async ({ page }) => {
  const current = async () =>
    page.evaluate(() =>
      [...document.querySelectorAll('nav[aria-label="Primary"] a')].map((a) => a.getAttribute('aria-current')),
    )
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  expect(await current()).toEqual([null, null, null])
  await page.goto('/projects')
  await page.waitForLoadState('networkidle')
  expect(await current()).toEqual(['location', null, null])
  await page.goto('/contact')
  await page.waitForLoadState('networkidle')
  expect(await current()).toEqual([null, 'location', null])
  await nav(page).getByRole('link', { name: 'Projects' }).click()
  await expect.poll(current).toEqual(['location', null, null])
})

for (const from of ['/projects/open-door', '/nope']) {
  for (const [label, id] of [
    ['Projects', 'projects'],
    ['Contact', 'contact'],
  ] as const) {
    for (const mode of ['mouse', 'keyboard'] as const) {
      test(`${mode} nav from ${from} to ${label} lands on the section`, async ({ page }) => {
        await page.goto(from)
        await page.waitForLoadState('networkidle')
        const link = nav(page).getByRole('link', { name: label })
        if (mode === 'mouse') await link.click()
        else {
          await link.focus()
          await page.keyboard.press('Enter')
        }
        await expect(page).toHaveURL(`/${id}`)
        await expect.poll(() => inView(page, `#${id}`)).toBe(true)
        await expect(page.locator(`#${id}-h`)).toBeFocused()
      })
    }
  }
}
