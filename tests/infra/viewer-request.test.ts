import { statSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { loadViewerRequest } from '../../scripts/lib/cloudfront-function.mjs'

type Query = Record<string, { value: string; multiValue?: { value: string }[] }>
type Result = {
  uri?: string
  statusCode?: number
  statusDescription?: string
  headers?: { location?: { value: string } }
}

const handler = loadViewerRequest() as (event: unknown) => Result

function run(uri: string, querystring: Query = {}): Result {
  return handler({ request: { method: 'GET', uri, querystring, headers: {} } })
}

describe('viewer-request rewrites', () => {
  it.each([
    ['/', '/index.html'],
    ['/projects', '/projects/index.html'],
    ['/contact', '/contact/index.html'],
    ['/projects/open-door', '/projects/open-door/index.html'],
    ['/nope', '/nope/index.html'],
  ])('rewrites %s to %s', (uri, expected) => {
    expect(run(uri).uri).toBe(expected)
  })

  it.each([
    '/index.html',
    '/resume.pdf',
    '/llms.txt',
    '/projects/folio.md',
    '/_nuxt/a1b2.js',
    '/_ipx/f_avif&s_324x203/images/projects/x.png',
  ])('leaves %s unchanged', (uri) => {
    expect(run(uri).uri).toBe(uri)
  })
})

describe('viewer-request redirects', () => {
  it.each([
    ['/projects/', '/projects'],
    ['/projects/open-door/', '/projects/open-door'],
    ['/projects//', '/projects'],
    ['/about', '/'],
    ['/experience', '/'],
    ['/home', '/'],
    ['/portfolio', '/'],
    ['/work', '/'],
    ['/about/', '/'],
    ['/projects/6', '/projects/resumeiq'],
    ['/projects/6/', '/projects/resumeiq'],
    ['/projects/7', '/projects/folio'],
    ['/projects/12', '/projects'],
    ['/projects/1', '/projects'],
    ['/projects/5/', '/projects'],
    ['/projects/99', '/projects'],
    ['/James_Littlefield_Senior_Full_Stack_Developer.pdf', '/resume.pdf'],
  ])('301s %s to %s', (uri, location) => {
    const res = run(uri)
    expect(res.statusCode).toBe(301)
    expect(res.statusDescription).toBe('Moved Permanently')
    expect(res.headers?.location?.value).toBe(location)
  })

  it.each([
    ['/projects/', { utm_source: { value: 'li' } }, '/projects?utm_source=li'],
    ['/about', { ref: { value: 'x' }, y: { value: '1' } }, '/?ref=x&y=1'],
    // Passed through untouched: never decoded or re-encoded.
    ['/about', { q: { value: 'a%26b' } }, '/?q=a%26b'],
    [
      '/projects/',
      { a: { value: '1', multiValue: [{ value: '1' }, { value: '2' }] } },
      '/projects?a=1&a=2',
    ],
  ] as [string, Query, string][])('keeps the query on %s', (uri, query, location) => {
    expect(run(uri, query).headers?.location?.value).toBe(location)
  })
})

describe('viewer-request open redirect guard', () => {
  it.each(['//evil.com/', '///evil.com/', '/\\evil.com/', '//\\evil.com/', '/\\/evil.com/'])(
    'never emits a protocol-relative Location for %s',
    (uri) => {
      const res = run(uri)
      expect(res.statusCode).toBe(301)
      const location = res.headers?.location?.value ?? ''
      expect(location.startsWith('/')).toBe(true)
      expect(location.startsWith('//')).toBe(false)
      expect(location.startsWith('/\\')).toBe(false)
    },
  )

  it.each([
    '/\t/evil.com/',
    '/\n/evil.com/',
    '/\r/evil.com/',
    '/\t\t/evil.com/',
    '/\t\\evil.com/',
    '\t//evil.com/',
    '/\r\n/evil.com/',
  ])('strips tab, newline and carriage return before collapsing for %j', (uri) => {
    const res = run(uri)
    expect(res.statusCode).toBe(301)
    const location = res.headers?.location?.value ?? ''
    expect(location).not.toMatch(/[\t\n\r]/)
    expect(location).toMatch(/^\/[^/\\]/)
  })

  it('collapses leading slashes without redirecting when there is no trailing slash', () => {
    expect(run('///evil.com').uri).toBe('/evil.com')
  })

  it('treats //about like /about', () => {
    const res = run('//about')
    expect(res.statusCode).toBe(301)
    expect(res.headers?.location?.value).toBe('/')
  })
})

describe('viewer-request size', () => {
  it('stays under the 10 KB CloudFront Functions limit', () => {
    expect(statSync('infra/cloudfront/viewer-request.js').size).toBeLessThan(10240)
  })
})
