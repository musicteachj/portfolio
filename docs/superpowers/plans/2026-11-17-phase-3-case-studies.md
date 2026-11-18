# Phase 3: Case Study Pages and 404 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the four case study stubs with the full v11 case study pages and give the 404 page its final form. Each case study page has:
- project tabs and an "All projects" link
- the intro and proof links
- a hero screenshot
- a section table of contents
- eight numbered sections, with the Open Door request-flow diagram
- links to the previous and next project

Close the Phase 3 items in the carry-forward notes.

**Architecture:**
- **Data:** the case study content is typed data in `app/data/projects.ts` under a new `caseStudy` field. `architecture` is a union: step groups for three projects, and a `flow` variant rendered by a dedicated `RequestFlow.vue` for Open Door.
- **Components:** small scoped-CSS components ported from v11. Existing Home components gain variant props instead of being forked.
- **Navigation:** focus and scroll for page changes are centralized in `router.options.ts` and a `SectionLink` component extracted from the header.

**Tech Stack:** Nuxt 4.6 static generate, @nuxt/image 2, Vitest 5 + @nuxt/test-utils 4, Playwright + @axe-core/playwright, plain CSS.

**Spec:** `docs/superpowers/specs/2026-11-17-portfolio-rewrite-design.md`. Phase 3 is in "Phased development plan". Also read the IA table row for `/projects/<slug>`, the content model ("Proof link rules", "Launch state", "Video support"), the design system and the SEO 404 bullets.

**Carry-forward:** `docs/superpowers/plans/2026-11-17-phase-1-carry-forward.md`. Its "Facts learned" sections and every "Phase 3" item (from Phase 1 and from Phase 2) are requirements for this plan.

**Visual and copy source (read-only):** `.superpowers/brainstorm/18672-1794933570/content/v11-product-showcase.html`

| Lines | Content |
|---|---|
| 246-364 | case study CSS: `.cs-head`, `.pnav`, `.back`, `.ptabs`, `.cs-intro`, `.proof--3`, `.cs-hero`, `.cs-body`, `.toc`, `.cs-sec`, `.sec-n`, `.feat`, `.plain-list`, `.steps*`, `.flow*`, `.node*`, `.wire*`, `.branch*`, `.sub2`, `.node-label`, `.table-wrap`, `.score*`, `.table-note`, `.stage--video`, `.video-note`, `.gallery`, `.g-item`, `.prevnext` |
| 594-679 | Open Door case study markup |
| 680-743 | Packwright |
| 744-807 | Folio |
| 808-873 | ResumeIQ |

- **Viewing the mockup:** open `v11-product-showcase.html?chrome=0&project=opendoor` (or `packwright`, `folio`, `resumeiq`).
- **Reference screenshots:** `.superpowers/brainstorm/18672-1794933570/shots/v11-opendoor-1440.png`, `v10-opendoor-390.png`, `v10-packwright-820.png` and `v10-folio-1440.png`.

## Global Constraints

- **Node:** run every `node`/`npm`/`npx` command as `fnm exec --using=24 -- <command>`.
- **Git:** never `git commit`, `git push`, `git add`, `git stash`, `git checkout` or `git restore`, and never open a PR. The controller stages approved work. The phase ends with one proposed commit that needs James's explicit OK.
- **Copy:**
  - Every visible string comes from v11 verbatim, decoding HTML entities. These changes are allowed:
    - Section 08 is titled "Screenshots" and has no video while video is disabled.
    - Frame labels are the project name; v11's `packwright.jameslittlefield.net` and `resume.jameslittlefield.net` are not used.
    - There is no "open the live demo" sentence while the demo is disabled.
  - American English, no em dashes anywhere (comments included), no "→" in UI text, no middle-dot meta strings, sentence case.
- **Design:**
  - Use the v11 tokens by name.
  - Plain CSS, with `<style scoped>` in every component.
  - No new colors or sizes outside the tokens. The v11 literal values used in the flow diagram (wire and node sizes) are allowed.
- **Launch state:**
  - Only "Case study" is enabled. Video, Code and Live demo stay disabled, and there are no demo URLs.
  - No `<video>` element renders anywhere at launch.
- **Screenshots:**
  - Never cropped (`width: 100%; height: auto`).
  - Served as AVIF and WebP through `NuxtPicture`, with every `sizes` entry prefixed.
  - The hero is eager. Gallery images are lazy.
- **Email:** the email address never appears in generated HTML.
- **Responsive:** no horizontal page overflow from 360 to 1440. Touch targets are at least `var(--tap)`.
- **Scope:** don't touch `.github/`, `README.md`, `DESIGN.md` or `docs/superpowers/specs/`. Don't touch the contact form behavior (Phase 4) or SEO meta beyond the page `<title>` (Phase 5).

