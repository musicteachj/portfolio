import { expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ProofLinks from '../../app/components/ProofLinks.vue'
import { projects } from '../../app/data/projects'
import { proofItems } from '../../app/utils/proof'

it('disabled items are role=link aria-disabled and unfocusable', async () => {
  const p = projects[0]!
  const allOff = {
    ...p,
    links: { code: { ...p.links.code, enabled: false }, demo: { enabled: false }, video: { enabled: false } },
  }
  const w = await mountSuspended(ProofLinks, {
    props: { items: proofItems(allOff, 'home'), label: 'Open Door links' },
  })
  const off = w.findAll('[aria-disabled="true"]')
  expect(off).toHaveLength(3)
  for (const s of off) {
    expect(s.element.tagName).toBe('SPAN')
    expect(s.attributes('role')).toBe('link')
    expect(s.attributes('tabindex')).toBeUndefined()
    expect(s.attributes('href')).toBeUndefined()
  }
  expect(w.findAll('a')).toHaveLength(1)
  expect(w.find('a').attributes('href')).toBe('/projects/open-door')
  expect(w.text()).toContain('Live demo')
  expect(w.text()).toContain('view')
})

it('enabled external items render plain anchors', async () => {
  const w = await mountSuspended(ProofLinks, {
    props: {
      items: [
        { key: 'code', label: 'Code', sub: 'GitHub', href: 'https://github.com/musicteachj/open-door' },
      ],
      label: 'Open Door links',
    },
  })
  const a = w.find('a')
  expect(a.attributes('href')).toBe('https://github.com/musicteachj/open-door')
  expect(w.find('ul').attributes('aria-label')).toBe('Open Door links')
})

it('page variant uses the 3-column proof grid and omits case study', async () => {
  const w = await mountSuspended(ProofLinks, {
    props: { items: proofItems(projects[0]!, 'page'), label: 'Open Door links', variant: 'page', projectName: 'Open Door' },
  })
  expect(w.find('ul').classes()).toContain('proof--3')
  expect(w.findAll('li')).toHaveLength(3)
  expect(w.text()).not.toContain('Case study')
})

it('home variant has no proof--3 class', async () => {
  const w = await mountSuspended(ProofLinks, {
    props: { items: proofItems(projects[0]!, 'home'), label: 'Open Door links' },
  })
  expect(w.find('ul').classes()).not.toContain('proof--3')
})

it('case study link has a hidden project name', async () => {
  const w = await mountSuspended(ProofLinks, {
    props: { items: proofItems(projects[0]!, 'home'), label: 'Open Door links', projectName: 'Open Door' },
  })
  const a = w.find('a')
  expect(a.find('.sr-only').text()).toBe('Open Door')
  // The space sits outside the hidden name, so the link reads "Open Door Case study".
  expect(a.element.textContent).toMatch(/^Open Door Case study/)
  expect(a.text()).toContain('Case study')
  expect(a.text()).toContain('read')
  expect(a.attributes('aria-label')).toBeUndefined()
})
