import { afterEach, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { clearNuxtState } from '#imports'
import ContactForm from '../../app/components/ContactForm.vue'
import { flushPromises } from '@vue/test-utils'

const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }))
mockNuxtImport('sendContactMessage', () => sendMock)

const valid = { name: 'Ada Lovelace', email: 'ada@example.com', subject: 'Hello', message: 'A note.' }
const keys = ['name', 'email', 'subject', 'message'] as const

let mounted: Awaited<ReturnType<typeof mountSuspended>> | undefined

async function mountForm() {
  mounted = await mountSuspended(ContactForm, { attachTo: document.body })
  return mounted
}

async function fill(w: NonNullable<typeof mounted>, values: Record<string, string>) {
  for (const [key, value] of Object.entries(values)) await w.find(`#f-${key}`).setValue(value)
}

afterEach(() => {
  mounted?.unmount()
  mounted = undefined
  // The draft is app state and outlives a mount, so no test may start with another's.
  clearNuxtState('contact-draft')
  sendMock.mockReset()
  vi.restoreAllMocks()
})

it('blur on an untouched empty field shows no error', async () => {
  const w = await mountForm()
  await w.find('#f-name').trigger('blur')
  expect(w.find('#f-name-err').text()).toBe('')
  expect(w.find('#f-name').attributes('aria-invalid')).toBeUndefined()
})

it('submitting empty shows all four errors and focuses Name', async () => {
  const w = await mountForm()
  // What a screen reader meets as focus lands: the error must already be rendered.
  let atFocus: { invalid: string | null, err: string | null } | undefined
  const name = w.find('#f-name').element
  name.addEventListener('focus', () => {
    atFocus = { invalid: name.getAttribute('aria-invalid'), err: document.getElementById('f-name-err')!.textContent }
  }, { once: true })
  await w.find('form').trigger('submit')
  expect(w.find('#f-name-err').text()).toBe('Enter your name')
  expect(w.find('#f-email-err').text()).toBe('Enter your email address')
  expect(w.find('#f-subject-err').text()).toBe('Enter a subject')
  expect(w.find('#f-message-err').text()).toBe('Enter a message')
  for (const key of keys) expect(w.find(`#f-${key}`).attributes('aria-invalid')).toBe('true')
  expect(document.activeElement?.id).toBe('f-name')
  expect(atFocus).toEqual({ invalid: 'true', err: 'Enter your name' })
  expect(sendMock).not.toHaveBeenCalled()
})

it('fixing a field clears its error as you type', async () => {
  const w = await mountForm()
  await w.find('form').trigger('submit')
  await w.find('#f-email').setValue('nope')
  expect(w.find('#f-email-err').text()).toBe('Enter a valid email address, like name@example.com')
  await w.find('#f-email').setValue('ada@example.com')
  expect(w.find('#f-email-err').text()).toBe('')
  expect(w.find('#f-email').attributes('aria-invalid')).toBeUndefined()
})

it('a valid submit sends the fields and shows success, then clears the form', async () => {
  sendMock.mockResolvedValue(undefined)
  const w = await mountForm()
  await fill(w, valid)
  await w.find('form').trigger('submit')
  await vi.waitFor(() => expect(w.find('#f-status').classes()).toContain('ok'), { timeout: 2000 })
  expect(sendMock).toHaveBeenCalledWith(valid, expect.anything())
  expect(sendMock.mock.calls[0]![0]).not.toHaveProperty('hp')
  expect(w.find('#f-status').text()).toBe("Message sent. I'll reply to your email.")
  for (const key of keys) expect((w.find(`#f-${key}`).element as HTMLInputElement).value).toBe('')
})

it('a rejected send keeps the fields and shows the failure copy', async () => {
  sendMock.mockRejectedValue(new Error('boom'))
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  const w = await mountForm()
  await fill(w, valid)
  await w.find('form').trigger('submit')
  await vi.waitFor(() => expect(w.find('#f-status').classes()).toContain('bad'), { timeout: 2000 })
  expect(w.find('#f-status').text()).toBe(
    "Your message didn't send. Check your connection and try again, or email me directly.",
  )
  for (const key of keys) expect((w.find(`#f-${key}`).element as HTMLInputElement).value).toBe(valid[key])
})

it('a second submit while sending does nothing', async () => {
  let resolve!: () => void
  sendMock.mockReturnValue(new Promise<void>((r) => { resolve = r }))
  const w = await mountForm()
  await fill(w, valid)
  await w.find('form').trigger('submit')
  await w.find('form').trigger('submit')
  expect(sendMock).toHaveBeenCalledTimes(1)
  expect(w.find('#f-submit').text()).toBe('Sending...')
  expect(w.find('#f-submit').attributes('aria-disabled')).toBe('true')
  expect(w.find('#f-submit .spinner').attributes('aria-hidden')).toBe('true')
  resolve()
  await vi.waitFor(() => expect(w.find('#f-submit').text()).toBe('Send message'), { timeout: 2000 })
  expect(w.find('#f-submit').attributes('aria-disabled')).toBeUndefined()
  expect(w.find('#f-submit .spinner').exists()).toBe(false)
})

it('a fast reply still shows Sending... for at least 600ms', async () => {
  sendMock.mockResolvedValue(undefined)
  const w = await mountForm()
  await fill(w, valid)
  const start = Date.now()
  await w.find('form').trigger('submit')
  await flushPromises()
  // The send has already resolved, but the sending state holds.
  expect(w.find('#f-submit').text()).toBe('Sending...')
  await vi.waitFor(() => expect(w.find('#f-status').classes()).toContain('ok'), { timeout: 2000 })
  expect(Date.now() - start).toBeGreaterThanOrEqual(550)
  expect(w.find('#f-submit').text()).toBe('Send message')
})

it('the draft survives a remount, without the honeypot', async () => {
  const first = await mountForm()
  await fill(first, valid)
  await first.find('#f-hp').setValue('http://spam.example')
  first.unmount()
  const w = await mountForm()
  for (const key of keys) expect((w.find(`#f-${key}`).element as HTMLInputElement).value).toBe(valid[key])
  expect((w.find('#f-hp').element as HTMLInputElement).value).toBe('')
})

it('a filled honeypot skips the send but shows success', async () => {
  const w = await mountForm()
  await fill(w, valid)
  await w.find('#f-hp').setValue('http://spam.example')
  await w.find('form').trigger('submit')
  await vi.waitFor(() => expect(w.find('#f-status').classes()).toContain('ok'), { timeout: 2000 })
  expect(sendMock).not.toHaveBeenCalled()
  for (const key of keys) expect((w.find(`#f-${key}`).element as HTMLInputElement).value).toBe('')
})