## Review Focus

1. **Home to case study to Back:**
   - Opening a case study from Home lands at the top of the case study, not at the old Home offset.
   - Back returns to the exact Home offset with no glide.
   - Test: Task 6, `case study opens at the top and Back restores Home`.
2. **The results table at 360px** scrolls inside its focusable region without page overflow. Test: Task 5, `results table scrolls inside its region at 360`.
3. **The Open Door flow diagram on phones** collapses to the stacked version with node labels and keeps its accessible description. Test: Task 5, `request flow stacks on phones and keeps its label`.
4. **Hash links and scroll margin:**
   - A TOC link click, or a direct load of `/projects/folio#results`, lands with the section heading fully visible (`scroll-margin-top`).
   - Under reduced motion it lands instantly.
   - Test: Task 6, `toc and direct hash land on the section heading`.
5. **Focus after a page change:** after a client-side navigation to a case study, focus lands on its `h1`. Screen readers announce the new page through the route announcer. Test: Task 6, `focus moves to the case study heading`.

---

## File map (Phase 3)

| Path | Responsibility |
|---|---|
| `playwright.config.ts`, `tests/e2e/helpers/axe.ts`, `tests/helpers/image-size.ts`, `tests/helpers/paths.ts` | Test infra (carry-forward) |
| `app/types/project.ts` | Adds `anchorId` and `CaseStudy`, plus the `Architecture`, `ResultsData` and `Decision` types |
| `app/data/projects.ts` | Adds `anchorId` and `caseStudy` content for all 4 projects |
| `app/components/SectionLink.vue` | Section-URL link logic extracted from `SiteHeader` (plain click, forced push, focus heading) |
| `app/components/ProofLinks.vue`, `StackList.vue`, `BrowserFrame.vue`, `ProjectBlock.vue` | Variant props: `page` proof grid, page stack, figure or div frame plus video rule, `anchorId` |
| `app/components/case/CaseHeader.vue`, `ProjectTabs.vue`, `CaseIntro.vue`, `SectionToc.vue`, `CaseSection.vue`, `PrevNext.vue` | Case study page shell |
| `app/components/case/InlineText.vue`, `FeatureList.vue`, `DecisionList.vue`, `ArchitectureSteps.vue`, `RequestFlow.vue`, `ResultsTable.vue`, `ScreenshotGallery.vue`, `VideoPlayer.vue`, `MediaSection.vue` | Section content |
| `app/pages/projects/[slug].vue` | Case study page assembly |
| `app/error.vue` | Final 404 (and non-404 error) page |
| `app/router.options.ts`, `app/app.vue` | Expanded `scrollBehavior`; `<NuxtRouteAnnouncer />` |
| `tests/nuxt/*.test.ts`, `tests/output/case-studies.test.ts`, `tests/e2e/case-studies.spec.ts`, `tests/e2e/case-nav.spec.ts` | Tests |

---

### Task 1: Test infrastructure and carry-forward test fixes

**Files:**
- **Modify `playwright.config.ts`:**
  - Set `reuseExistingServer: !process.env.CI`.
  - Move the e2e server to port `4317` in the `webServer` command, `url` and `baseURL`.
  - Port 4173 is shared with Vite preview, and a stray server there already caused a full failed run.
- **Create `tests/helpers/paths.ts`:** exports `repoPath(...parts: string[]): string`, resolved from `import.meta.url` (the repo root is two levels up).
- **Create `tests/helpers/image-size.ts`:** exports `imageSize(file: string): { width: number; height: number }`.
  - PNG: read IHDR.
  - JPEG: a marker scan that skips standalone markers (`0xD0`-`0xD9`, `0x01`) and fill bytes `0xFF`, and accepts SOF0-SOF3, SOF5-SOF7, SOF9-SOF11 and SOF13-SOF15.
  - Throw on an unknown format.
- **Modify `tests/nuxt/data.test.ts`:** use `repoPath` and `imageSize` everywhere. Remove the local JPEG/PNG parsing and the cwd-relative `join('public', ...)`.
- **Create `tests/e2e/helpers/axe.ts`:** exports `expectNoSeriousAxe(page: Page): Promise<void>`.
  - Wait for `document.getAnimations().map(a => a.finished.catch(() => {}))`.
  - Then run `new AxeBuilder({ page }).analyze()`.
  - Assert no violations with impact `serious` or `critical`.
  - Use it in place of the inline axe code in `tests/e2e/home.spec.ts`.
