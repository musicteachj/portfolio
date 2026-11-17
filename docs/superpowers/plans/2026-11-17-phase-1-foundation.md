# Phase 1: Foundation and Tracer Bullet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the old Vite/Vuetify app with a bare Nuxt 4 static site. Prove every risky build tool on two nearly empty pages:
- prerendered HTML
- section URLs with one canonical
- IPX images
- Takumi OG image
- 404 page with real content
- link checker

**Architecture:**
- **Build:** `nuxt generate` writes `.output/public`.
- **Output tests:** a Vitest `output` project reads those files and asserts on the raw HTML, CSS, images and PNGs.
- **Browser smoke test:** a tiny Node static server (`scripts/serve-static.mjs`) mimics the planned CloudFront behavior. That means `<path>/index.html` rewrites and a real 404, so Playwright can test status codes and console errors.
- **Scope:** no visual design beyond tokens, base CSS and fonts. Components come in Phase 2.

**Tech Stack:**
- Nuxt ^4.6, Node 24
- @nuxtjs/seo 6 (nuxt-og-image 7, link-checker, site-config, skew-protection), @takumi-rs/core
- @nuxt/image 2, @nuxt/fonts 1
- Vitest 5 + @nuxt/test-utils 4, @playwright/test, node-html-parser
- @nuxt/eslint + Prettier

**Spec:** `docs/superpowers/specs/2026-11-17-portfolio-rewrite-design.md`. Phase 1 is in "Phased development plan". The settings come from the Stack, SEO, and Hosting sections.

**Visual source (read-only):** `.superpowers/brainstorm/18672-1794933570/content/v11-product-showcase.html`
- `:root` tokens: lines 15-56
- base styles: lines 58-76
- reduced motion: lines 427-430

## Global Constraints

- **Node:** run every `node`/`npm`/`npx` command as `fnm exec --using=24 -- <command>`. The shell defaults to Node 18, and Nuxt 4.6 needs `^22.22.3 || ^24.15.0`. Set `.nvmrc` to `24`.
- **Git:**
  - Branch `nuxt-rewrite` (already created, tracking `origin/dev`).
  - **Never `git commit`, `git push`, or open a PR without James's explicit OK for that action.** This phase ends with one *proposed* commit.
- **Copy:** American English, no em dashes anywhere (code comments included), no "→" in UI text, sentence case.
- **Site:**
  - Origin `https://jameslittlefield.net`, `trailingSlash: false`, site name "James Littlefield".
  - Output stays fully static. No server routes, no runtime OG rendering.
- **Off limits in Phase 1:**
  - Don't touch `.github/workflows/` (Phase 6) or `README.md`/`DESIGN.md` (Phase 6).
  - Don't move the résumé PDF (Phase 2).
- **Styling:** plain CSS only. No Tailwind, no UI library.
- **Config keys:** where this plan names a module config key from a builder review (marked *confirm key*), check it against the installed package's README/types in `node_modules` before relying on it. The output tests are the source of truth.

## Review Focus

1. **Hydration and missing-asset errors:** loading any prerendered route (`/`, `/projects`, `/contact`, `/projects/open-door`) should produce zero console errors and zero failed or 4xx requests. Hydration mismatches on the alias routes and missing `/_fonts/` or `/_ipx/` files show up here first. Test: Task 3, `no console errors or failed requests`.
2. **Unknown project slugs:** `/projects/does-not-exist` should return the 404 page with HTTP 404, not an empty stub with 200. Test: Task 4, `unknown slug returns 404 page`.
3. **Duplicate canonicals:** the SEO module adds its own canonical, and the section-URL override must not create a second one. Every page has exactly one. Test: Task 3, `exactly one canonical per page`.
4. **Image formats:** IPX files must actually contain AVIF/WebP bytes. Phase 6 sets S3 content types from these names. Test: Task 3, `ipx files hold the formats they claim`.
5. **Route precedence:** the `/projects` alias must not swallow `/projects/open-door`. Test: Task 3, the open-door assertions in `prerenders the four tracer routes`.

---

## File map (Phase 1)

