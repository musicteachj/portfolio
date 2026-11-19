// SEO gate for the generated site. Reads .output/public and reports problems.
// Runs directly under Node 24 (type stripping): erasable TypeScript only, node
// builtins, node-html-parser and sharp only, no app imports.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'node-html-parser'
import sharp from 'sharp'
import type { HTMLElement } from 'node-html-parser'

export interface OutputReader {
  list(): string[]
  read(rel: string): Buffer
  exists(rel: string): boolean
}

export interface Check {
  name: string
  run(out: OutputReader): string[] | Promise<string[]>
}

export const SITE = 'https://jameslittlefield.net'

export const INDEXABLE = [
  'index.html',
  'projects/open-door/index.html',
  'projects/packwright/index.html',
  'projects/folio/index.html',
  'projects/resumeiq/index.html',
]

export const ALIASES = ['projects/index.html', 'contact/index.html']

export function readOutput(dir: string): OutputReader {
  return {
    list: () => (existsSync(dir) ? readdirSync(dir, { recursive: true }).map((f) => String(f).split('\\').join('/')) : []),
    read: (rel) => readFileSync(join(dir, rel)),
    exists: (rel) => existsSync(join(dir, rel)),
  }
}

export function memoryOutput(files: Record<string, string | Uint8Array>): OutputReader {
  return {
    list: () => Object.keys(files),
    read: (rel) => {
      const f = files[rel]
      if (f === undefined) throw new Error(`memoryOutput: no file ${rel}`)
      return Buffer.from(f)
    },
    exists: (rel) => rel in files,
  }
}

function urlFor(rel: string): string {
  if (rel === 'index.html') return `${SITE}/`
  return `${SITE}/${rel.replace(/\/index\.html$/, '')}`
}

// Each page is parsed once per output and shared by every check, so no check may change
// a tree it gets from here (visibleText works on a copy).
const parsed = new WeakMap<OutputReader, Map<string, HTMLElement>>()

function page(out: OutputReader, rel: string): HTMLElement {
  let pages = parsed.get(out)
  if (!pages) parsed.set(out, (pages = new Map()))
  let root = pages.get(rel)
  if (!root) pages.set(rel, (root = parse(out.read(rel).toString('utf8'))))
  return root
}

// Pages that exist; a missing page is reported once by the titles check.
function present(out: OutputReader, rels: string[]): string[] {
  return rels.filter((r) => out.exists(r))
}

function missing(out: OutputReader, rels: string[]): string[] {
  return rels.filter((r) => !out.exists(r)).map((r) => `${r}: file is missing`)
}

function visibleText(root: HTMLElement): string {
  const copy = parse(root.toString())
  for (const el of copy.querySelectorAll('script, style, noscript, template')) el.remove()
  return copy.text
}

function metaContents(root: HTMLElement, selector: string): string[] {
  return root.querySelectorAll(selector).map((m) => (m.getAttribute('content') ?? '').trim())
}

const titles: Check = {
  name: 'titles',
  run(out) {
    const problems = missing(out, [...INDEXABLE, ...ALIASES])
    const seen = new Map<string, string>()
    for (const rel of present(out, INDEXABLE)) {
      const found = page(out, rel).querySelectorAll('title')
      const text = found[0]?.text.trim() ?? ''
      if (found.length !== 1 || !text) {
        problems.push(`${rel}: expected exactly one non-empty <title>, found ${found.length}`)
        continue
      }
      const other = seen.get(text)
      if (other) problems.push(`${rel}: <title> duplicates ${other}`)
      else seen.set(text, rel)
    }
    const home = out.exists('index.html') ? (page(out, 'index.html').querySelector('title')?.text.trim() ?? '') : ''
    for (const rel of present(out, ALIASES)) {
      const t = page(out, rel).querySelector('title')?.text.trim() ?? ''
      if (t !== home) problems.push(`${rel}: <title> "${t}" differs from index.html "${home}"`)
    }
    return problems
  },
}