- **Modify `tests/e2e/smoke.spec.ts`:** the unknown-slug test drops the `!/404/` console filter. Instead, record `response` events and exclude only the document response for the requested URL.
- **Modify `tests/output/errors.test.ts`:** add `404 page links to the projects section`, asserting an `a[href="/projects"]`.

- [ ] **Step 1: Write the new `tests/nuxt/image-size.test.ts`.**
  - It asserts `imageSize` on every file in `public/images/**` against the sizes recorded in `projects.ts` (hero), plus `public/images/james.jpg` = 628x640.
  - It also checks a synthetic JPEG buffer containing an `0xFFD8` SOI, a fill byte and an SOF2 segment (write it to a temp file).
  - Run `fnm exec --using=24 -- npm test`. Expected: FAIL, because the helper doesn't exist.
- [ ] **Step 2: Implement the helpers and update `data.test.ts`.** Run `npm test`. Expected: PASS, no warnings.
- [ ] **Step 3: Apply the Playwright, axe-helper, smoke and errors changes.**
  - Run `fnm exec --using=24 -- sh -c "npm run generate && npm run test:output && npm run test:e2e"`. Expected: all pass, and the e2e run uses port 4317.
  - Then start `node -e "require('http').createServer((q,s)=>s.end('x')).listen(4173)"` in the background, run `npm run test:e2e` again, stop the dummy server, and expect PASS. This proves 4173 no longer matters.

### Task 2: Case study types, content and assets

**Files:**
- **Modify `app/types/project.ts`:**

```ts
export interface StepGroup { title: string; steps: { title: string; text: string }[] }
export type Architecture =
  | { kind: 'steps'; groups: StepGroup[] }
  | { kind: 'flow'; ariaLabel: string }            // rendered by RequestFlow.vue (Open Door only)
export interface ResultsData {
  ariaLabel: string                                 // e.g. "Open Door results table"
  columns: string[]                                 // header cells; first is the row-label column
  rows: { label: string; values: string[]; miss?: boolean }[]   // values.length === columns.length - 1
  note?: string
}
export interface Decision { title: string; text: string }       // title without the trailing period; render "<b>title.</b> text"
export interface CaseStudy {
  overview: string
  features: string[]
  howAiWorks: { intro: string; points: string[] }  // inline code marked with backticks, e.g. "`search_handbook`"
  architecture: Architecture
  results: ResultsData
  decisions: Decision[]
  gallery: Screenshot[]                             // caption required for gallery items
}
// Project gains: anchorId: 'opendoor' | 'packwright' | 'folio' | 'resumeiq'; caseStudy: CaseStudy
```

- **Modify `app/data/projects.ts`:** add `anchorId` and `caseStudy` for all four projects, ported verbatim from v11 (Open Door 594-679, Packwright 680-743, Folio 744-807, ResumeIQ 808-873).
  - **Case study hero:** reuses `project.hero`. If a v11 case study hero differs from the Home screenshot, add `caseHero?: Screenshot` and note it in the report.
  - **"How the AI works":** the intro is the section's `<p>`, and the points are its `<li>`s. Convert `<code>x</code>` to `` `x` ``.
  - **Results:**
    - Open Door's empty target cells become `''`.
    - Rows with `class="is-miss"` get `miss: true`.
    - The table note is verbatim.
  - **Gallery:** one entry per v11 `figure.g-item`, with src, width, height, alt and caption. Leave out v11's video stage and the `video-note` paragraph.
- **Copy** the gallery images from `.superpowers/brainstorm/18672-1794933570/content/` to `public/images/projects/`: `opendoor-confirm-card.png`, `opendoor-show-your-work.png`, `opendoor-ops-console.png`, `packwright-gs1-editor.png`, `folio-retrieved-context.jpg`, `folio-image-card.jpg`, `resumeiq-editor.png`, and any other file the v11 galleries reference.
- **Modify `app/components/ProjectBlock.vue`:** use `project.anchorId` instead of its local map. Update the test helper in `tests/output/home.test.ts` to read `anchorId` from data.
- **Test:** `tests/nuxt/case-data.test.ts`

- [ ] **Step 1: Write the failing tests.**