| Path | Responsibility |
|---|---|
| `package.json` | Scripts and dependencies (rewritten) |
| `nuxt.config.ts` | Modules, site config, fonts, image, OG, link checker, prerender routes |
| `tsconfig.json` | Nuxt 4 project references (rewritten) |
| `eslint.config.mjs` | `@nuxt/eslint` flat config plus Prettier compatibility |
| `vitest.config.ts` | Two projects: `unit` (Nuxt env) and `output` (Node, reads `.output/public`) |
| `playwright.config.ts` | e2e against `scripts/serve-static.mjs` on port 4173 |
| `scripts/serve-static.mjs` | Static server that mimics the CloudFront rewrite and 404 |
| `app/app.vue` | `<NuxtPage />` shell |
| `app/assets/css/tokens.css`, `app/assets/css/base.css` | v11 tokens and base styles |
| `app/pages/index.vue` | Tracer Home, with aliases `/projects` and `/contact` |
| `app/pages/projects/[slug].vue` | Tracer case study stub (open-door only) |
| `app/error.vue` | 404 page with real content |
| `app/components/OgImage/Card.takumi.vue` | OG image template |
| `public/images/projects/opendoor-cited-answer.png` | Tracer screenshot |
| `tests/output/helpers.ts`, `tests/output/*.test.ts` | Output assertions |
| `tests/e2e/smoke.spec.ts` | Browser smoke tests |

---

### Task 1: Replace the old app with a Nuxt skeleton and test harness

**Files:**
- **Delete:**
  - `src/`, `index.html`, `vite.config.ts`, `vitest.config.ts`
  - `tsconfig.node.json`, `tsconfig.tsbuildinfo`, `eslint.config.ts`, `dist/`
  - `public/sitemap.xml`, `public/robots.txt`, `public/og-image.png`
  - Keep `public/James_Littlefield_Senior_Full_Stack_Developer.pdf`.
- **Rewrite:** `package.json`, `tsconfig.json`, `.nvmrc` (`24`)
- **Modify:** `.gitignore`. Add `.nuxt/`, `.output/`, `.data/`, `playwright-report/`, `test-results/`, and keep `.superpowers/`.
- **Create:**
  - `nuxt.config.ts`, `app/app.vue`, `app/pages/index.vue`
  - `eslint.config.mjs`, `vitest.config.ts`, `playwright.config.ts`
  - `scripts/serve-static.mjs`
  - `tests/output/helpers.ts`, `tests/output/pages.test.ts`
  - `tests/e2e/smoke.spec.ts`

**Interfaces:**
- **Produces, in `tests/output/helpers.ts`:**
  - `OUTPUT_DIR = '.output/public'`
  - `exists(rel: string): boolean`
  - `read(rel: string): string`
  - `html(rel: string): HTMLElement` (`node-html-parser` root)
  - `pngSize(rel: string): { width: number; height: number }`, which reads the IHDR big-endian width at bytes 16-19 and height at 20-23
- **Produces, `scripts/serve-static.mjs`:**
  - Usage: `node scripts/serve-static.mjs [dir=.output/public] [port=4173]`.
  - Behavior:
    - `/` → `index.html`
    - a path with an extension is served as-is
    - an extensionless path → `<path>/index.html`
    - anything missing → `404.html` with status **404**
  - Content types by extension: html, css, js, json, png, jpg, webp, avif, svg, woff2, txt, xml, pdf, mp4, vtt.
- **Produces, npm scripts:**
  - `dev`: `nuxt dev`
  - `generate`: `nuxt generate`
  - `preview`: `node scripts/serve-static.mjs`
  - `lint`: `eslint .`
  - `format`: `prettier --write .`
  - `typecheck`: `nuxt typecheck`
  - `test`: `vitest run --project unit`
  - `test:output`: `vitest run --project output`
  - `test:e2e`: `playwright test`
  - `postinstall`: `nuxt prepare`

- [ ] **Step 1: Delete the old app files listed above.** `git status` should show them deleted, with nothing else changed besides `.gitignore` and `.nvmrc`.
- [ ] **Step 2: Write `package.json` and install the dependencies.**
  - Name `my-portfolio`, private, `"type": "module"`, `"engines": { "node": ">=24" }`, the scripts above.
  - Install deps: `nuxt @nuxtjs/seo @nuxt/image @nuxt/fonts @takumi-rs/core`.
  - Install devDeps: `typescript vue-tsc @nuxt/eslint eslint eslint-config-prettier prettier vitest @nuxt/test-utils @vue/test-utils happy-dom @playwright/test node-html-parser`.
  - Run: `fnm exec --using=24 -- npm install`. Expected: it exits 0, and `postinstall` runs `nuxt prepare`.
  - Run: `fnm exec --using=24 -- npx playwright install chromium`.
