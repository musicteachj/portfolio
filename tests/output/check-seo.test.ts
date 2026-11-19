import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { site } from '../../app/data/site'
import { ALIASES, EMAIL_ALLOWED, EMAIL_NEEDLE, INDEXABLE, PERSON, SITE, checkSeo, checks, memoryOutput, readOutput } from '../../scripts/check-seo'

const LONG = 'Real page content about a project. '.repeat(10)

function pageHtml(rel: string, over: { title?: string; desc?: string; canonical?: string; robots?: string; body?: string } = {}): string {
  const url = rel === 'index.html' ? `${SITE}/` : `${SITE}/${rel.replace('/index.html', '')}`
  const desc = over.desc ?? `Description for ${rel}`
  return `<!doctype html><html><head>
<title>${over.title ?? `Title ${rel}`}</title>
<meta property="og:title" content="${over.title ?? `Title ${rel}`}"><meta property="og:url" content="${url}">
<meta name="description" content="${desc}"><meta property="og:description" content="${desc}">
<link rel="canonical" href="${over.canonical ?? url}">
${over.robots ? `<meta name="robots" content="${over.robots}">` : ''}
</head><body><main><h1>Heading</h1><p>${LONG}</p>${over.body ?? ''}</main></body></html>`
}

const IMAGE_URL = `${SITE}/_ipx/s_512x522/images/james.jpg`
const IMAGE_FILE = '_ipx/s_512x522/images/james.jpg'

function addCrawlerFiles(files: Record<string, string>): void {
  const urls = INDEXABLE.map((r) => (r === 'index.html' ? `${SITE}/` : `${SITE}/${r.replace('/index.html', '')}`))
  const mds = INDEXABLE.map((r) => (r === 'index.html' ? `${SITE}/index.md` : `${SITE}/${r.replace('/index.html', '')}.md`))
  files['sitemap.xml'] = `<urlset>${urls.map((u, i) => `<url><loc>${u}</loc>${i === 0 ? `<image:image><image:loc>${IMAGE_URL}</image:loc></image:image>` : ''}</url>`).join('')}</urlset>`
  files[IMAGE_FILE] = 'img'
  files['robots.txt'] = [
    'User-agent: *', 'Disallow: ', '',
    'User-agent: GPTBot', 'User-agent: ClaudeBot', 'User-agent: PerplexityBot', 'Allow: /', '',
    `Sitemap: ${SITE}/sitemap.xml`,
  ].join('\n')
  files['llms.txt'] = `# Site\n\n## Pages\n\n${mds.map((m) => `- [Page](${m}): text`).join('\n')}\n`
  files['llms-full.txt'] = `# Site\n\n${urls.map((u) => `- **Page:** Page\n- **Source:** ${u}\n`).join('\n')}`
  files['resume.pdf'] = `%PDF ${EMAIL_NEEDLE}example.com`
  files['_nuxt/entry.js'] = 'const a = "mailto:" + b'
}

function fixture(over: Record<string, Parameters<typeof pageHtml>[1]> = {}): Record<string, string> {
  const files: Record<string, string> = {}
  for (const rel of INDEXABLE) files[rel] = pageHtml(rel, over[rel])
  for (const rel of ALIASES) {
    files[rel] = pageHtml('index.html', { title: 'Title index.html', desc: 'Description for index.html', ...over[rel] })
  }
  addGraphs(files)
  addCrawlerFiles(files)
  files['404.html'] = '<html><head><meta name="robots" content="noindex"></head><body><h1>Not found</h1></body></html>'
  return files
}

const personNode = (over: Record<string, unknown> = {}) => ({
  '@type': 'Person',
  '@id': `${SITE}/#identity`,
  name: 'James Littlefield',
  jobTitle: 'AI Engineer',
  url: `${SITE}/`,
  image: `${SITE}/images/james.jpg`,
  sameAs: [PERSON.githubUrl, PERSON.linkedinUrl],
  ...over,
})