```ts
it('every project has a complete case study', () => { for (const p of projects) { const c = p.caseStudy; expect(c.overview.length).toBeGreaterThan(80); expect(c.features.length).toBeGreaterThanOrEqual(4); expect(c.howAiWorks.points.length).toBeGreaterThanOrEqual(3); expect(c.decisions.length).toBeGreaterThanOrEqual(3); expect(c.gallery.length).toBeGreaterThanOrEqual(1); for (const g of c.gallery) expect(g.caption).toBeTruthy() } })
it('architecture is a flow for Open Door and steps for the others', () => { expect(projectBySlug('open-door')!.caseStudy.architecture.kind).toBe('flow'); for (const s of ['packwright', 'folio', 'resumeiq']) expect(projectBySlug(s)!.caseStudy.architecture.kind).toBe('steps') })
it('results rows match the column count', () => { for (const p of projects) for (const r of p.caseStudy.results.rows) expect(r.values).toHaveLength(p.caseStudy.results.columns.length - 1) })
it('Open Door marks exactly the two missed targets', () => expect(projectBySlug('open-door')!.caseStudy.results.rows.filter(r => r.miss).map(r => r.values)).toEqual([['80%', '85%'], ['1,817 ms', '800 ms']]))
it('gallery images exist at their declared size', () => { /* imageSize(repoPath('public', g.src)) equals { width, height } for every gallery item */ })
it('anchor ids', () => expect(projects.map(p => p.anchorId)).toEqual(['opendoor', 'packwright', 'folio', 'resumeiq']))
it('case study copy has no em dashes, arrows or HTML entities', () => expect(JSON.stringify(projects.map(p => p.caseStudy))).not.toMatch(/[—→]|&#x?[0-9a-f]+;|&amp;|<\/?(b|code|li|p)>/i))
```

- [ ] **Step 2: Run `npm test`.** Expected: FAIL.
- [ ] **Step 3: Implement the types, the data, the asset copies and the ProjectBlock `anchorId` change.**
- [ ] **Step 4: Run `npm test`, then generate and run `test:output` and `test:e2e`.** Expected: PASS. The Home output must be unchanged, including section ids.

### Task 3: Shared component variants and `SectionLink`

**Files:**
- **Create `app/components/SectionLink.vue`:**
  - Props `{ to: '/' | '/projects' | '/contact'; ariaCurrent?: 'page' | 'location' }` plus a default slot.
  - It renders a plain `<a :href="to">` and moves into this component the header's `isPlainClick`, `pushForced` and heading-focus logic, with the same behavior.
  - When the current route isn't Home (for example a case study), a normal push plus a heading focus once the section is in view is enough. Keep one code path that works for both cases.
- **Modify `app/components/SiteHeader.vue`:** use `SectionLink` for Projects, Contact and the wordmark. Behavior is unchanged, and every Phase 2 e2e test must still pass.
- **Modify `app/components/ProofLinks.vue`:** add a prop `variant: 'home' | 'page'` (default `'home'`). `page` uses v11's `.proof--3` rules: 3 columns, and 1 column under a 420px container, with `margin-top: 0`.
  - **Accessibility:** for the `case` item, render a visually hidden project name so the link reads "Open Door case study, read" and not just "Case study read". Add a `projectName` prop. Keep the visible text unchanged.
- **Modify `app/components/StackList.vue`:**
  - Add a prop `variant: 'home' | 'page'`.
  - The 600-899px two-column rule applies only to `home`.
  - `page` applies `.stack--page` (`max-width: 780px`, larger rows and a wider label column).
- **Modify `app/components/BrowserFrame.vue`:**
  - Add a prop `as: 'figure' | 'div'` (default `'figure'`).
  - Port v11's `.frame video` rule as `:deep(video)`.
- **Modify `app/components/ProjectBlock.vue`:** pass `projectName` to `ProofLinks`.
- **Test:** additions to `tests/nuxt/ProofLinks.test.ts`, `tests/nuxt/StackList.test.ts` (new) and `tests/nuxt/BrowserFrame.test.ts` (new).

- [ ] **Step 1: Write the failing unit tests.**

```ts
it('page variant uses the 3-column proof grid and omits case study', async () => { const w = await mountSuspended(ProofLinks, { props: { items: proofItems(projects[0], 'page'), label: 'Open Door links', variant: 'page', projectName: 'Open Door' } }); expect(w.find('ul').classes()).toContain('proof--3'); expect(w.findAll('li')).toHaveLength(3) })
it('case study link has a hidden project name', async () => { /* home variant: the <a> contains a .sr-only span with text "Open Door"; visible text still contains "Case study" and "read" */ })
it('StackList page variant', async () => { /* variant page renders dl.stack.stack--page; home variant has no stack--page class */ })
it('BrowserFrame renders a div when asked', async () => { /* as: 'div' renders a root div.frame, default renders figure.frame */ })
```