- [ ] **Step 3: Write `nuxt.config.ts`.**
  - `compatibilityDate` today, `modules: ['@nuxtjs/seo', '@nuxt/image', '@nuxt/fonts', '@nuxt/eslint']`
  - `site: { url: 'https://jameslittlefield.net', name: 'James Littlefield', trailingSlash: false }`
  - `nitro.prerender: { crawlLinks: true, routes: ['/'] }`
  - Write `app/app.vue` (`<NuxtPage />`) and `app/pages/index.vue` with one `<h1>James Littlefield</h1>`.
- [ ] **Step 4: Write `vitest.config.ts`.**
  - Use `test.projects` with `unit` (`defineVitestProject` from `@nuxt/test-utils/config`, environment `nuxt`, include `tests/unit/**/*.test.ts`, `passWithNoTests: true`) and `output` (environment `node`, include `tests/output/**/*.test.ts`).
  - Write `tests/output/helpers.ts` per Interfaces.
- [ ] **Step 5: Write the failing output test `tests/output/pages.test.ts`.**

```ts
test('home is prerendered with real content', () => {
  expect(exists('index.html')).toBe(true)
  expect(html('index.html').querySelector('h1')?.text.trim()).toBe('James Littlefield')
})
```

- [ ] **Step 6: Run it before generating.** Run: `fnm exec --using=24 -- npm run test:output`. Expected: FAIL (`.output/public/index.html` missing).
- [ ] **Step 7: Generate and re-run.** Run: `fnm exec --using=24 -- npm run generate && fnm exec --using=24 -- npm run test:output`. Expected: PASS.
- [ ] **Step 8: Write `scripts/serve-static.mjs`, `playwright.config.ts` and `tests/e2e/smoke.spec.ts`.**
  - `playwright.config.ts`: `webServer: { command: 'node scripts/serve-static.mjs', url: 'http://localhost:4173', reuseExistingServer: true }`, Chromium only, `baseURL` `http://localhost:4173`.

```ts
test('home returns 200 with its heading', async ({ page }) => {
  const res = await page.goto('/')
  expect(res?.status()).toBe(200)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('James Littlefield')
})
test('missing path returns 404', async ({ request }) => {
  expect((await request.get('/nope')).status()).toBe(404)
})
```

- [ ] **Step 9: Run e2e.** Run: `fnm exec --using=24 -- npm run test:e2e`. Expected: both pass. Before Task 4, Nuxt's default `404.html` is served, so the status test passes now and Task 4 adds content checks.
- [ ] **Step 10: Lint and typecheck setup.**
  - `eslint.config.mjs`: `withNuxt(...)` from `./.nuxt/eslint.config.mjs`, with `eslint-config-prettier` last. Keep `.prettierrc.json` as is.
  - Run: `fnm exec --using=24 -- npm run lint && fnm exec --using=24 -- npm run typecheck`. Expected: both exit 0.

### Task 2: Design tokens, base CSS and self-hosted fonts

**Files:**
- **Create:**
  - `app/assets/css/tokens.css`: copy v11 `:root` lines 15-56 verbatim. This is palette A, including `--field-border: #8A8F88`, the type scale, spacing, radii, `--wrap`, `--tap` and `--ease`.
  - `app/assets/css/base.css`: copy v11 lines 58-76 (reset, body, headings, links, `:focus-visible`, `.wrap`, `.sr-only`, `.skip`) plus the reduced-motion block at lines 427-430.
- **Modify:** `nuxt.config.ts`.
  - `css: ['~/assets/css/tokens.css', '~/assets/css/base.css']`
  - `fonts.families`: Onest weights `[400, 500, 600, 700]` with `global: true` (*confirm key*), and Fragment Mono weight `[400]`.
  - Fonts are downloaded at build and served from `/_fonts/`.
- **Test:** `tests/output/styles.test.ts`

**Interfaces:**
- **Produces:** the CSS custom properties exactly as named in v11 (`--paper`, `--surface`, `--sunken`, `--line`, `--line-strong`, `--field-border`, `--ink`, `--ink-2`, `--ink-3`, `--accent`, `--accent-hover`, `--on-accent`, `--soft`, `--tint`, `--mark`, `--pass*`, `--miss*`, `--error*`, `--font-sans`, `--font-mono`, `--t-*`, `--s-1`..`--s-9`, `--r-ctl`, `--r-frame`, `--r-stage`, `--wrap`). Phase 2 components use these names.

