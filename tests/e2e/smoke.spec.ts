import { expect, test } from '@playwright/test'

test('home returns 200 with its heading', async ({ page }) => {
  const res = await page.goto('/')
  expect(res?.status()).toBe(200)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('James Littlefield')
})

test('missing path returns 404', async ({ request }) => {
  expect((await request.get('/nope')).status()).toBe(404)
})

for (const path of ['/', '/projects', '/contact', '/projects/open-door']) {
  test(`no console errors or failed requests on ${path}`, async ({ page }) => {
    const problems: string[] = []
    page.on('console', (m) => {
      if (m.type() === 'error' || /hydration/i.test(m.text())) problems.push(m.text())
    })
    page.on('requestfailed', (r) => problems.push(`failed ${r.url()}`))
    page.on('response', (r) => {
      if (r.status() >= 400) problems.push(`${r.status()} ${r.url()}`)
    })
    const res = await page.goto(path)
    expect(res?.status()).toBe(200)
    await page.waitForLoadState('networkidle')
    expect(problems).toEqual([])
  })
}

test('unknown slug returns 404 page, before and after hydration', async ({ page, baseURL }) => {
  const problems: string[] = []
  const url = new URL('/projects/does-not-exist', baseURL).href
  page.on('console', (m) => {
    // Chromium logs "Failed to load resource" for the 404 document itself; that one is expected.
    if (m.location().url === url) return
    if (m.type() === 'error' || /hydration/i.test(m.text())) problems.push(m.text())
  })
  page.on('response', (r) => {
    const isDocument = r.url() === url && r.request().resourceType() === 'document'
    if (r.status() >= 400 && !isDocument) problems.push(`${r.status()} ${r.url()}`)
  })
  const res = await page.goto('/projects/does-not-exist')
  expect(res?.status()).toBe(404)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found')
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found')
  await expect(page.getByRole('link', { name: 'Go to the home page' })).toBeVisible()
  // error.vue renders instead of app.vue, so it carries its own route announcer. The
  // announcer is a client-only component: it appears after hydration, not in 404.html.
  await expect(page.locator('.nuxt-route-announcer [aria-live="polite"]')).toHaveCount(1)
  expect(problems).toEqual([])
})