- [ ] **Step 2: Run `npm test`.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run the full set:** `fnm exec --using=24 -- sh -c "npm run lint && npm run typecheck && npm test && npm run generate && npm run test:output && npm run test:e2e"`. Expected: all pass, with every Phase 2 test unchanged and green.

### Task 4: Case study page shell (header, tabs, intro, hero, TOC, simple sections, prev/next)

**Files (all new under `app/components/case/`, each `<style scoped>` with CSS ported from v11 246-364):**
- **`ProjectTabs.vue`:** props `{ current: ProjectSlug }`. `<ol class="ptabs">` of `NuxtLink`s to `/projects/<slug>`, with `aria-current="page"` on the current one.
- **`CaseHeader.vue`:** props `{ project }`.
  - `<section class="cs-head"><div class="wrap">` holding `<nav class="pnav" aria-label="Project pages">`, which contains `<SectionLink to="/projects" class="back">All projects</SectionLink>` and `ProjectTabs`.
  - Then `CaseIntro`.
  - Then the hero: `MediaStage.cs-hero > BrowserFrame(label=frameLabel, dark) > NuxtPicture`, eager, with `fetchpriority="high"`, AVIF/WebP and a prefixed `sizes` that covers the full content width (about 1180px max).
- **`CaseIntro.vue`:**
  - `.cs-intro` holding `p.p-label` (typeLabel) and `<h1 tabindex="-1" id="case-title">` (name).
  - `p.lede` (oneLine).
  - `ProofLinks variant="page"` with `proofItems(project, 'page')` and label "`<name>` links".
  - `.cs-intro` is the container query context.