- [ ] **Step 1: Write the failing test `tests/output/styles.test.ts`.**

```ts
test('palette A tokens ship in the CSS bundle', () => {
  const css = cssBundle() // concatenation of every .output/public/_nuxt/*.css, lowercased, whitespace removed
  expect(css).toContain('--accent:#12354e')
  expect(css).toContain('--field-border:#8a8f88')
})
test('fonts are self-hosted', () => {
  const css = cssBundle()
  expect(css).toMatch(/@font-face\{[^}]*font-family:"?onest"?/)
  expect(css).toContain('/_fonts/')
  expect(read('index.html')).not.toContain('fonts.googleapis.com')
  expect(readdirSync(join(OUTPUT_DIR, '_fonts')).some(f => f.endsWith('.woff2'))).toBe(true)
})
```

  `cssBundle()` goes in `helpers.ts`. Check where Nuxt puts inlined critical CSS. If styles are inlined into `index.html` instead of `_nuxt/*.css`, include the `<style>` contents of `index.html` in `cssBundle()`.

- [ ] **Step 2: Generate and run.** Run: `fnm exec --using=24 -- npm run generate && fnm exec --using=24 -- npm run test:output`. Expected: the new tests FAIL.
- [ ] **Step 3: Add the two CSS files and the fonts config** as listed under Files.
- [ ] **Step 4: Generate and run again.** Same command. Expected: PASS.

### Task 3: Tracer routes (section URLs, case study stub, IPX image)

**Files:**
- **Modify:** `app/pages/index.vue`
  - Tracer content: `<h1>James Littlefield</h1>`.
  - `<section id="projects" aria-labelledby="h-projects">` with `<h2 id="h-projects">Projects</h2>`, a `<NuxtLink to="/projects/open-door">Open Door</NuxtLink>`, and `<NuxtPicture src="/images/projects/opendoor-cited-answer.png" format="avif,webp" width="1800" height="1125" sizes="100vw md:50vw" alt="Open Door chat answering a sick leave question with handbook citations." />`.
  - `<section id="contact" aria-labelledby="h-contact">` with `<h2 id="h-contact">Contact</h2>`.
  - `definePageMeta({ alias: ['/projects', '/contact'] })`.
  - Canonical always `https://jameslittlefield.net/`. Override the module's auto canonical so exactly one tag exists. One way: `useHead({ link: [{ rel: 'canonical', href: 'https://jameslittlefield.net/', key: 'canonical' }] })`. Check how nuxt-seo-utils keys its canonical.
- **Create:** `app/pages/projects/[slug].vue`
  - Stub map `{ 'open-door': 'Open Door' }`.
  - Unknown slug: `throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })`.
  - Renders `<h1>{{ name }}</h1>`.
- **Create:** `public/images/projects/opendoor-cited-answer.png`, copied from the brainstorm content folder.
- **Modify:** `nuxt.config.ts`. Set `nitro.prerender.routes: ['/', '/projects', '/contact', '/projects/open-door']`.
- **Test:** `tests/output/routes.test.ts`, plus additions to `tests/e2e/smoke.spec.ts`.

**Interfaces:**
- **Produces:**
  - Section ids `projects` and `contact`. Phase 2 scroll behavior and the link checker rely on them.
  - The alias pattern for section URLs.
  - The case study route shape `/projects/[slug]`.

- [ ] **Step 1: Write the failing output tests `tests/output/routes.test.ts`.**

```ts
test('prerenders the four tracer routes', () => {
  for (const f of ['index.html', 'projects/index.html', 'contact/index.html', 'projects/open-door/index.html'])
    expect(exists(f)).toBe(true)
  expect(html('projects/index.html').querySelector('h1')?.text.trim()).toBe('James Littlefield')
  expect(html('contact/index.html').querySelector('section#contact')).not.toBeNull()
  expect(html('projects/open-door/index.html').querySelector('h1')?.text.trim()).toBe('Open Door')
})
test('exactly one canonical per page', () => {
  const expected: Record<string, string> = {
    'index.html': 'https://jameslittlefield.net/',
    'projects/index.html': 'https://jameslittlefield.net/',
    'contact/index.html': 'https://jameslittlefield.net/',
    'projects/open-door/index.html': 'https://jameslittlefield.net/projects/open-door',
  }
  for (const [f, href] of Object.entries(expected)) {
    const tags = html(f).querySelectorAll('link[rel="canonical"]')
    expect(tags).toHaveLength(1)
    expect(tags[0].getAttribute('href')).toBe(href)
  }
})
test('screenshot ships as avif and webp via ipx with dimensions', () => {
  const root = html('index.html')
  expect(root.querySelector('source[type="image/avif"]')).not.toBeNull()
  expect(root.querySelector('source[type="image/webp"]')).not.toBeNull()
  const img = root.querySelector('picture img')!
  expect(img.getAttribute('width')).toBe('1800')
  expect(img.getAttribute('height')).toBe('1125')
})
test('ipx files hold the formats they claim', () => {
  // For each <source>, take the first srcset URL, decodeURIComponent it, strip the leading slash,
  // and assert the file exists. AVIF bytes 4-11 are 'ftypavif'; WebP bytes 0-3 are 'RIFF' and 8-11 are 'WEBP'.
})
```

  Write the body of the last test from its comment. Log the actual `_ipx/` filenames in the test output, because Phase 6 needs the naming pattern.