const descriptions: Check = {
  name: 'descriptions',
  run(out) {
    const problems: string[] = []
    const seen = new Map<string, string>()
    for (const rel of present(out, INDEXABLE)) {
      const root = page(out, rel)
      const desc = metaContents(root, 'meta[name=description]')
      const og = metaContents(root, 'meta[property="og:description"]')
      if (desc.length !== 1 || !desc[0]) {
        problems.push(`${rel}: expected exactly one non-empty meta description, found ${desc.length}`)
        continue
      }
      if (og.length !== 1 || og[0] !== desc[0]) {
        problems.push(`${rel}: og:description is missing or does not match the meta description`)
      }
      const other = seen.get(desc[0])
      if (other) problems.push(`${rel}: description duplicates ${other}`)
      else seen.set(desc[0], rel)
    }
    const home = out.exists('index.html') ? metaContents(page(out, 'index.html'), 'meta[name=description]')[0] : undefined
    for (const rel of present(out, ALIASES)) {
      const d = metaContents(page(out, rel), 'meta[name=description]')[0]
      if (!d || d !== home) problems.push(`${rel}: description does not match index.html`)
    }
    return problems
  },
}

const canonicals: Check = {
  name: 'canonicals',
  run(out) {
    const problems: string[] = []
    const want = (rel: string) => (ALIASES.includes(rel) ? `${SITE}/` : urlFor(rel))
    for (const rel of present(out, [...INDEXABLE, ...ALIASES])) {
      const links = page(out, rel).querySelectorAll('link[rel=canonical]')
      const href = links[0]?.getAttribute('href')
      if (links.length !== 1) problems.push(`${rel}: expected exactly one canonical, found ${links.length}`)
      else if (href !== want(rel)) problems.push(`${rel}: canonical is ${href}, expected ${want(rel)}`)
      // The Open Graph title and URL must agree with the page's own <title> and canonical.
      const root = page(out, rel)
      const title = root.querySelector('title')?.text.trim() ?? ''
      const ogTitle = metaContents(root, 'meta[property="og:title"]')
      if (ogTitle.length !== 1 || ogTitle[0] !== title) {
        problems.push(`${rel}: expected exactly one og:title equal to the <title> "${title}", found ${ogTitle.length ? JSON.stringify(ogTitle) : 'none'}`)
      }
      const ogUrl = metaContents(root, 'meta[property="og:url"]')
      if (ogUrl.length !== 1 || ogUrl[0] !== want(rel)) {
        problems.push(`${rel}: expected exactly one og:url equal to ${want(rel)}, found ${ogUrl.length ? JSON.stringify(ogUrl) : 'none'}`)
      }
    }
    return problems
  },
}

const robotsMeta: Check = {
  name: 'robots-meta',
  run(out) {
    const problems: string[] = []
    for (const rel of present(out, [...INDEXABLE, ...ALIASES])) {
      const content = metaContents(page(out, rel), 'meta[name=robots]').join(',').toLowerCase()
      if (content.includes('noindex')) problems.push(`${rel}: robots meta contains noindex`)
    }
    if (!out.exists('404.html')) {
      problems.push('404.html: file is missing')
    } else {
      const root = page(out, '404.html')
      if (!root.querySelector('h1')?.text.trim()) problems.push('404.html: missing an <h1> with text')
      const content = metaContents(root, 'meta[name=robots]').join(',').toLowerCase()
      if (!content.includes('noindex')) problems.push('404.html: robots meta must contain noindex')
    }
    return problems
  },
}

const bodyText: Check = {
  name: 'body-text',
  run(out) {
    const problems: string[] = []
    for (const rel of present(out, INDEXABLE)) {
      const root = page(out, rel)
      const h1s = root.querySelectorAll('h1').length
      if (h1s !== 1) problems.push(`${rel}: expected exactly one <h1>, found ${h1s}`)
      const main = root.querySelector('main')
      const len = main ? visibleText(main).replace(/\s+/g, ' ').trim().length : 0
      if (len < 200) problems.push(`${rel}: <main> has ${len} characters of text, expected at least 200`)
    }
    return problems
  },
}