- **`SectionToc.vue`:** props `{ sections: { id: string; title: string }[]; label: string }`. Renders `<nav class="toc" :aria-label="label"><ol>` with hash links.
- **`CaseSection.vue`:** props `{ id: string; n: number; title: string }`. Renders `<section class="cs-sec" :id :aria-labelledby="id + '-h'"><h2 :id="id + '-h'"><span class="sec-n">0n</span>title</h2><slot /></section>`.
- **`FeatureList.vue`:** a `ul.feat` from `string[]`, run through `InlineText`.
- **`DecisionList.vue`:** a `ul.plain-list` of `<li><b>{title}.</b> {text}</li>`.
- **`InlineText.vue`:** props `{ text: string }`. Splits on backticks and renders `<code>` for the odd segments. No `v-html`.
- **`PrevNext.vue`:** props `{ current: ProjectSlug }`.
  - `<nav class="prevnext" aria-label="More projects">` with two `NuxtLink`s.
  - Labels: "Previous project" and "Next project", each in a `<span>`, followed by the project name.
  - Order cycles open-door, packwright, folio, resumeiq (Open Door's previous is ResumeIQ).
- **Modify `app/pages/projects/[slug].vue`:**
  - Resolve the project; an unknown slug stays a fatal 404.
  - `useHead({ title: project.name })`.
  - Render `CaseHeader`, then `<div class="wrap cs-body">` with `SectionToc` and an `<article>` holding the sections with these ids and titles:
    1. `overview` "Overview"
    2. `features` "Key features"
    3. `how-ai-works` "How the AI works"
    4. `stack` "Tech stack"
    5. `architecture` "Architecture"
    6. `results` "Results and evals"
    7. `decisions` "Decisions and lessons"
    8. `media`: "Screenshots", or "Video and screenshots" when `links.video.enabled && src`
  - Then `PrevNext`.
  - In this task, fill overview (`<p>`), features, stack (`StackList variant="page"`) and decisions.
  - Sections 3, 5, 6 and 8 render a temporary empty `<p>`, which Task 5 replaces. The TOC already lists all eight.
- **Test:** `tests/output/case-studies.test.ts` (new) and `tests/e2e/case-studies.spec.ts` (new)

- [ ] **Step 1: Write the failing output tests**, looping over all 4 slugs.

```ts
test('case study shell for every project', () => { for (const p of projects) { const r = html(`projects/${p.slug}/index.html`); expect(r.querySelector('title')?.text).toContain(p.name); expect(r.querySelector('h1')?.text.trim()).toBe(p.name); expect(r.querySelector('.lede')?.text.trim()).toBe(p.oneLine); expect(r.querySelectorAll('.ptabs a').map(a => a.getAttribute('href'))).toEqual(projects.map(x => `/projects/${x.slug}`)); expect(r.querySelector(`.ptabs a[href="/projects/${p.slug}"]`)?.getAttribute('aria-current')).toBe('page'); expect(r.querySelector('.pnav a.back')?.getAttribute('href')).toBe('/projects') } })
test('eight numbered sections in order, mirrored by the toc', () => { for (const p of projects) { const r = html(`projects/${p.slug}/index.html`); const ids = r.querySelectorAll('article > section.cs-sec').map(s => s.id); expect(ids).toEqual(['overview', 'features', 'how-ai-works', 'stack', 'architecture', 'results', 'decisions', 'media']); expect(r.querySelectorAll('.toc a').map(a => a.getAttribute('href'))).toEqual(ids.map(i => `#${i}`)); expect(r.querySelectorAll('.sec-n').map(s => s.text)).toEqual(['01', '02', '03', '04', '05', '06', '07', '08']) } })
test('launch state on case studies: three disabled proof items, no video', () => { for (const p of projects) { const r = html(`projects/${p.slug}/index.html`); expect(r.querySelectorAll('.cs-intro .proof [aria-disabled="true"]')).toHaveLength(3); expect(r.querySelector('video')).toBeNull(); expect(r.querySelector('#media-h')?.text).toContain('Screenshots') } })
test('hero eager, prev/next cycle', () => { /* the hero img has no loading="lazy" and has fetchpriority="high"; prevnext hrefs: open-door -> [resumeiq, packwright], resumeiq -> [folio, open-door] */ })
```

- [ ] **Step 2: Write the failing e2e tests** in `tests/e2e/case-studies.spec.ts`:
  - `expectNoSeriousAxe` on all 4 case studies and on `/nope`.
  - No horizontal overflow at 360, 390, 768, 1024, 1280 and 1440 on all 4.
  - `.toc` is visible at 1280 and hidden at 1024.
  - The tabs are a 2x2 grid at 390 (two distinct `top` values).
- [ ] **Step 3: Run the suites.** Expected: FAIL.
- [ ] **Step 4: Implement.**
- [ ] **Step 5: Run the full set.** Expected: PASS. The Phase 1 and Phase 2 stub assertions on `/projects/<slug>` (for example "h1 is the name") still pass or are updated to the real page, each listed in the report.

### Task 5: Complex sections (how the AI works, architecture, results, media)

**Files (new under `app/components/case/`, scoped CSS from v11 246-364):**
- **`ArchitectureSteps.vue`:** props `{ groups: StepGroup[] }`. Renders `.steps-wrap`. Each group is a `div` with `p.steps-title` and an `ol.steps` of `<li><b>title</b>text</li>`.
- **`RequestFlow.vue`:** props `{ ariaLabel: string }`. The Open Door diagram ported from v11 lines 631-656: the `div.flow` with `role="img"` and `:aria-label`, and an inner `aria-hidden` grid. Node text is verbatim inside the component, with all of v11's flow, node, wire, branch, sub2 and node-label CSS, including the `max-width: 759px` stacking rules.
- **`ResultsTable.vue`:** props `{ table: ResultsData }`.
  - `<div class="table-wrap" role="region" tabindex="0" :aria-label>` around `<table class="score">`. Add `score--3` when there are 3 columns.
  - `thead` cells are `th scope="col"`. Each row's label is a `th scope="row"` and its values are `td.v`. Missed rows get `tr.is-miss`.
  - Then `p.table-note`.
- **`VideoPlayer.vue`:** props `{ src: string; poster: string; captions?: string; description?: string; label: string }`. Renders `<video controls preload="none" :poster :src :aria-label>`, with a `<track kind="captions" srclang="en" default>` when `captions` is set, and `p.video-note` with the description when set. Unused at launch (spec).
- **`ScreenshotGallery.vue`:** props `{ items: Screenshot[]; frameLabel: string }`. Renders `.gallery` with `figure.g-item`, each holding `BrowserFrame as="div"` and a `NuxtPicture` (lazy, AVIF/WebP, prefixed `sizes` for a roughly 3-up grid), followed by a `figcaption`.
- **`MediaSection.vue`:** props `{ project }`. When `links.video.enabled && src`, render `MediaStage.stage--video#video > BrowserFrame(label "Walkthrough") > VideoPlayer`. Always render `ScreenshotGallery`.
- **Modify `[slug].vue`:** fill section 3 (the `<p>` intro through `InlineText`, plus `FeatureList` of the points), section 5 (`ArchitectureSteps` or `RequestFlow` by `kind`), section 6 (`ResultsTable`) and section 8 (`MediaSection`).
- **Test:** `tests/nuxt/case-sections.test.ts` (new), plus additions to `tests/output/case-studies.test.ts` and `tests/e2e/case-studies.spec.ts`.

- [ ] **Step 1: Write the failing unit tests.**

```ts
it('InlineText renders backticks as code without v-html', async () => { const w = await mountSuspended(InlineText, { props: { text: 'Uses `search_handbook` and `check_time_off`.' } }); expect(w.findAll('code').map(c => c.text())).toEqual(['search_handbook', 'check_time_off']); expect(w.text()).toBe('Uses search_handbook and check_time_off.') })
it('ResultsTable marks misses and scopes headers', async () => { /* with Open Door results: 2 tr.is-miss; thead th scope=col count = 3; each tbody row has a th scope=row; the region has tabindex=0 and an aria-label */ })
it('MediaSection renders a player only when video is enabled', async () => { /* the launch-state project renders no <video> and no #video; a fixture with video { enabled: true, src: '/videos/x.mp4', poster: '/images/x.jpg', description: 'No sound.' } renders video[preload=none] inside #video and the description */ })
it('VideoPlayer adds a captions track when given', async () => { /* the captions prop renders track[kind=captions][srclang=en] */ })
```

- [ ] **Step 2: Write the failing output and e2e tests.**

```ts
// output
test('Open Door uses the request flow with an accessible label; others use steps', () => { const od = html('projects/open-door/index.html'); expect(od.querySelector('#architecture .flow[role="img"]')?.getAttribute('aria-label')).toBe(projectBySlug('open-door')!.caseStudy.architecture.ariaLabel); for (const s of ['packwright', 'folio', 'resumeiq']) expect(html(`projects/${s}/index.html`).querySelectorAll('#architecture ol.steps li').length).toBeGreaterThan(2) })
test('results tables match the data', () => { /* for each project: row count, header texts, miss rows, note text */ })
test('galleries: every image lazy, avif and webp, captioned', () => { /* count equals gallery.length; each figure.g-item has a figcaption with the caption text and a picture with avif and webp sources; img loading=lazy */ })
```

```ts
// e2e
test('results table scrolls inside its region at 360', async ({ page }) => { await page.setViewportSize({ width: 360, height: 800 }); await page.goto('/projects/open-door'); const r = page.locator('#results .table-wrap'); expect(await r.evaluate(e => e.scrollWidth > e.clientWidth)).toBe(true); expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0); await r.focus(); await expect(r).toBeFocused() })
test('request flow stacks on phones and keeps its label', async ({ page }) => { /* at 390: .node-label elements are visible and .branch is hidden; at 1280: .branch visible, .node-label hidden; role=img with a non-empty aria-label in both */ })
```

- [ ] **Step 3: Run the suites.** Expected: FAIL.
- [ ] **Step 4: Implement.**
- [ ] **Step 5: Run the full set.** Expected: PASS.

### Task 6: Navigation, focus and the final 404

**Files:**
- **Modify `app/router.options.ts`** (keep the order already learned from Phase 2):
  1. A saved position restores with `behavior: 'instant'`.
  2. A hash scrolls to that element with `behavior` smooth, or instant under reduced motion, and must honor `scroll-margin-top`. vue-router's `el` scroll ignores it, so compute `top` from `getBoundingClientRect().top + scrollY - scrollMarginTop`, or call `scrollIntoView`.
  3. A section path scrolls to that section.
  4. A same-path, non-hash change returns `false`.
  5. Otherwise `{ top: 0, behavior: 'instant' }`.
  - Steps 2, 3 and 5 wait for the new page to render first: return a Promise that resolves on Nuxt's `page:loading:end` hook (or `page:finish`, matching Nuxt's default router options in `node_modules/nuxt/dist/pages/runtime/router.options.js`), with a short timeout fallback.