- [ ] **Step 2: Generate and run.** Expected: FAIL.
- [ ] **Step 3: Implement the page changes, the stub and the config** listed under Files.
- [ ] **Step 4: Generate and run.** Run: `fnm exec --using=24 -- npm run generate && fnm exec --using=24 -- npm run test:output`. Expected: PASS.
- [ ] **Step 5: Add the e2e test to `tests/e2e/smoke.spec.ts`.**

```ts
for (const path of ['/', '/projects', '/contact', '/projects/open-door']) {
  test(`no console errors or failed requests on ${path}`, async ({ page }) => {
    const problems: string[] = []
    page.on('console', m => { if (m.type() === 'error' || /hydration/i.test(m.text())) problems.push(m.text()) })
    page.on('requestfailed', r => problems.push(`failed ${r.url()}`))
    page.on('response', r => { if (r.status() >= 400) problems.push(`${r.status()} ${r.url()}`) })
    const res = await page.goto(path)
    expect(res?.status()).toBe(200)
    await page.waitForLoadState('networkidle')
    expect(problems).toEqual([])
  })
}
```

- [ ] **Step 6: Run e2e.** Run: `fnm exec --using=24 -- npm run test:e2e`. Expected: PASS. A hydration warning on `/projects` or `/contact` means the alias renders differently on server and client. Fix it in `index.vue`; don't weaken the test.

### Task 4: 404 page with real content

**Files:**
- **Create:** `app/error.vue`
  - `<h1>Page not found</h1>`.
  - `<p>That page doesn't exist or has moved.</p>`.
  - `<NuxtLink to="/">Go to the home page</NuxtLink>` and `<NuxtLink to="/projects">See the projects</NuxtLink>`.
  - `noindex` via `useSeoMeta({ robots: 'noindex' })` or the robots module's equivalent (*confirm key*).
- **Modify:** `nuxt.config.ts`. Make `nuxt generate` render `404.html` with this content. The builder review named `experimental.prerenderErrorPages: true` (*confirm key*: `grep -rn prerenderErrorPages node_modules/@nuxt/schema/dist`). If the key doesn't exist, prerender the 404 another way (for example add a route that renders the error) and record what worked as a comment in the config.
- **Test:** `tests/output/errors.test.ts`, plus additions to `tests/e2e/smoke.spec.ts`.

- [ ] **Step 1: Write the failing tests.**

```ts
// tests/output/errors.test.ts
test('404.html has real content and is noindex', () => {
  const root = html('404.html')
  expect(root.querySelector('h1')?.text.trim()).toBe('Page not found')
  expect(root.querySelector('a[href="/"]')).not.toBeNull()
  expect(root.querySelector('meta[name="robots"]')?.getAttribute('content')).toContain('noindex')
})
test('unknown project slugs are not prerendered', () => {
  expect(exists('projects/does-not-exist/index.html')).toBe(false)
})
```

```ts
// tests/e2e/smoke.spec.ts
test('unknown slug returns 404 page', async ({ page }) => {
  const res = await page.goto('/projects/does-not-exist')
  expect(res?.status()).toBe(404)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found')
})
```

- [ ] **Step 2: Generate and run both suites.** Expected: the new tests FAIL.
- [ ] **Step 3: Implement `error.vue` and the config change.**
- [ ] **Step 4: Generate and run both suites.** Run: `fnm exec --using=24 -- npm run generate && fnm exec --using=24 -- npm run test:output && fnm exec --using=24 -- npm run test:e2e`. Expected: PASS.

