import { expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import StackList from '../../app/components/StackList.vue'
import { projects } from '../../app/data/projects'

it('page variant renders dl.stack.stack--page', async () => {
  const w = await mountSuspended(StackList, { props: { stack: projects[0]!.stack, variant: 'page' } })
  expect(w.find('dl').classes()).toEqual(expect.arrayContaining(['stack', 'stack--page']))
})

it('home variant has no stack--page class', async () => {
  const w = await mountSuspended(StackList, { props: { stack: projects[0]!.stack } })
  expect(w.find('dl').classes()).toContain('stack')
  expect(w.find('dl').classes()).not.toContain('stack--page')
})