- **Modify `app/pages/projects/[slug].vue`:** after a client-side navigation into a case study (not on the first, hydrating load), focus `#case-title` with `preventScroll: true`.
- **Modify `app/app.vue`:** add `<NuxtRouteAnnouncer />`.
- **Modify `app/error.vue`:**
  - Inside the layout, use `<div class="wrap error-page">` with v11-consistent spacing: padding like `.cs-head`, the h1 at `--t-h2` size, and a paragraph.
  - A 404 shows "Page not found" and "That page doesn't exist or has moved."
  - Any other status shows the h1 "Something went wrong" and the paragraph "Try the home page, or reload in a moment."
  - The two links render as an `.actions` row of `.btn`s: "Go to the home page" (`NuxtLink to="/"`, `btn--primary`) and "See the projects" (`SectionLink to="/projects"`).
  - `noindex` stays exactly once (the existing output test).
- **Test:** `tests/e2e/case-nav.spec.ts` (new), plus additions to `tests/output/errors.test.ts`.

- [ ] **Step 1: Write the failing e2e tests.**

```ts
test('case study opens at the top and Back restores Home', async ({ page }) => { await page.goto('/'); await expect.poll(async () => { await page.evaluate(() => window.scrollTo(0, 2200)); return page.evaluate(() => window.scrollY) }).toBeGreaterThan(2100); await page.locator('#folio h2 a').evaluate(a => (a as HTMLAnchorElement).click()); await expect(page).toHaveURL('/projects/folio'); await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(10); await page.goBack(); await expect(page).toHaveURL('/'); await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(2150) })
test('focus moves to the case study heading', async ({ page }) => { await page.goto('/'); await page.locator('#packwright h2 a').click(); await expect(page.locator('#case-title')).toBeFocused() })
test('route announcer announces the new page', async ({ page }) => { /* after the client navigation above, the [aria-live] route announcer element contains "Packwright" */ })
test('toc and direct hash land on the section heading', async ({ page }) => { await page.setViewportSize({ width: 1280, height: 800 }); await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/projects/folio'); await page.locator('.toc a[href="#results"]').click(); await expect.poll(() => page.locator('#results-h').evaluate(e => e.getBoundingClientRect().top)).toBeGreaterThanOrEqual(0); expect(await page.locator('#results-h').evaluate(e => e.getBoundingClientRect().top)).toBeLessThan(80); await page.goto('/projects/folio#results'); await expect.poll(() => page.locator('#results-h').evaluate(e => { const t = e.getBoundingClientRect().top; return t >= 0 && t < 80 })).toBe(true) })
test('tabs and prev/next navigate between case studies at the top', async ({ page }) => { /* from /projects/open-door scrolled down: click the Folio tab, URL /projects/folio, scrollY < 10, h1 focused; click "Next project" goes to /projects/resumeiq */ })
test('All projects returns to the Home projects section with focus', async ({ page }) => { /* from /projects/folio click .back: URL /projects, #projects in view, #projects-h focused */ })
test('404 page actions', async ({ page }) => { /* /nope: h1 "Page not found", two .btn links with the right hrefs, each at least 44px tall; "See the projects" lands on /projects with #projects-h focused */ })
```