const images: Check = {
  name: 'images',
  run(out) {
    const problems: string[] = []
    for (const rel of present(out, INDEXABLE)) {
      page(out, rel)
        .querySelectorAll('img')
        .forEach((img, i) => {
          const src = img.getAttribute('src') ?? `img #${i + 1}`
          if (img.getAttribute('alt') === undefined) problems.push(`${rel}: <img> ${src} has no alt attribute`)
          for (const attr of ['width', 'height']) {
            if (!/^\d+$/.test(img.getAttribute(attr) ?? '')) {
              problems.push(`${rel}: <img> ${src} needs a numeric ${attr}`)
            }
          }
        })
    }
    return problems
  },
}

const copyRules: Check = {
  name: 'copy-rules',
  run(out) {
    const problems: string[] = []
    const rels = [...present(out, INDEXABLE), ...present(out, ['404.html'])]
    for (const rel of rels) {
      const raw = out.read(rel).toString('utf8')
      const text = visibleText(page(out, rel))
      for (const bad of ['\u2014', '\u2192', ' \u00b7 ']) {
        if (text.includes(bad)) problems.push(`${rel}: visible text contains "${bad}"`)
      }
      for (const re of [/colour/i, /organis/i, /behaviour/i]) {
        if (re.test(raw)) problems.push(`${rel}: HTML contains British spelling matching ${re}`)
      }
    }
    return problems
  },
}

function ogImageRel(root: HTMLElement): string | undefined {
  const content = metaContents(root, 'meta[property="og:image"]')[0] ?? ''
  return content.startsWith(`${SITE}/_og/`) ? content.slice(SITE.length + 1) : undefined
}

// Width and height from the PNG signature and the IHDR chunk (bytes 16 to 23).
function pngSize(buf: Buffer): { width: number; height: number } | undefined {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  if (buf.length < 24 || !buf.subarray(0, 8).equals(signature)) return undefined
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}

const ogImages: Check = {
  name: 'og-images',
  run(out) {
    const problems: string[] = []
    const files = new Map<string, string>()
    for (const rel of present(out, [...INDEXABLE, ...ALIASES])) {
      const root = page(out, rel)
      const found = metaContents(root, 'meta[property="og:image"]')
      if (found.length !== 1 || !found[0]!.startsWith(`${SITE}/_og/`)) {
        problems.push(`${rel}: expected exactly one og:image starting with ${SITE}/_og/, found ${found.length}`)
        continue
      }
      for (const [prop, want] of [['og:image:width', '1200'], ['og:image:height', '630']] as const) {
        const v = metaContents(root, `meta[property="${prop}"]`)
        if (v.length !== 1 || v[0] !== want) problems.push(`${rel}: ${prop} must be ${want}, found ${v.join(',') || 'none'}`)
      }
      const file = ogImageRel(root)!
      if (!out.exists(file)) {
        problems.push(`${rel}: og:image file ${file} is missing`)
        continue
      }
      const size = pngSize(out.read(file))
      if (!size) problems.push(`${rel}: ${file} is not a PNG`)
      else if (size.width !== 1200 || size.height !== 630) {
        problems.push(`${rel}: ${file} is ${size.width}x${size.height}, expected 1200x630`)
      }
      if (INDEXABLE.includes(rel)) {
        const other = files.get(file)
        if (other) problems.push(`${rel}: og:image ${file} is shared with ${other}`)
        else files.set(file, rel)
      } else if (out.exists('index.html') && file !== ogImageRel(page(out, 'index.html'))) {
        problems.push(`${rel}: og:image differs from index.html`)
      }
    }
    return problems
  },
}