function ld(nodes: unknown[]): string {
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes })}</script>`
}

function addGraphs(files: Record<string, string>): Record<string, string> {
  for (const rel of [...INDEXABLE, ...ALIASES]) {
    const nodes: unknown[] = [{ '@type': 'WebSite', '@id': `${SITE}/#website`, name: 'James Littlefield' }, personNode()]
    if (INDEXABLE.includes(rel) && rel !== 'index.html') {
      const url = `${SITE}/${rel.replace('/index.html', '')}`
      nodes.push(
        { '@type': 'CreativeWork', name: 'Heading', image: `${SITE}/a.jpg`, author: { '@id': `${SITE}/#identity` } },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'James Littlefield', item: `${SITE}/` },
            { '@type': 'ListItem', position: 2, name: 'Heading', item: url },
          ],
        },
      )
    }
    files[rel] = files[rel]!.replace('</head>', `${ld(nodes)}</head>`)
  }
  return files
}

async function problemsFor(name: string, files: Record<string, string>): Promise<string[]> {
  const check = checks.find((c) => c.name === name)!
  return check.run(memoryOutput(files))
}

it('the built site passes check-seo', async () => {
  expect(await checkSeo(readOutput('.output/public'))).toEqual([])
})

describe('check-seo fixtures', () => {
  it('titles reports a duplicate title', async () => {
    const files = fixture({ 'projects/folio/index.html': { title: 'Title index.html' } })
    expect((await problemsFor('titles', files)).join('\n')).toContain('projects/folio/index.html')
  })

  it('titles reports an alias with a different title', async () => {
    const files = fixture({ 'contact/index.html': { title: 'Other' } })
    expect((await problemsFor('titles', files)).join('\n')).toContain('contact/index.html')
  })

  it('descriptions reports a missing description', async () => {
    const files = fixture()
    files['projects/folio/index.html'] = files['projects/folio/index.html']!.replace(/<meta name="description"[^>]*>/, '')
    expect((await problemsFor('descriptions', files)).join('\n')).toContain('projects/folio/index.html')
  })

  it('descriptions reports a duplicate description', async () => {
    const files = fixture({ 'projects/folio/index.html': { desc: 'Description for index.html' } })
    expect((await problemsFor('descriptions', files)).join('\n')).toContain('duplicates')
  })

  it('canonicals reports an og:title or og:url that disagrees with the page, or is duplicated', async () => {
    const files = fixture()
    files['projects/folio/index.html'] = files['projects/folio/index.html']!.replace('<meta property="og:title" content="Title projects/folio/index.html">', '<meta property="og:title" content="Other">')
    files['contact/index.html'] = files['contact/index.html']!.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${SITE}/contact">`)
    files['index.html'] = files['index.html']!.replace('</head>', '<meta property="og:title" content="Title index.html"></head>')
    const text = (await problemsFor('canonicals', files)).join('\n')
    expect(text).toContain('projects/folio/index.html: expected exactly one og:title')
    expect(text).toContain(`contact/index.html: expected exactly one og:url equal to ${SITE}/`)
    expect(text).toContain('index.html: expected exactly one og:title')
  })

  it('canonicals reports a wrong canonical', async () => {
    const files = fixture({ 'projects/folio/index.html': { canonical: `${SITE}/` } })
    expect((await problemsFor('canonicals', files)).join('\n')).toContain('projects/folio/index.html')
  })

  it('canonicals reports an alias that does not point home', async () => {
    const files = fixture({ 'projects/index.html': { canonical: `${SITE}/projects` } })
    expect((await problemsFor('canonicals', files)).join('\n')).toContain('projects/index.html')
  })

  it('robots-meta reports noindex on an indexable page', async () => {
    const files = fixture({ 'index.html': { robots: 'noindex, nofollow' } })
    expect((await problemsFor('robots-meta', files)).join('\n')).toContain('index.html')
  })

  it('robots-meta reports a 404 page without noindex', async () => {
    const files = fixture()
    files['404.html'] = '<html><head></head><body><h1>Not found</h1></body></html>'
    expect((await problemsFor('robots-meta', files)).join('\n')).toContain('404.html')
  })

  it('body-text reports thin content and a second h1', async () => {
    const files = fixture()
    files['projects/folio/index.html'] = '<html><body><main><h1>A</h1><h1>B</h1><p>short</p></main></body></html>'
    const text = (await problemsFor('body-text', files)).join('\n')
    expect(text).toContain('exactly one <h1>')
    expect(text).toContain('at least 200')
  })

  it('images reports a missing alt and a missing size', async () => {
    const files = fixture({ 'index.html': { body: '<img src="/a.png" width="10">' } })
    const text = (await problemsFor('images', files)).join('\n')
    expect(text).toContain('no alt')
    expect(text).toContain('numeric height')
  })

  it('copy-rules reports an em dash and a British spelling', async () => {
    const files = fixture({ 'index.html': { body: '<p>one \u2014 two</p><p>colour</p>' } })
    const text = (await problemsFor('copy-rules', files)).join('\n')
    expect(text).toContain('\u2014')
    expect(text).toContain('British')
  })

  describe('share images', () => {
    async function png(width: number, height: number, noisy = false): Promise<Buffer> {
      const raw = Buffer.alloc(width * height * 3, 255)
      if (noisy) for (let i = 0; i < raw.length; i++) raw[i] = (i * 37 + (i >> 5) * 91) % 256
      return sharp(raw, { raw: { width, height, channels: 3 } }).png().toBuffer()
    }

    function metaHead(img: string, extra = ''): string {
      return `<meta property="og:image" content="${img}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image">${extra}`
    }

    async function shareFixture(): Promise<Record<string, string | Uint8Array>> {
      const files: Record<string, string | Uint8Array> = fixture()
      const good = await png(1200, 630, true)
      for (const [i, rel] of INDEXABLE.entries()) {
        files[`_og/s/o_${i}.png`] = good
        files[rel] = String(files[rel]).replace('</head>', `${metaHead(`${SITE}/_og/s/o_${i}.png`)}</head>`)
      }
      for (const rel of ALIASES) {
        files[rel] = String(files[rel]).replace('</head>', `${metaHead(`${SITE}/_og/s/o_0.png`)}</head>`)
      }
      return files
    }

    async function run(name: string, files: Record<string, string | Uint8Array>): Promise<string> {
      return (await checks.find((c) => c.name === name)!.run(memoryOutput(files as Record<string, string>))).join('\n')
    }

    it('accepts a clean fixture', async () => {
      const files = await shareFixture()
      expect(await checkSeo(memoryOutput(files as Record<string, string>))).toEqual([])
    })

    it('og-images reports a missing og:image and a wrong size', async () => {
      const files = await shareFixture()
      files['projects/folio/index.html'] = String(files['projects/folio/index.html']).replace(/<meta property="og:image"[^>]*>/, '')
      files['_og/s/o_1.png'] = await png(1200, 600)
      const text = await run('og-images', files)
      expect(text).toContain('projects/folio/index.html: expected exactly one og:image')
      expect(text).toContain('1200x600')
    })

    it('og-images reports a shared file and an alias that differs from Home', async () => {
      const files = await shareFixture()
      files['projects/folio/index.html'] = String(files['projects/folio/index.html']).replace('o_3.png', 'o_1.png')
      files['contact/index.html'] = String(files['contact/index.html']).replace('o_0.png', 'o_2.png')
      const text = await run('og-images', files)
      expect(text).toContain('is shared with')
      expect(text).toContain('contact/index.html: og:image differs from index.html')
    })

    it('og-screenshot skips an undersized share image and survives a bad one, still reporting other problems', async () => {
      const files = await shareFixture()
      files['_og/s/o_1.png'] = await png(100, 50)
      files['_og/s/o_3.png'] = Buffer.from('not a png at all')
      files['_og/s/o_2.png'] = await png(1200, 630)
      const text = await run('og-screenshot', files)
      expect(text).not.toContain('projects/open-door/index.html')
      expect(text).toContain('projects/packwright/index.html')
      const all = await checkSeo(memoryOutput(files as Record<string, string>))
      expect(all.join('\n')).toContain('100x50')
    })

    it('og-screenshot reports a flat card with no screenshot', async () => {
      const files = await shareFixture()
      files['_og/s/o_2.png'] = await png(1200, 630)
      const text = await run('og-screenshot', files)
      expect(text).toContain('projects/packwright/index.html')
      expect(text).not.toContain('projects/folio/index.html')
    })

    it('twitter-card reports a missing or wrong card on a page and an alias', async () => {
      const files = await shareFixture()
      files['projects/folio/index.html'] = String(files['projects/folio/index.html']).replace('summary_large_image', 'summary')
      files['contact/index.html'] = String(files['contact/index.html']).replace(/<meta name="twitter:card"[^>]*>/, '')
      const text = await run('twitter-card', files)
      expect(text).toContain('projects/folio/index.html')
      expect(text).toContain('contact/index.html')
    })
  })

  describe('structured data', () => {
    const graphFixture = fixture
    const run = async (name: string, files: Record<string, string>) => (await problemsFor(name, files)).join('\n')

    it('accepts a clean graph', async () => {
      const files = graphFixture()
      expect(await run('json-ld', files)).toBe('')
      expect(await run('case-study-schema', files)).toBe('')
    })

    it('json-ld reports invalid JSON', async () => {
      const files = graphFixture()
      files['index.html'] = files['index.html']!.replace('</head>', '<script type="application/ld+json">{nope</script></head>')
      expect(await run('json-ld', files)).toContain('index.html: a JSON-LD script is not valid JSON')
    })

    it('json-ld reports an email key anywhere in a graph', async () => {
      const files = graphFixture()
      files['index.html'] = files['index.html']!.replace('</head>', `${ld([{ '@type': 'Thing', nested: [{ email: 'a@b.c' }] }])}</head>`)
      expect(await run('json-ld', files)).toContain('index.html: JSON-LD contains an email key')
    })

    it('json-ld reports a missing Person and a wrong Person field', async () => {
      const files = graphFixture()
      files['index.html'] = files['index.html']!.replace('"jobTitle":"AI Engineer"', '"jobTitle":"Dev"')
      files['projects/folio/index.html'] = files['projects/folio/index.html']!.replace('"Person"', '"Thing"')
      const text = await run('json-ld', files)
      expect(text).toContain('index.html: Person jobTitle')
      expect(text).toContain('projects/folio/index.html: expected one Person')
    })

    it('case-study-schema reports a wrong author, a missing CreativeWork and a bad breadcrumb', async () => {
      const files = graphFixture()
      files['projects/folio/index.html'] = files['projects/folio/index.html']!.replace('"author":{"@id":"https://jameslittlefield.net/#identity"}', '"author":{"@id":"x"}')
      files['projects/packwright/index.html'] = files['projects/packwright/index.html']!.replace('"CreativeWork"', '"Thing"')
      files['projects/resumeiq/index.html'] = files['projects/resumeiq/index.html']!.replace('"position":2', '"position":3').replace('"BreadcrumbList"', '"Thing"')
      const text = await run('case-study-schema', files)
      expect(text).toContain('projects/folio/index.html: CreativeWork author')
      expect(text).toContain('projects/packwright/index.html: expected one CreativeWork')
      expect(text).toContain('projects/resumeiq/index.html: expected one BreadcrumbList')
    })

    it('case-study-schema reports a CreativeWork and breadcrumb name that match each other but not the h1', async () => {
      const files = graphFixture()
      files['projects/folio/index.html'] = files['projects/folio/index.html']!.replaceAll('"name":"Heading"', '"name":"Wrong"')
      const text = await run('case-study-schema', files)
      expect(text).toContain('projects/folio/index.html: CreativeWork name is "Wrong"')
      expect(text).toContain('projects/folio/index.html: BreadcrumbList must be')
    })

    it('case-study-schema reports a relative CreativeWork image', async () => {
      const files = graphFixture()
      files['projects/folio/index.html'] = files['projects/folio/index.html']!.replace('"image":"https://jameslittlefield.net/a.jpg"', '"image":"/a.jpg"')
      expect(await run('case-study-schema', files)).toContain('projects/folio/index.html: CreativeWork image')
    })

    it('case-study-schema reports a breadcrumb with the wrong second item', async () => {
      const files = graphFixture()
      files['projects/folio/index.html'] = files['projects/folio/index.html']!.replace('"item":"https://jameslittlefield.net/projects/folio"', '"item":"https://jameslittlefield.net/projects"')
      expect(await run('case-study-schema', files)).toContain('projects/folio/index.html: BreadcrumbList must be')
    })

    it('the check constants equal the site data', () => {
      expect(PERSON.name).toBe(site.name)
      expect(PERSON.jobTitle).toBe(site.role)
      expect(PERSON.githubUrl).toBe(site.githubUrl)
      expect(PERSON.linkedinUrl).toBe(site.linkedinUrl)
    })

    it('the email needle equals the site data', () => {
      expect(typeof site.emailUser).toBe('string')
      expect(site.emailUser.length).toBeGreaterThan(0)
      expect(EMAIL_NEEDLE).toBe(`${site.emailUser}@`)
    })
  })

  describe('crawler files and privacy', () => {
    const run = problemsFor
    const imageUrl = IMAGE_URL
    const crawlFixture = fixture

    it('the crawler fixture is clean', async () => {
      for (const name of ['sitemap', 'robots-txt', 'llms', 'email-address']) expect(await run(name, crawlFixture())).toEqual([])
    })

    it('sitemap reports an alias URL, a missing page and an image with no file', async () => {
      const files = crawlFixture()
      files['sitemap.xml'] = files['sitemap.xml']!.replace('</urlset>', `<url><loc>${SITE}/projects</loc></url></urlset>`).replace(`<loc>${SITE}/projects/folio</loc>`, '').replace(imageUrl, `${SITE}/_ipx/nope.jpg`)
      const text = (await run('sitemap', files)).join('\n')
      expect(text).toContain('<loc> URLs are')
      expect(text).toContain('has no output file _ipx/nope.jpg')
    })

    it('sitemap reports a missing file', async () => {
      const files = crawlFixture()
      delete files['sitemap.xml']
      expect(await run('sitemap', files)).toContain('sitemap.xml: file is missing')
    })

    it('robots-txt reports a missing agent group, a blocked agent and a missing Sitemap line', async () => {
      const files = crawlFixture()
      files['robots.txt'] = ['User-agent: *', 'Disallow: ', '', 'User-agent: GPTBot', 'Disallow: /', '', 'User-agent: PerplexityBot', 'Allow: /'].join('\n')
      const text = (await run('robots-txt', files)).join('\n')
      expect(text).toContain('GPTBot is disallowed')
      expect(text).toContain('no group names ClaudeBot')
      expect(text).toContain('missing "Sitemap:')
    })

    it('robots-txt reports a blocked * group', async () => {
      const files = crawlFixture()
      files['robots.txt'] = files['robots.txt']!.replace('User-agent: *\nDisallow: ', 'User-agent: *\nDisallow: /')
      expect((await run('robots-txt', files)).join('\n')).toContain('the * group')
    })

    it('llms reports alias pages, alias Markdown files, a section in llms-full and a dangling alternate', async () => {
      const files = crawlFixture()
      files['llms.txt'] += `- [Page](${SITE}/projects.md): text\n`
      files['projects.md'] = 'x'
      files['llms-full.txt'] += `\n- **Source:** ${SITE}/contact\n`
      files['index.html'] = files['index.html']!.replace('</head>', '<link rel="alternate" type="text/markdown" href="/gone.md"></head>')
      const text = (await run('llms', files)).join('\n')
      expect(text).toContain('llms.txt: lists')
      expect(text).toContain('projects.md: must not exist')
      expect(text).toContain('llms-full.txt: contains a section for /contact')
      expect(text).toContain('index.html: Markdown alternate /gone.md has no output file')
    })

    it('llms reports an indexable page missing from llms-full when the Source format changes', async () => {
      const files = crawlFixture()
      files['llms-full.txt'] = files['llms-full.txt']!.replaceAll('**Source:**', '**Origin:**')
      const text = (await run('llms', files)).join('\n')
      expect(text).toContain(`llms-full.txt: no "**Source:** ${SITE}/projects/folio" line`)
    })

    it('llms accepts an alternate that points to an existing file', async () => {
      const files = crawlFixture()
      files['index.md'] = 'x'
      files['index.html'] = files['index.html']!.replace('</head>', '<link rel="alternate" type="text/markdown" href="/index.md"></head>')
      expect(await run('llms', files)).toEqual([])
    })

    it('email-address reports the address in a non-allowed file and a missing allowed file', async () => {
      const files = crawlFixture()
      files['_nuxt/entry.js'] = `x ${EMAIL_NEEDLE}example.com`
      for (const rel of EMAIL_ALLOWED) Reflect.deleteProperty(files, rel)
      const text = (await run('email-address', files)).join('\n')
      expect(text).toContain('_nuxt/entry.js: contains the email address')
      expect(text).toContain('resume.pdf: allowed to contain the address but missing')
    })

    it.each(['index.html', 'index.md', 'llms.txt', 'data.json', 'sitemap.xml'])('email-address reports mailto: in %s', async (rel) => {
      const files = crawlFixture()
      files[rel] = `${files[rel] ?? ''} <a href="mailto:x@y.z">`
      expect(await run('email-address', files)).toContain(`${rel}: contains mailto:`)
    })

    it('email-address allows mailto: in a js file', async () => {
      expect(await run('email-address', crawlFixture())).toEqual([])
    })
  })
})
