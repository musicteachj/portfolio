import { expect, test, type Page, type Route } from '@playwright/test'
import { site } from '../../app/data/site'
import { waitForHydration } from './helpers/hydration'
import { expectNoSeriousAxe } from './helpers/axe'

const SUCCESS = "Message sent. I'll reply to your email."
const FAILURE = "Your message didn't send. Check your connection and try again, or email me directly."
const CORS = { 'access-control-allow-origin': '*' }
const EMAILJS = 'https://api.emailjs.com/**'

// No test may reach the real EmailJS. Abort first; later routes win, so a test can answer.
test.beforeEach(async ({ page }) => {
  await page.route(EMAILJS, (route) => route.abort())
  await page.goto('/contact')
  await waitForHydration(page)
})

const VALUES = {
  name: '  Ada Lovelace ',
  email: ' ada@example.com ',
  subject: ' Hello there ',
  message: '  A short note.  ',
}

async function fillForm(page: Page) {
  await page.locator('#f-name').fill(VALUES.name)
  await page.locator('#f-email').fill(VALUES.email)
  await page.locator('#f-subject').fill(VALUES.subject)
  await page.locator('#f-message').fill(VALUES.message)
}

/** Answers every EmailJS request with the given status and body, and records the parsed bodies. */
async function answer(page: Page, status: number, body: string) {
  const bodies: Record<string, unknown>[] = []
  await page.route(EMAILJS, async (route) => {
    if (route.request().method() === 'OPTIONS') {
      return route.fulfill({
        status: 204,
        headers: { ...CORS, 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST, OPTIONS' },
      })
    }
    bodies.push(route.request().postDataJSON())
    await route.fulfill({ status, body, headers: { ...CORS, 'content-type': 'text/plain' } })
  })
  return bodies
}

/** Holds every EmailJS POST open until the returned release function is called. */
async function holdSends(page: Page) {
  let release!: () => void
  const gate = new Promise<void>((resolve) => { release = resolve })
  await page.route(EMAILJS, async (route) => {
    if (route.request().method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: { ...CORS, 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST, OPTIONS' } })
    }
    await gate
    await route.fulfill({ status: 200, body: 'OK', headers: { ...CORS, 'content-type': 'text/plain' } })
  })
  return release
}

/**
 * Loads /contact again with the app's scripts held back, so the form is plain server-rendered
 * HTML until the returned function releases them and waits for hydration.
 */
async function loadUnhydrated(page: Page) {
  let release!: () => void
  const gate = new Promise<void>((resolve) => { release = resolve })
  // Only scripts: holding the stylesheet would block rendering.
  await page.route((url) => url.pathname.startsWith('/_nuxt/') && url.pathname.endsWith('.js'), async (route) => {
    await gate
    await route.continue()
  })
  await page.goto('/contact', { waitUntil: 'commit' })
  await expect(page.locator('#f-message')).toBeVisible()
  return async () => {
    // Nuxt defines useNuxtApp when its entry script runs, so the form can't have hydrated yet.
    expect(await page.evaluate(() => 'useNuxtApp' in window), 'scripts held until now').toBe(false)
    release()
    await waitForHydration(page)
  }
}

/** Collects console errors and anything that mentions hydration. */
function watchConsole(page: Page) {
  const problems: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error' || /hydration/i.test(m.text())) problems.push(m.text())
  })
  return problems
}

async function expectFieldsValue(page: Page, filled: boolean) {
  for (const [id, key] of [['#f-name', 'name'], ['#f-email', 'email'], ['#f-subject', 'subject'], ['#f-message', 'message']] as const) {
    // The browser strips spaces from type=email values, so compare trimmed.
    if (filled) await expect(page.locator(id)).toHaveValue(key === 'email' ? VALUES.email.trim() : VALUES[key])
    else await expect(page.locator(id)).toHaveValue('')
  }
}

test('after hydration both Email links are mailto links', async ({ page }) => {
  const mailto = `mailto:${site.emailUser}@${site.emailDomain}`
  await expect(page.locator('.actions').getByRole('link', { name: 'Email' })).toHaveAttribute('href', mailto)
  await expect(page.locator('.direct').getByRole('link', { name: 'Email' })).toHaveAttribute('href', mailto)
})