// The screenshot panel on a case study card sits on the right. This measures a region
// inside it (x 800 to 1120, y 100 to 530) that Home's title never reaches. Calibration on
// the built cards: Home's text-only card has a channel standard deviation of 0.0 there,
// and the case study cards measure 37.4 at the lowest (Open Door), so the threshold sits
// between them. (The whole right half is a worse probe: Home's title reaches x=780 and
// scores 25.6 against Open Door's 35.7.)
const SCREENSHOT_STDEV = 20

const ogScreenshot: Check = {
  name: 'og-screenshot',
  async run(out) {
    const problems: string[] = []
    for (const rel of present(out, INDEXABLE.filter((r) => r !== 'index.html'))) {
      const file = ogImageRel(page(out, rel))
      if (!file || !out.exists(file)) continue
      try {
        // og-images already reports a share image that isn't 1200x630; the probe region
        // only exists on one that is, and extract() throws on a smaller image.
        const size = pngSize(out.read(file))
        if (!size || size.width !== 1200 || size.height !== 630) continue
        // stats() ignores earlier pipeline steps, so crop to a buffer first.
        const region = await sharp(out.read(file)).extract({ left: 800, top: 100, width: 320, height: 430 }).png().toBuffer()
        const { channels } = await sharp(region).removeAlpha().stats()
        const stdev = Math.max(...channels.map((c) => c.stdev))
        if (stdev < SCREENSHOT_STDEV) {
          problems.push(`${rel}: the screenshot region of ${file} has stdev ${stdev.toFixed(1)}, below ${SCREENSHOT_STDEV}, so it shows no screenshot`)
        }
      } catch (err) {
        problems.push(`${rel}: could not measure the screenshot region of ${file}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
    return problems
  },
}

const twitterCard: Check = {
  name: 'twitter-card',
  run(out) {
    const problems: string[] = []
    for (const rel of present(out, [...INDEXABLE, ...ALIASES])) {
      const v = metaContents(page(out, rel), 'meta[name="twitter:card"]')
      if (v.length !== 1 || v[0] !== 'summary_large_image') {
        problems.push(`${rel}: twitter:card must be summary_large_image, found ${v.join(',') || 'none'}`)
      }
    }
    return problems
  },
}

type Json = Record<string, unknown>

// Expected identity values. Hardcoded because this script cannot import app code; a unit
// test asserts they equal app/data/site.ts.
export const PERSON = {
  name: 'James Littlefield',
  jobTitle: 'AI Engineer',
  githubUrl: 'https://github.com/musicteachj',
  linkedinUrl: 'https://www.linkedin.com/in/james-littlefield-93037713b/',
  imagePath: '/images/james.jpg',
}

function typesOf(node: Json): string[] {
  const t = node['@type']
  return Array.isArray(t) ? t.map(String) : t === undefined ? [] : [String(t)]
}

// Parsed nodes of every JSON-LD graph on the page, plus parse problems.
function graphNodes(root: HTMLElement, rel: string, problems: string[]): Json[] {
  const nodes: Json[] = []
  for (const script of root.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const data = JSON.parse(script.text) as Json
      const graph = data['@graph']
      nodes.push(...(Array.isArray(graph) ? (graph as Json[]) : [data]))
    } catch {
      problems.push(`${rel}: a JSON-LD script is not valid JSON`)
    }
  }
  return nodes
}

// An image may be a string, an ImageObject, or an { '@id' } reference to one in the graph.
function imageUrl(value: unknown, nodes: Json[]): string | undefined {
  if (typeof value === 'string') return value
  if (!value || typeof value !== 'object') return undefined
  const node = value as Json
  const target = typeof node['@id'] === 'string' && !node['url'] ? nodes.find((n) => n['@id'] === node['@id']) : node
  const url = target?.['url'] ?? target?.['contentUrl']
  return typeof url === 'string' ? url : undefined
}

function hasEmailKey(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasEmailKey)
  if (value && typeof value === 'object') {
    return Object.entries(value).some(([k, v]) => k === 'email' || hasEmailKey(v))
  }
  return false
}

const jsonLd: Check = {
  name: 'json-ld',
  run(out) {
    const problems: string[] = []
    for (const rel of present(out, [...INDEXABLE, ...ALIASES])) {
      const nodes = graphNodes(page(out, rel), rel, problems)
      if (hasEmailKey(nodes)) problems.push(`${rel}: JSON-LD contains an email key`)
      const sites = nodes.filter((n) => typesOf(n).includes('WebSite'))
      if (sites.length !== 1) problems.push(`${rel}: expected one WebSite in JSON-LD, found ${sites.length}`)
      const people = nodes.filter((n) => typesOf(n).includes('Person'))
      if (people.length !== 1) {
        problems.push(`${rel}: expected one Person in JSON-LD, found ${people.length}`)
        continue
      }
      const p = people[0]!
      const want: Json = {
        name: PERSON.name,
        jobTitle: PERSON.jobTitle,
        url: `${SITE}/`,
        image: `${SITE}${PERSON.imagePath}`,
        sameAs: [PERSON.githubUrl, PERSON.linkedinUrl],
      }
      for (const [key, value] of Object.entries(want)) {
        const got = key === 'image' ? imageUrl(p[key], nodes) : p[key]
        if (JSON.stringify(got) !== JSON.stringify(value)) {
          problems.push(`${rel}: Person ${key} is ${JSON.stringify(got)}, expected ${JSON.stringify(value)}`)
        }
      }
    }
    return problems
  },
}

const caseStudySchema: Check = {
  name: 'case-study-schema',
  run(out) {
    const problems: string[] = []
    for (const rel of present(out, INDEXABLE.filter((r) => r !== 'index.html'))) {
      const root = page(out, rel)
      const name = root.querySelector('h1')?.text.trim() ?? ''
      const nodes = graphNodes(root, rel, problems)
      const personId = nodes.find((n) => typesOf(n).includes('Person'))?.['@id']
      const works = nodes.filter((n) => typesOf(n).includes('CreativeWork'))
      if (works.length !== 1) {
        problems.push(`${rel}: expected one CreativeWork, found ${works.length}`)
      } else {
        const work = works[0]!
        if (work.name !== name) problems.push(`${rel}: CreativeWork name is ${JSON.stringify(work.name)}, expected the page h1 ${JSON.stringify(name)}`)
        if (!imageUrl(work.image, nodes)?.startsWith(`${SITE}/`)) problems.push(`${rel}: CreativeWork image must be an absolute ${SITE}/ URL`)
        const author = work.author as Json | undefined
        if (!personId || author?.['@id'] !== personId) {
          problems.push(`${rel}: CreativeWork author does not reference the Person @id`)
        }
      }
      const crumbs = nodes.filter((n) => typesOf(n).includes('BreadcrumbList'))
      if (crumbs.length !== 1) {
        problems.push(`${rel}: expected one BreadcrumbList, found ${crumbs.length}`)
        continue
      }
      const items = (crumbs[0]!.itemListElement ?? []) as Json[]
      const flat = items.map((i) => ({ name: i.name ?? (i.item as Json | undefined)?.name, url: typeof i.item === 'string' ? i.item : (i.item as Json | undefined)?.['@id'] }))
      const expected = [{ name: PERSON.name, url: `${SITE}/` }, { name, url: urlFor(rel) }]
      if (items.length !== 2 || JSON.stringify(flat) !== JSON.stringify(expected)) {
        problems.push(`${rel}: BreadcrumbList must be ${JSON.stringify(expected)}, found ${JSON.stringify(flat)}`)
      }
    }
    return problems
  },
}


// Expected address prefix. Hardcoded because this script cannot import app code; a unit
// test asserts it equals app/data/site.ts emailUser plus "@".
export const EMAIL_NEEDLE = 'jameslittlefield3@'
// The resume PDF carries the address on purpose, until it is replaced with the AI Engineer
// version.
export const EMAIL_ALLOWED = ['resume.pdf']

const emailAddress: Check = {
  name: 'email-address',
  run(out) {
    const problems: string[] = []
    for (const rel of EMAIL_ALLOWED) {
      if (!out.exists(rel)) problems.push(`${rel}: allowed to contain the address but missing from the output`)
    }
    const needle = Buffer.from(EMAIL_NEEDLE)
    const mailto = Buffer.from('mailto:')
    for (const rel of out.list()) {
      if (!out.exists(rel)) continue
      let buf: Buffer
      try {
        buf = out.read(rel)
      } catch {
        continue // a directory entry
      }
      if (!EMAIL_ALLOWED.includes(rel) && buf.includes(needle)) problems.push(`${rel}: contains the email address`)
      if (/\.(html|json|md|xml|txt)$/.test(rel) && buf.includes(mailto)) problems.push(`${rel}: contains mailto:`)
    }
    return problems
  },
}

function locs(xml: string, tag: string): string[] {
  return [...xml.matchAll(new RegExp(`<${tag}>([^<]*)</${tag}>`, 'g'))].map((m) => m[1]!.replaceAll('&amp;', '&').trim())
}

const INDEXABLE_URLS = INDEXABLE.map(urlFor)

function sameSet(found: string[], want: string[]): boolean {
  return found.length === want.length && want.every((w) => found.includes(w))
}

const sitemap: Check = {
  name: 'sitemap',
  run(out) {
    if (!out.exists('sitemap.xml')) return ['sitemap.xml: file is missing']
    const problems: string[] = []
    const xml = out.read('sitemap.xml').toString('utf8')
    const found = locs(xml, 'loc')
    if (!sameSet(found, INDEXABLE_URLS)) {
      problems.push(`sitemap.xml: <loc> URLs are ${JSON.stringify(found)}, expected exactly ${JSON.stringify(INDEXABLE_URLS)}`)
    }
    for (const url of locs(xml, 'image:loc')) {
      if (!url.startsWith(`${SITE}/`)) {
        problems.push(`sitemap.xml: image ${url} is not on ${SITE}`)
        continue
      }
      const rel = decodeURIComponent(url.slice(SITE.length + 1))
      if (!out.exists(rel)) problems.push(`sitemap.xml: image ${url} has no output file ${rel}`)
    }
    return problems
  },
}

const AI_AGENTS = ['GPTBot', 'ClaudeBot', 'PerplexityBot']

interface RobotsGroup {
  agents: string[]
  rules: string[]
}

function robotsGroups(text: string): RobotsGroup[] {
  const groups: RobotsGroup[] = []
  let last: string | undefined
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim()
    const m = /^([A-Za-z-]+)\s*:\s*(.*)$/.exec(line)
    if (!m) continue
    const key = m[1]!.toLowerCase()
    if (key === 'user-agent') {
      if (last === 'user-agent') groups[groups.length - 1]!.agents.push(m[2]!)
      else groups.push({ agents: [m[2]!], rules: [] })
    } else if (key === 'allow' || key === 'disallow') {
      groups[groups.length - 1]?.rules.push(`${key}:${m[2]}`)
    }
    last = key
  }
  return groups
}

const robotsTxt: Check = {
  name: 'robots-txt',
  run(out) {
    if (!out.exists('robots.txt')) return ['robots.txt: file is missing']
    const problems: string[] = []
    const text = out.read('robots.txt').toString('utf8')
    const groups = robotsGroups(text)
    const blocks = (g: RobotsGroup) => g.rules.includes('disallow:/')
    const allows = (g: RobotsGroup) => !blocks(g)
    const star = groups.filter((g) => g.agents.includes('*'))
    if (star.length === 0 || !star.every(allows)) problems.push('robots.txt: the * group must exist and must not disallow /')
    for (const agent of AI_AGENTS) {
      const named = groups.filter((g) => g.agents.some((a) => a.toLowerCase() === agent.toLowerCase()))
      if (named.length === 0) problems.push(`robots.txt: no group names ${agent}`)
      else if (!named.every(allows)) problems.push(`robots.txt: ${agent} is disallowed from /`)
      else if (!named.some((g) => g.rules.includes('allow:/'))) problems.push(`robots.txt: ${agent} group must allow /`)
    }
    if (!text.split(/\r?\n/).some((l) => l.trim() === `Sitemap: ${SITE}/sitemap.xml`)) {
      problems.push(`robots.txt: missing "Sitemap: ${SITE}/sitemap.xml"`)
    }
    return problems
  },
}

const llms: Check = {
  name: 'llms',
  run(out) {
    const problems: string[] = []
    const mdUrl = (rel: string) => (rel === 'index.html' ? `${SITE}/index.md` : `${SITE}/${rel.replace(/\/index\.html$/, '')}.md`)
    const wantMd = INDEXABLE.map(mdUrl)
    if (!out.exists('llms.txt')) {
      problems.push('llms.txt: file is missing')
    } else {
      const text = out.read('llms.txt').toString('utf8')
      const pages = [...text.matchAll(/\]\((https?:\/\/[^)\s]+\.md)\)/g)].map((m) => m[1]!)
      if (!sameSet(pages, wantMd)) problems.push(`llms.txt: lists ${JSON.stringify(pages)}, expected exactly ${JSON.stringify(wantMd)}`)
    }
    for (const rel of ['projects.md', 'contact.md', 'sitemap.md']) {
      if (out.exists(rel)) problems.push(`${rel}: must not exist`)
    }
    if (out.exists('llms-full.txt')) {
      const full = out.read('llms-full.txt').toString('utf8')
      for (const alias of ['projects', 'contact']) {
        if (new RegExp(`\\*\\*Source:\\*\\* ${SITE}/${alias}(\\.md)?\\s*$`, 'm').test(full)) {
          problems.push(`llms-full.txt: contains a section for /${alias}`)
        }
      }
      // The alias check above only means something if Source lines are still in this format.
      const sources = [...full.matchAll(/\*\*Source:\*\* (\S+)/g)].map((m) => m[1]!.replace(/\.md$/, ''))
      for (const rel of INDEXABLE) {
        if (!sources.includes(urlFor(rel))) problems.push(`llms-full.txt: no "**Source:** ${urlFor(rel)}" line`)
      }
    }
    for (const rel of out.list().filter((r) => r.endsWith('.html'))) {
      for (const link of page(out, rel).querySelectorAll('link[rel=alternate][type="text/markdown"]')) {
        const href = (link.getAttribute('href') ?? '').split('#')[0]!
        const file = href.startsWith(`${SITE}/`) ? href.slice(SITE.length + 1) : href.replace(/^\//, '')
        if (!file || !out.exists(file)) problems.push(`${rel}: Markdown alternate ${href} has no output file`)
      }
    }
    return problems
  },
}

export const checks: Check[] = [titles, descriptions, canonicals, robotsMeta, bodyText, images, copyRules, ogImages, ogScreenshot, twitterCard, jsonLd, caseStudySchema, sitemap, robotsTxt, llms, emailAddress]

export async function checkSeo(out: OutputReader): Promise<string[]> {
  const problems: string[] = []
  for (const check of checks) problems.push(...(await check.run(out)))
  return problems
}

async function main(): Promise<void> {
  const problems = await checkSeo(readOutput('.output/public'))
  if (problems.length > 0) {
    for (const p of problems) console.error(p)
    process.exit(1)
  }
  console.log(`check-seo: ${checks.length} checks passed`)
}

if (import.meta.main) {
  await main()
}
