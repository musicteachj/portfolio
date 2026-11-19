import { expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { createError } from '#app'
import ErrorPage from '../../app/error.vue'

const render = (status: number) => mountSuspended(ErrorPage, { props: { error: createError({ status }) } })

const actions = (w: Awaited<ReturnType<typeof render>>) =>
  w.findAll('.error-page .actions a.btn').map((a) => [a.text(), a.attributes('href')])

it('shows the not found copy for a 404', async () => {
  const w = await render(404)
  expect(w.find('h1').text()).toBe('Page not found')
  expect(w.find('.error-page p').text()).toBe("That page doesn't exist or has moved.")
  expect(actions(w)).toEqual([
    ['Go to the home page', '/'],
    ['See the projects', '/projects'],
  ])
})

it('shows the generic copy for any other status', async () => {
  const w = await render(500)
  expect(w.find('h1').text()).toBe('Something went wrong')
  expect(w.find('.error-page p').text()).toBe('Try the home page, or reload in a moment.')
  expect(actions(w)).toEqual([
    ['Go to the home page', '/'],
    ['See the projects', '/projects'],
  ])
})

it('has the route announcer, since it renders instead of app.vue', async () => {
  const w = await render(404)
  expect(w.find('.nuxt-route-announcer [aria-live="polite"]').exists()).toBe(true)
})
