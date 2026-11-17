import { defineComponent } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { expect, it } from 'vitest'

it('mounts a component in the Nuxt environment', async () => {
  const wrapper = await mountSuspended(defineComponent({ template: '<p>ok</p>' }))
  expect(wrapper.text()).toBe('ok')
})
