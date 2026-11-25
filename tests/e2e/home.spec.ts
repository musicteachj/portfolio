import { expect, test } from '@playwright/test'
import { projects } from '../../app/data/projects'
import { proofItems } from '../../app/utils/proof'
import { expectNoSeriousAxe } from './helpers/axe'
import { picksFor, sharpEnough } from './helpers/images'

test('first Tab focuses the skip link and it moves focus to main', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.locator('a.skip')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('main#main')).toBeFocused()
})

test('résumé link serves the PDF', async ({ request }) => {
  const r = await request.get('/resume.pdf')
  expect(r.status()).toBe(200)
  expect(r.headers()['content-type']).toContain('application/pdf')
})

test('Tab reaches only the enabled links inside each proof list', async ({ page }) => {
  await page.goto('/')
  for (const p of projects) {
    const focusables = await page
      .locator(`#${p.anchorId} .proof`)
      .evaluate((ul) => ul.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])').length)
    expect(focusables).toBe(proofItems(p, 'home').filter((i) => i.href).length)
  }
})

test('project names open each case study', async ({ page }) => {
  for (const [name, slug] of [
    ['Open Door', 'open-door'],
    ['Packwright', 'packwright'],
    ['Folio', 'folio'],
    ['ResumeIQ', 'resumeiq'],
  ] as const) {
    await page.goto('/')
    await page.getByRole('heading', { level: 2, name }).getByRole('link').click()
    await expect(page).toHaveURL(`/projects/${slug}`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(name)
  }
})

test('each Case study proof link opens its case study', async ({ page }) => {
  for (const [id, name, slug] of [
    ['opendoor', 'Open Door', 'open-door'],
    ['packwright', 'Packwright', 'packwright'],
    ['folio', 'Folio', 'folio'],
    ['resumeiq', 'ResumeIQ', 'resumeiq'],
  ] as const) {
    await page.goto('/')
    await page.locator(`#${id} .proof`).getByRole('link', { name: /Case study/ }).click()
    await expect(page).toHaveURL(`/projects/${slug}`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(name)
  }
})

test('Home has no serious or critical axe violations', async ({ page }) => {
  await page.goto('/')
  await expectNoSeriousAxe(page)
})

for (const w of [360, 390, 768, 1024, 1280, 1440]) {
  test(`no horizontal overflow at ${w}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 })
    await page.goto('/')
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
    ).toBeLessThanOrEqual(0)
  })
}

test('the LCP h1 stays visible at the start of the settle, unlike the other intro children', async ({ page }) => {
  await page.goto('/')
  // Pause each settle animation (finished ones stay listed with fill forwards) and rewind it to
  // its first frame, so the computed opacity is the start of the settle whenever this runs.
  // Vue scopes the keyframe name (settle-<hash>), so match the prefix.
  const result = await page.evaluate(() => {
    const first = (el: Element) => {
      const settle = el
        .getAnimations()
        .find((a) => (a as CSSAnimation).animationName.startsWith('settle'))
      if (!settle) return undefined
      settle.pause()
      settle.currentTime = 0
      return getComputedStyle(el).opacity
    }
    return {
      h1: first(document.querySelector('.intro > h1')!),
      lede: first(document.querySelector('.intro > h1 ~ p')!),
    }
  })
  expect(result.lede, 'control: the lede starts the settle at opacity 0').toBe('0')
  expect(result.h1, 'the h1 must not start the settle at opacity 0').toBe('1')
})

test('reduced motion disables the intro animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  expect(
    await page.locator('.intro > *').first().evaluate((e) => getComputedStyle(e).animationName),
  ).toBe('none')
})

test('touch targets in header, intro and proof lists are at least 44px tall', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/')
  const els = page.locator('.topbar a, .topbar button, .actions a, .actions button, .proof a, .proof button')
  const n = await els.count()
  expect(n).toBeGreaterThan(0)
  for (let i = 0; i < n; i++) {
    const box = await els.nth(i).boundingBox()
    expect(box!.height, `element ${i}`).toBeGreaterThanOrEqual(44)
  }
})

const portraitWidths = (page: import('@playwright/test').Page) =>
  page.locator('img.portrait').evaluate(async (img: HTMLImageElement) => {
    if (!img.complete) await new Promise((r) => img.addEventListener('load', r, { once: true }))
    const m = /s_(\d+)x(\d+)/.exec(img.currentSrc)
    return { src: Number(m?.[1] ?? 0), css: img.getBoundingClientRect().width, url: img.currentSrc }
  })

test.describe('portrait sharpness', () => {
  test.use({ viewport: { width: 820, height: 1100 }, deviceScaleFactor: 2 })
  test('820px at 2x picks a source close to the rendered size', async ({ page }) => {
    await page.goto('/')
    const w = await portraitWidths(page)
    expect(w.src, w.url).toBeGreaterThanOrEqual(0.9 * w.css * 2)
  })
})

test.describe('portrait size at 650 @1x', () => {
  // Between the sm screen (600px) and 700px the portrait still renders at 90px.
  test.use({ viewport: { width: 650, height: 900 }, deviceScaleFactor: 1 })
  test('picks a source sized for the 90px portrait', async ({ page }) => {
    await page.goto('/')
    const w = await portraitWidths(page)
    expect(w.css).toBeLessThan(100)
    expect(w.src, w.url).toBeLessThanOrEqual(1.5 * w.css)
  })
})

for (const dpr of [1, 3]) {
  test.describe(`portrait size at 390 @${dpr}x`, () => {
    test.use({ viewport: { width: 390, height: 800 }, deviceScaleFactor: dpr })
    test('does not pick an absurdly large source', async ({ page }) => {
      await page.goto('/')
      const w = await portraitWidths(page)
      expect(w.src, w.url).toBeGreaterThan(0)
      // srcset steps are discrete: at 3x the 270px need rounds up to the 400w step (4.4x).
      expect(w.src, w.url).toBeLessThanOrEqual(4.5 * w.css)
    })
  })
}

for (const path of ['/contact', '/projects']) {
  test(`skip link on ${path} lands at the top of main with focus`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    await page.keyboard.press('Tab')
    await expect(page.locator('a.skip')).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('main#main')).toBeFocused()
    await expect
      .poll(() =>
        page.locator('main#main').evaluate((e) => {
          const r = e.getBoundingClientRect()
          return r.top >= -2 && r.top < window.innerHeight
        }),
      )
      .toBe(true)
  })
}

test('direct load of /projects#packwright lands on #packwright', async ({ page }) => {
  await page.goto('/projects#packwright')
  await page.waitForLoadState('networkidle')
  await expect
    .poll(() =>
      page.locator('#packwright').evaluate((e) => {
        const r = e.getBoundingClientRect()
        return r.top >= -2 && r.top < window.innerHeight / 2
      }),
    )
    .toBe(true)
})

test('Back restores the saved offset instantly (no glide)', async ({ page }) => {
  await page.goto('/')
  await expect
    .poll(() =>
      page.evaluate(() => {
        window.scrollTo({ top: 1600, behavior: 'instant' })
        return window.scrollY
      }),
    )
    .toBeGreaterThan(1500)
  const saved = await page.evaluate(() => window.scrollY)
  await page.getByRole('heading', { level: 2, name: 'Packwright' }).getByRole('link').evaluate((a: HTMLElement) => a.click())
  await expect(page).toHaveURL('/projects/packwright')
  await page.evaluate(() => {
    const w = window as unknown as { __back: Promise<number> }
    w.__back = new Promise((resolve) => {
      const t = setInterval(() => {
        if (location.pathname === '/') {
          clearInterval(t)
          setTimeout(() => resolve(window.scrollY), 150)
        }
      }, 5)
    })
  })
  await page.goBack()
  const y = await page.evaluate(() => (window as unknown as { __back: Promise<number> }).__back)
  expect(Math.abs(y - saved)).toBeLessThanOrEqual(50)
})

const honestyCases = [
  { width: 1440, dpr: 1 },
  { width: 1440, dpr: 2 },
  { width: 390, dpr: 3 },
  { width: 768, dpr: 2 },
  { width: 820, dpr: 2 },
  { width: 899, dpr: 2 },
]
for (const { width, dpr } of honestyCases) {
  test.describe(`Home screenshots at ${width} @${dpr}x`, () => {
    test.use({ viewport: { width, height: 900 }, deviceScaleFactor: dpr })
    test('each picks a source sharp enough for its rendered size', async ({ page }) => {
      await page.goto('/')
      const picks = await picksFor(page.locator('.project img'))
      expect(picks).toHaveLength(projects.length)
      projects.forEach((p, i) => {
        const pick = picks[i]!
        const { got, need } = sharpEnough(pick, dpr, p.hero.width)
        expect(got, `${pick.url} for ${Math.round(pick.css)} css px`).toBeGreaterThanOrEqual(need)
        if (width === 1440 && dpr === 1) {
          expect(got, `${pick.url} for ${Math.round(pick.css)} css px`).toBeLessThanOrEqual(1.6 * pick.css)
        }
      })
    })
  })
}

test('every unstyled list in main keeps its list role', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const bad = await page.evaluate(() =>
    [...document.querySelectorAll('main ul, main ol')]
      .filter((l) => getComputedStyle(l).listStyleType === 'none' && l.getAttribute('role') !== 'list')
      .map((l) => l.className || l.tagName),
  )
  expect(bad).toEqual([])
})