test('the build carries the EmailJS config', async ({ page }) => {
  const lengths = await page.evaluate(() => {
    const c = (window as unknown as { useNuxtApp: () => { $config: { public: { emailjs: Record<string, unknown> } } } })
      .useNuxtApp().$config.public.emailjs
    return [c.serviceId, c.templateId, c.publicKey].map((v) => (typeof v === 'string' ? v.length : 0))
  })
  expect(lengths.every((n) => n > 0), 'set NUXT_PUBLIC_EMAILJS_* in .env, then generate').toBe(true)
})

test('empty submit shows every error and focuses Name', async ({ page }) => {
  let requests = 0
  await page.route(EMAILJS, (route) => { requests++; return route.abort() })
  // Record what a screen reader meets as focus lands on Name: the error must already be there.
  type Probe = { atFocus?: { invalid: string | null, err: string | null } }
  await page.locator('#f-name').evaluate((el) => {
    el.addEventListener('focus', () => {
      (window as unknown as Probe).atFocus = {
        invalid: el.getAttribute('aria-invalid'),
        err: document.getElementById('f-name-err')?.textContent ?? null,
      }
    }, { once: true })
  })
  await page.locator('#f-submit').click()
  await expect(page.locator('#f-name-err')).toHaveText('Enter your name')
  await expect(page.locator('#f-email-err')).toHaveText('Enter your email address')
  await expect(page.locator('#f-subject-err')).toHaveText('Enter a subject')
  await expect(page.locator('#f-message-err')).toHaveText('Enter a message')
  await expect(page.locator('#f-name')).toBeFocused()
  expect(await page.evaluate(() => (window as unknown as Probe).atFocus)).toEqual({ invalid: 'true', err: 'Enter your name' })
  expect(requests).toBe(0)
})

test('a successful send posts exactly the four params and announces success', async ({ page }) => {
  const bodies = await answer(page, 200, 'OK')
  await fillForm(page)
  await page.locator('#f-submit').click()
  await expect(page.locator('#f-status')).toHaveText(SUCCESS)
  await expect(page.locator('#f-status')).toHaveClass(/\bok\b/)
  await expectFieldsValue(page, false)

  expect(bodies).toHaveLength(1)
  const body = bodies[0]!
  expect(body.template_params).toEqual({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    subject: 'Hello there',
    message: 'A short note.',
  })
  // Compare in the page so a failure can never print the config values.
  const matches = await page.evaluate((b) => {
    const c = (window as unknown as { useNuxtApp: () => { $config: { public: { emailjs: Record<string, string> } } } })
      .useNuxtApp().$config.public.emailjs
    return b.service_id === c.serviceId && b.template_id === c.templateId && b.user_id === c.publicKey
  }, { service_id: body.service_id, template_id: body.template_id, user_id: body.user_id })
  expect(matches, 'request ids match the build config').toBe(true)
  await expectNoSeriousAxe(page)
})

test('an HTTP error keeps the fields and explains', async ({ page }) => {
  await answer(page, 400, 'The Public Key is invalid')
  await fillForm(page)
  await page.locator('#f-submit').click()
  await expect(page.locator('#f-status')).toHaveText(FAILURE)
  await expect(page.locator('#f-status')).toHaveClass(/\bbad\b/)
  await expectFieldsValue(page, true)
  await expect(page.locator('#f-submit')).toHaveText('Send message')
})

test('a network failure keeps the fields and explains', async ({ page }) => {
  await fillForm(page)
  await page.locator('#f-submit').click()
  await expect(page.locator('#f-status')).toHaveText(FAILURE)
  await expect(page.locator('#f-status')).toHaveClass(/\bbad\b/)
  await expectFieldsValue(page, true)
  await expect(page.locator('#f-submit')).toHaveText('Send message')
})

