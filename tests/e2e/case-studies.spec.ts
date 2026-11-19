import { expect, test, type Page } from '@playwright/test'
import { projects } from '../../app/data/projects'
import { expectNoSeriousAxe } from './helpers/axe'
import { picksFor, sharpEnough } from './helpers/images'

const slugs = ['open-door', 'packwright', 'folio', 'resumeiq']

for (const slug of [...slugs.map((s) => `/projects/${s}`), '/nope']) {
  test(`no serious axe violations on ${slug}`, async ({ page }) => {
    await page.goto(slug)
    await expectNoSeriousAxe(page)
  })
}

for (const slug of slugs) {
  for (const width of [360, 390, 768, 1024, 1280, 1440]) {
    test(`no horizontal overflow on ${slug} at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(`/projects/${slug}`)
      await page.waitForLoadState('networkidle')
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(over).toBeLessThanOrEqual(0)
    })
  }
}

test('toc is visible at 1280 and hidden at 1024', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/projects/open-door')
  await expect(page.locator('.toc')).toBeVisible()
  await page.setViewportSize({ width: 1024, height: 900 })
  await expect(page.locator('.toc')).toBeHidden()
})

test('tabs are a 2x2 grid at 390', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/projects/open-door')
  const tops = await page.locator('.ptabs a').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)))
  expect(new Set(tops).size).toBe(2)
})

test('results table scrolls inside its region at 360', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/projects/open-door')
  const r = page.locator('#results .table-wrap')
  expect(await r.evaluate((e) => e.scrollWidth > e.clientWidth)).toBe(true)
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0)
  await r.focus()
  await expect(r).toBeFocused()
})

test('request flow stacks on phones and keeps its label', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/projects/open-door')
  await expect(page.locator('#architecture .node-label').first()).toBeVisible()
  await expect(page.locator('#architecture .branch').first()).toBeHidden()
  expect(await page.locator('#architecture .flow').getAttribute('role')).toBe('img')
  expect((await page.locator('#architecture .flow').getAttribute('aria-label'))?.length).toBeGreaterThan(0)
  await page.setViewportSize({ width: 1280, height: 900 })
  await expect(page.locator('#architecture .branch').first()).toBeVisible()
  await expect(page.locator('#architecture .node-label').first()).toBeHidden()
  expect((await page.locator('#architecture .flow').getAttribute('aria-label'))?.length).toBeGreaterThan(0)
})

// Scrolls each lazy gallery image into view so the browser picks a source at this viewport,
// then reads the picked width from the IPX size modifier (s_<W>x<H>) in currentSrc.
async function galleryPicks(page: Page) {
  const imgs = page.locator('.gallery img')
  const picks: { src: number; css: number; url: string }[] = []
  for (let i = 0; i < (await imgs.count()); i++) {
    await imgs.nth(i).scrollIntoViewIfNeeded()
    picks.push(
      await imgs.nth(i).evaluate(async (img: HTMLImageElement) => {
        if (!img.complete || !img.currentSrc)
          await new Promise((r) => img.addEventListener('load', r, { once: true }))
        const m = /s_(\d+)x\d+/.exec(img.currentSrc)
        return { src: Number(m?.[1] ?? 0), css: img.getBoundingClientRect().width, url: img.currentSrc }
      }),
    )
  }
  return picks
}

for (const dpr of [1, 2]) {
  test.describe(`gallery at 1440 @${dpr}x`, () => {
    test.use({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: dpr })
    for (const p of projects) {
      test(`${p.slug} gallery picks a source sharp enough for its rendered size`, async ({ page }) => {
        await page.goto(`/projects/${p.slug}`)
        const picks = await galleryPicks(page)
        expect(picks).toHaveLength(p.caseStudy.gallery.length)
        p.caseStudy.gallery.forEach((g, i) => {
          const pick = picks[i]!
          // A source smaller than the need is fine only when it is the original file.
          const got = Math.min(pick.src, g.width)
          const need = Math.min(0.95 * pick.css * dpr, g.width)
          expect(got, `${pick.url} for ${Math.round(pick.css)} css px`).toBeGreaterThanOrEqual(need)
        })
      })
    }
  })

  test.describe(`gallery at 768 @${dpr}x`, () => {
    test.use({ viewport: { width: 768, height: 900 }, deviceScaleFactor: dpr })
    for (const p of projects) {
      test(`${p.slug} gallery does not pick an absurdly large source`, async ({ page }) => {
        await page.goto(`/projects/${p.slug}`)
        const picks = await galleryPicks(page)
        expect(picks).toHaveLength(p.caseStudy.gallery.length)
        p.caseStudy.gallery.forEach((g, i) => {
          const pick = picks[i]!
          expect(pick.src, pick.url).toBeGreaterThan(0)
          const got = Math.min(pick.src, g.width)
          expect(got, `${pick.url} for ${Math.round(pick.css)} css px`).toBeLessThanOrEqual(2.5 * pick.css * dpr)
        })
      })
    }
  })
}

for (const { width, dpr } of [
  { width: 1440, dpr: 1 },
  { width: 1440, dpr: 2 },
  { width: 390, dpr: 3 },
]) {
  test.describe(`case study hero at ${width} @${dpr}x`, () => {
    test.use({ viewport: { width, height: 900 }, deviceScaleFactor: dpr })
    for (const p of projects) {
      test(`${p.slug} hero picks a source sharp enough for its rendered size`, async ({ page }) => {
        await page.goto(`/projects/${p.slug}`)
        const [pick] = await picksFor(page.locator('.cs-hero img'))
        expect(pick).toBeDefined()
        const { got, need } = sharpEnough(pick!, dpr, p.hero.width)
        expect(got, `${pick!.url} for ${Math.round(pick!.css)} css px`).toBeGreaterThanOrEqual(need)
        if (width === 1440 && dpr === 1) {
          expect(got, `${pick!.url} for ${Math.round(pick!.css)} css px`).toBeLessThanOrEqual(1.6 * pick!.css)
        }
      })
    }
  })
}

test('every unstyled list in main keeps its list role on a case study', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  for (const slug of slugs) {
    await page.goto(`/projects/${slug}`)
    const bad = await page.evaluate(() =>
      [...document.querySelectorAll('main ul, main ol')]
        .filter((l) => getComputedStyle(l).listStyleType === 'none' && l.getAttribute('role') !== 'list')
        .map((l) => l.className || l.tagName),
    )
    expect(bad, slug).toEqual([])
  }
})
