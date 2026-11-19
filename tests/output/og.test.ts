import { describe, expect, test } from 'vitest'
import { exists, html, pngSize } from './helpers'

describe.each(['index.html', 'projects/index.html', 'contact/index.html'])('%s', (page) => {
  test('has one prerendered 1200x630 og:image', () => {
    const metas = html(page).querySelectorAll('meta[property="og:image"]')
    expect(metas).toHaveLength(1)
    const url = metas[0]!.getAttribute('content')!
    expect(url.startsWith('https://jameslittlefield.net/')).toBe(true)
    const rel = decodeURIComponent(new URL(url).pathname.slice(1))
    expect(rel.endsWith('.png')).toBe(true)
    expect(exists(rel)).toBe(true)
    expect(pngSize(rel)).toEqual({ width: 1200, height: 630 })
  })
})
