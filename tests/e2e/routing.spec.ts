import { expect, test } from '@playwright/test'

// The local server runs the same CloudFront viewer-request function as production.

test('trailing slash redirects to the clean URL', async ({ request }) => {
  const res = await request.get('/projects/', { maxRedirects: 0 })
  expect(res.status()).toBe(301)
  expect(res.headers().location).toBe('/projects')
})

test('legacy project id redirects to its slug', async ({ request }) => {
  const res = await request.get('/projects/6/', { maxRedirects: 0 })
  expect(res.status()).toBe(301)
  expect(res.headers().location).toBe('/projects/resumeiq')
})

test('legacy route redirect keeps the query string', async ({ request }) => {
  const res = await request.get('/about?ref=x', { maxRedirects: 0 })
  expect(res.status()).toBe(301)
  expect(res.headers().location).toBe('/?ref=x')
})

test('clean case study URL serves the page', async ({ request }) => {
  const res = await request.get('/projects/open-door', { maxRedirects: 0 })
  expect(res.status()).toBe(200)
  expect(await res.text()).toMatch(/<h1[^>]*>[^<]*Open Door/i)
})

test('unknown path serves the 404 page with status 404', async ({ request }) => {
  const res = await request.get('/nope', { maxRedirects: 0 })
  expect(res.status()).toBe(404)
  expect(res.headers()['content-type']).toContain('text/html')
})

test('encoded traversal does not serve files outside the root', async ({ request }) => {
  const res = await request.get('/..%2fpackage.json', { maxRedirects: 0 })
  expect(res.status()).toBe(404)
  const body = await res.text()
  expect(body).toContain('Page not found')
  expect(body).not.toContain('"scripts"')
})

test('leading double slash never redirects to another host', async ({ request, baseURL }) => {
  // An absolute local URL keeps the double slash; a bare '//evil.com/' would be
  // resolved against baseURL as a protocol-relative URL to the real evil.com.
  const origin = new URL(baseURL ?? '').origin
  expect(new URL(origin).hostname).toBe('localhost')
  const res = await request.get(`${origin}//evil.com/`, { maxRedirects: 0 })
  expect(res.status()).toBe(301)
  expect(res.headers().location).toBe('/evil.com')
})
