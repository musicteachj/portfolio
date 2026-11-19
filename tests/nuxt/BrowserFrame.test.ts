import { expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import BrowserFrame from '../../app/components/BrowserFrame.vue'

it('renders a figure by default', async () => {
  const w = await mountSuspended(BrowserFrame, { props: { label: 'x' } })
  expect(w.element.tagName).toBe('FIGURE')
  expect(w.classes()).toContain('frame')
})

it('renders a div when asked', async () => {
  const w = await mountSuspended(BrowserFrame, { props: { label: 'x', as: 'div' } })
  expect(w.element.tagName).toBe('DIV')
  expect(w.classes()).toContain('frame')
})