test('while sending, a second click or Enter sends nothing', async ({ page }) => {
  let release!: () => void
  const gate = new Promise<void>((resolve) => { release = resolve })
  let posts = 0
  await page.route(EMAILJS, async (route: Route) => {
    if (route.request().method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: { ...CORS, 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST, OPTIONS' } })
    }
    posts++
    await gate
    await route.fulfill({ status: 200, body: 'OK', headers: { ...CORS, 'content-type': 'text/plain' } })
  })
  await fillForm(page)
  const submit = page.locator('#f-submit')
  await submit.click()
  await expect(submit).toHaveText('Sending...')
  await expect(submit).toHaveAttribute('aria-disabled', 'true')
  // v11's sending look: dimmed, with a busy cursor.
  await expect(submit).toHaveCSS('opacity', '0.8')
  await expect(submit).toHaveCSS('cursor', 'progress')
  // A spinner shows beside the label, hidden from screen readers, which hear "Sending...".
  await expect(submit.locator('.spinner[aria-hidden="true"]')).toBeVisible()
  await expect(submit).toHaveAccessibleName('Sending...')
  // The SDK loads on demand, so wait for the first request to be held open.
  await expect.poll(() => posts).toBe(1)
  // Playwright treats aria-disabled as not enabled, so force the second click.
  await submit.click({ force: true })
  await page.locator('#f-subject').press('Enter')
  await expect(submit).toHaveText('Sending...')
  await page.waitForTimeout(300)
  expect(posts).toBe(1)
  release()
  await expect(submit).toHaveText('Send message')
  await expect(page.locator('#f-status')).toHaveText(SUCCESS)
  expect(posts).toBe(1)
})

test('the honeypot is out of the Tab order and the accessibility tree', async ({ page }) => {
  await page.locator('#f-message').focus()
  await page.keyboard.press('Tab')
  await expect(page.locator('#f-submit')).toBeFocused()
  await expect(page.getByRole('textbox')).toHaveCount(4)

  let requests = 0
  await page.route(EMAILJS, (route) => { requests++; return route.abort() })
  await fillForm(page)
  await page.locator('#f-hp').fill('spam', { force: true })
  await page.locator('#f-submit').click()
  await expect(page.locator('#f-status')).toHaveText(SUCCESS)
  expect(requests).toBe(0)
})

test('the empty status region stays in the accessibility tree and takes no space', async ({ page }) => {
  // A live region is announced reliably only if it is already in the tree when its text changes.
  const status = page.locator('#cform').getByRole('status')
  async function expectExposedAndCollapsed() {
    await expect(status).toHaveCount(1)
    await expect(status).toBeEmpty()
    await expect(status).not.toHaveCSS('display', 'none')
    await expect(status).toHaveCSS('height', '0px')
    await expect(status).toHaveCSS('margin-top', '0px')
  }
  await expectExposedAndCollapsed()

  // A failed send fills it, and the next send empties it while the request is in flight.
  await fillForm(page)
  await page.locator('#f-submit').click()
  await expect(status).toHaveText(FAILURE)
  const release = await holdSends(page)
  await page.locator('#f-submit').click()
  await expect(page.locator('#f-submit')).toHaveText('Sending...')
  await expectExposedAndCollapsed()
  release()
  await expect(status).toHaveText(SUCCESS)
})

test('text typed before hydration survives it and is sent', async ({ page }) => {
  const problems = watchConsole(page)
  const hydrate = await loadUnhydrated(page)
  await fillForm(page)
  await hydrate()
  await expectFieldsValue(page, true)

  const bodies = await answer(page, 200, 'OK')
  await page.locator('#f-submit').click()
  await expect(page.locator('#f-status')).toHaveText(SUCCESS)
  expect(bodies.map((b) => b.template_params)).toEqual([{
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    subject: 'Hello there',
    message: 'A short note.',
  }])
  expect(problems).toEqual([])
})

test('a honeypot filled before hydration still blocks the send', async ({ page }) => {
  const hydrate = await loadUnhydrated(page)
  await fillForm(page)
  await page.locator('#f-hp').fill('spam', { force: true })
  await hydrate()
  await expect(page.locator('#f-hp')).toHaveValue('spam')

  let requests = 0
  await page.route(EMAILJS, (route) => { requests++; return route.abort() })
  await page.locator('#f-submit').click()
  await expect(page.locator('#f-status')).toHaveText(SUCCESS)
  expect(requests).toBe(0)
})

test('error state passes axe', async ({ page }) => {
  await page.locator('#f-submit').click()
  await expect(page.locator('#f-name-err')).toHaveText('Enter your name')
  await expectNoSeriousAxe(page)
})