- [ ] **Step 2: Add the output test** `error page uses button actions`: `404.html` has `.actions a.btn` hrefs `['/', '/projects']`.
- [ ] **Step 3: Run the suites.** Expected: FAIL (note any that already pass).
- [ ] **Step 4: Implement.**
- [ ] **Step 5: Run the full set twice in a row.** Expected: both runs pass. Every Phase 2 navigation test still passes.

### Task 7: Phase gate and visual check

- [ ] **Step 1: Full gate.** Run `fnm exec --using=24 -- sh -c "npm run lint && npm run typecheck && npm test && npm run generate && npm run test:output && npm run test:e2e"`. Expected: every command exits 0, and the `npm test` output has no warnings.
- [ ] **Step 2: Copy checks.**
  - Run `grep -rn "—\|→" app scripts nuxt.config.ts`. Expected: no matches.
  - Run `grep -rniE "colour|organis|behaviour|favourite|centre" app tests scripts nuxt.config.ts`. Expected: no matches.
  - Run `/usr/bin/grep -rlE "mailto:|jameslittlefield3@" .output/public --include=*.html`. Expected: no matches.
- [ ] **Step 3: Visual check against v11.**
  - Serve the build with `fnm exec --using=24 -- node scripts/serve-static.mjs .output/public 4183`, and stop it afterward.
  - With Playwright (script in `/tmp`, reduced motion, `fullPage`), screenshot every case study at 390, 820 and 1440 to `.superpowers/brainstorm/shots/phase3-<slug>-<width>.png`.
  - Screenshot the mockup at the same widths from `file://.../v11-product-showcase.html?chrome=0&project=<anchorId>` to `.superpowers/brainstorm/shots/v11-<slug>-<width>.png`.
  - Compare each pair with the Read tool. Crop with `sips` when a full page is too tall to judge.
  - Allowed differences:
    - Section 08 is titled "Screenshots", with no video stage and no video note.
    - Frame labels are project names.
    - There's no mockup control bar.
    - The "Case study" links have hidden text (it isn't visible).
  - Fix anything else in component CSS and re-run the gate. Report anything that can't match as a concern, with the paths.
- [ ] **Step 4: Stop.** Report the tests, the screenshots and any remaining differences. The controller presents the phase to James and proposes the commit, which runs only on his explicit OK.

```bash
git add -A
git commit -m "Add the case study pages and final 404 (phase 3)"
```
