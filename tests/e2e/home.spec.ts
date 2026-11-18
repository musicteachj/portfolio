import { expect, test } from '@playwright/test'
import { expectNoSeriousAxe } from './helpers/axe'

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

test('Tab reaches only the case study link inside each proof list', async ({ page }) => {
  await page.goto('/')
  for (const id of ['opendoor', 'packwright', 'folio', 'resumeiq']) {
    const focusables = await page
      .locator(`#${id} .proof`)
      .evaluate((ul) => ul.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])').length)
    expect(focusables).toBe(1)
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