### Task 5: OG image tracer (Takumi, 1200x630, Onest)

**Files:**
- **Create:** `app/components/OgImage/Card.takumi.vue`
  - Props `{ title: string; eyebrow?: string }`.
  - Background `#F7F7F4`, a 16px left bar in `#12354E`, eyebrow in `#5F655F` at 36px, title in `#141614` at 88px weight 600, `font-family: Onest`.
  - The final design comes in Phase 5.
- **Modify:** `app/pages/index.vue`. Call nuxt-og-image v7's page API (check its README for `defineOgImage` vs `defineOgImageComponent`) with `('Card', { title: 'James Littlefield', eyebrow: 'AI Engineer' })`.
- **Modify:** `nuxt.config.ts`. Set `ogImage: { zeroRuntime: true, defaults: { width: 1200, height: 630 } }` (*confirm keys*). Don't set `ogImage` inside any `useSeoMeta`.
- **Test:** `tests/output/og.test.ts`

- [ ] **Step 1: Write the failing test.**

```ts
test('home has one prerendered 1200x630 og:image', () => {
  const metas = html('index.html').querySelectorAll('meta[property="og:image"]')
  expect(metas).toHaveLength(1)
  const url = metas[0].getAttribute('content')!
  expect(url.startsWith('https://jameslittlefield.net/')).toBe(true)
  const rel = decodeURIComponent(new URL(url).pathname.slice(1))
  expect(rel.endsWith('.png')).toBe(true)
  expect(exists(rel)).toBe(true)
  expect(pngSize(rel)).toEqual({ width: 1200, height: 630 })
})
```

- [ ] **Step 2: Generate and run.** Expected: FAIL.
- [ ] **Step 3: Implement the template, the page call and the config.**
- [ ] **Step 4: Generate and run.** Expected: PASS.
- [ ] **Step 5: Visual check.** Open the generated PNG with the Read tool. The title must render in Onest, with its rounded geometric letterforms, not a fallback such as Inter or a system serif. If it renders in the wrong font, set Onest `global: true` and/or load the font file explicitly for the renderer per the nuxt-og-image docs.
- [ ] **Step 6: Fallback rule.** If Steps 3-5 still fail after two distinct fix attempts, stop fighting the module:
  - Remove the template and the `ogImage` config.
  - Hand-build `public/og/home.png` (1200x630, the same design, rendered from a small HTML file with headless Chrome).
  - Set `og:image` to `https://jameslittlefield.net/og/home.png` via `useSeoMeta`.
  - Keep the same test, adjusted only so the path matches.
  - Record the decision in `docs/superpowers/specs/2026-11-17-portfolio-rewrite-design.md` under SEO, Share images.

### Task 6: Link checker, skew protection, phase gate

**Files:**
- **Modify:** `nuxt.config.ts`
  - `linkChecker: { failOnError: true }` (*confirm key*).
  - Disable skew protection (*confirm key* in `node_modules/nuxt-skew-protection`, e.g. `skewProtection: { enabled: false }`).

- [ ] **Step 1: Prove the link checker fails the build.**
  - Temporarily add `<NuxtLink to="/does-not-exist">x</NuxtLink>` to `index.vue`.
  - Run: `fnm exec --using=24 -- npm run generate`. Expected: non-zero exit, with the output naming `/does-not-exist`.
  - Remove the link and run generate again. Expected: exit 0.
- [ ] **Step 2: Confirm skew protection is off.**
  - Run: `fnm exec --using=24 -- npm run generate`, then `grep -rl "skew" .output/public/_nuxt | head`.
  - Expected: no skew-protection runtime chunk. If the module has no clean disable switch, record what was checked in a config comment.
- [ ] **Step 3: Run the full phase gate.**
  - Run: `fnm exec --using=24 -- sh -c "npm run lint && npm run typecheck && npm test && npm run generate && npm run test:output && npm run test:e2e"`.
  - Expected: every command exits 0.
- [ ] **Step 4: Copy check.** Run: `grep -rn "—" app scripts tests nuxt.config.ts`. Expected: no matches.
- [ ] **Step 5: Stop for review.** Report to James:
  - what each tracer item proved
  - any *confirm key* that differed from the plan
  - the `_ipx/` naming pattern Task 3 logged
  - whether the OG fallback was used
- [ ] **Step 6: Propose the phase commit; run it only on James's explicit OK.**

```bash
git add -A
git commit -m "Replace Vite app with Nuxt static foundation (phase 1)"
```
