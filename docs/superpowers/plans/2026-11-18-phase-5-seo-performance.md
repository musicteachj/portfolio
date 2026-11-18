# Phase 5: SEO and Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every indexable page (Home and the 4 case studies) ships complete, unique metadata:
- a title and meta description
- a self canonical
- Open Graph and Twitter tags
- a 1200x630 share image
- structured data

The sitemap, robots.txt and llms.txt describe exactly those 5 pages. Both pages score at least 95 in all four Lighthouse categories on mobile. Close the Phase 5 items in the carry-forward notes.

**Architecture:**
- **One gate script.** `scripts/check-seo.ts` holds every Verification step 3 check, each as a named function over a small `OutputReader`. It runs on the real `.output/public` (CLI and an output test) and on in-memory fixtures (negative tests). Each task adds the checks for what it builds.
- **Metadata from approved copy.** Page metadata is derived from copy already approved in v11, so there is no new marketing copy:
  - title: `${name}: ${typeLabel}`
  - description: the case study lede (`oneLine`), or `site.lede` for Home
- **Module config, not hand-written tags.** The @nuxtjs/seo modules are configured rather than hand-writing tags.

**Tech Stack:** Nuxt 4.6 static generate, @nuxtjs/seo 6:
- nuxt-site-config
- @nuxtjs/sitemap 9
- @nuxtjs/robots 7
- nuxt-schema-org 7
- nuxt-og-image 7 with `@takumi-rs/core`
- nuxt-ai-ready 3

Also @nuxt/image 2, `node-html-parser`, `sharp` (already installed through @nuxt/image), Lighthouse (new dev dependency), Vitest 5 and Playwright.

**Spec:** `docs/superpowers/specs/2026-11-17-portfolio-rewrite-design.md`. Read "SEO", "Performance", Phase 5 in "Phased development plan", and Verification items 3, 6 and 7.

**Carry-forward:** `docs/superpowers/plans/2026-11-17-phase-1-carry-forward.md`. Every Phase 5 item and every "Later polish" item there is accounted for below, either built or ruled on.

## Global Constraints

- **Node:** run every `node`/`npm`/`npx` command as `fnm exec --using=24 -- <command>`.
- **Git:** never `git commit`, `git push`, `git add`, `git stash`, `git checkout` or `git restore`, and never open a PR. The controller stages approved work. The phase ends with one proposed commit that needs James's explicit OK.
- **Secrets:** never print `.env` values or the EmailJS config values.
- **Site:** `url: https://jameslittlefield.net`, name "James Littlefield", `trailingSlash: false`, title template `%s | James Littlefield`.
- **Home title:** "James Littlefield, AI Engineer", with the template off (already done).
- **Share images:** 1200x630.
  - Use `defineOgImage('Card', …)`, never `ogImage` in `useSeoMeta`.
  - Keep the `@takumi-rs/core` renderer and `ogImage.zeroRuntime: true`.
- **Structured data:**
  - `Person` (name, jobTitle "AI Engineer", url, image, `sameAs` GitHub and LinkedIn, **no email**) and `WebSite` site-wide.
  - Each case study adds `CreativeWork` (author = the Person) and `BreadcrumbList`.
  - Not `SoftwareApplication`.
- **Indexable URLs:** exactly 5: `https://jameslittlefield.net/` and `/projects/{open-door,packwright,folio,resumeiq}`.
  - `/projects` and `/contact` keep canonical `/` and appear in no sitemap, `llms.txt` or `.md` list.
  - `404.html` stays `noindex`.
- **robots.txt:**
  - Allows everything, explicitly including `GPTBot`, `ClaudeBot` and `PerplexityBot`.
  - Has a `Sitemap:` line.
- **Email address:**
  - It appears in no output file except the named exception `resume.pdf`, pending James's decision.
  - `mailto:` appears in no HTML, JSON, Markdown, XML or TXT output.
- **Copy:** American English, no em dashes anywhere (comments included), no "→" or " · " in copy, sentence case.
- **Design:**
  - The v11 look stays.
  - Motion stays limited to the intro "settle" and the Send spinner, respecting `prefers-reduced-motion`.
  - Scoped CSS and tokens only.
- **Screenshots:** never cropped. AVIF and WebP via `NuxtPicture`, with every `sizes` entry prefixed.

## Decisions this plan makes

- **Metadata comes from approved copy** (title `${name}: ${typeLabel}`, description `oneLine`). The spec's `seo` data field becomes a derived helper, so the copy lives in one place. James can edit the lede or type label to change both.
- **Breadcrumbs:** "James Littlefield" (`/`) then the project name. `/projects` isn't used, because it canonicalizes to `/`.
- **Gallery over-fetch:** the slight over-fetch between 1100 and 1180px stays (the column is a little narrower than 864px there). Revisit only if Lighthouse flags it.
- **Legacy `<img>` fallback stays PNG.** Only browsers without AVIF and WebP fetch it, and Lighthouse's Chrome never does. Revisit only if Lighthouse flags it.
- **`sitemap.md` is turned off.** Markdown content negotiation is turned off, because static output can't do it (this also silences the generate warning).
- **Later polish:**
  - Phase 5 builds R2 (a direct landing on a case study hash should jump, not glide; this matters for shared deep links) and M7 (keep a half-typed contact draft across client navigation).
  - It leaves R1 (Back/Forward glides within a page) and M4 (stalled send) parked to launch prep, with their notes.
  - M5 (blocked site storage) is accepted: it needs a browser with site data blocked, and the failure copy already offers direct email.
- **Résumé PDF:** the named exception stays until James decides. Replacing the PDF is a file swap plus deleting one array entry.

## Review Focus

1. **A recruiter pastes a case study link into LinkedIn or Slack.**
   - The preview shows that project's own title, description and image.
   - The image is an absolute `https://jameslittlefield.net/_og/...png` URL to an existing 1200x630 file.
   - (Task 2)
2. **Search engines see `/projects` or `/contact` as duplicates of Home.** They must canonicalize to `/` and appear in no sitemap, llms.txt or Markdown list. (Task 4)
3. **Structured data that's invalid JSON, or that contains the email address.** Every page's JSON-LD parses, and no node anywhere has an `email` key. (Task 3)
4. **A real page marked noindex, or the 404 page marked indexable.** All 5 pages carry `index, follow` and `404.html` carries `noindex`. (Tasks 1 and 4)
5. **A phone on a slow network.**
   - The case study hero is preloaded and fetches no candidate wider than its source.
   - The intro settle doesn't hold the LCP element invisible.
   - (Tasks 5 and 6)

---

### Task 1: check-seo foundation and page metadata

**Files:**
- Create: `scripts/check-seo.ts`, `app/utils/seo.ts`, `tests/output/check-seo.test.ts`
- Modify: `app/pages/index.vue`, `app/pages/projects/[slug].vue`, `package.json` (script `"check-seo": "node scripts/check-seo.ts"`), `tsconfig.tooling.json` (include `scripts/**/*.ts`)

**Interfaces:**
- **Produces, in `scripts/check-seo.ts`** (single file, imports only node builtins and `node-html-parser`, so Node 24 runs it directly):
  - `interface OutputReader { list(): string[]; read(rel: string): Buffer; exists(rel: string): boolean }`: relative POSIX paths, recursive.
  - `readOutput(dir: string): OutputReader` and `memoryOutput(files: Record<string, string | Uint8Array>): OutputReader`
  - `interface Check { name: string; run(out: OutputReader): string[] }`: returns problem messages, each naming the file.
  - `checks: Check[]` and `checkSeo(out: OutputReader): string[]` (all problems from all checks)
  - `INDEXABLE = ['index.html', 'projects/open-door/index.html', 'projects/packwright/index.html', 'projects/folio/index.html', 'projects/resumeiq/index.html']`
  - `ALIASES = ['projects/index.html', 'contact/index.html']`
  - `SITE = 'https://jameslittlefield.net'`
  - CLI, when run directly: print each problem and exit 1, or print `check-seo: N checks passed` and exit 0.
- **Produces, in `app/utils/seo.ts`:** `projectSeo(p: Project): { title: string; description: string }` returning `` { title: `${p.name}: ${p.typeLabel}`, description: p.oneLine } ``.

- [ ] **Step 1: Write failing tests** in `tests/output/check-seo.test.ts`.
  - `the built site passes check-seo`: `expect(checkSeo(readOutput('.output/public'))).toEqual([])`.
  - For each check this task adds, one negative test on a `memoryOutput` fixture proving the check reports the defect:
    - **`titles`:** each indexable page has exactly one non-empty `<title>`, and the 5 are unique. Each alias page's title equals `index.html`'s.
    - **`descriptions`:** each indexable page has exactly one non-empty `meta[name=description]` and a matching `og:description`, and they are unique. Aliases match Home.
    - **`canonicals`:** each indexable page has exactly one canonical, equal to its own URL (`${SITE}/` or `${SITE}/projects/<slug>`). Aliases point to `${SITE}/`.
    - **`robots-meta`:** indexable pages and aliases don't contain `noindex`. `404.html` exists, has an h1 with text, and contains `noindex`.
    - **`body-text`:** each indexable page has exactly one `<h1>`, and its `<main>` has at least 200 characters of text in the raw HTML.
    - **`images`:** every `<img>` on the 5 pages has an `alt` attribute and numeric `width` and `height`.
    - **`copy-rules`:** the visible text of the 5 pages and `404.html` contains no em dash, no "→" and no " · ". The HTML contains no `colour`, `organis` or `behaviour` (case-insensitive).
  - A unit test in `tests/nuxt/seo.test.ts`: `projectSeo(projectBySlug('folio')!)` equals `{ title: 'Folio: RAG brand content studio', description: <its oneLine> }`.
- [ ] **Step 2: Run** `npm run generate`, then `npm run test:output -- check-seo`. Expect FAIL: no descriptions, and the case study cards are `summary`.
- [ ] **Step 3: Implement.**
  - `[slug].vue`: replace `useHead({ title })` with `useSeoMeta({ title, description, ogDescription: description })` from `projectSeo`.
  - `index.vue`: add `useSeoMeta({ description: site.lede, ogDescription: site.lede })`, keeping its pinned title, canonical and `titleTemplate`.
- [ ] **Step 4: Run** `npm run generate`, `npm run test:output`, `npm test` and `fnm exec --using=24 -- npm run check-seo`. Expect PASS, and the CLI prints the pass line.

### Task 2: Share images for all five pages

**Files:**
- Modify: `app/components/OgImage/Card.takumi.vue`, `app/pages/projects/[slug].vue`, `nuxt.config.ts` (only if needed to drop `_og-static-fonts/`), `scripts/check-seo.ts`, `tests/output/check-seo.test.ts`

**Interfaces:**
- Consumes: `projectSeo` and the check-seo API (Task 1).
- Produces: `Card` props `{ title: string; eyebrow: string; image?: string }`, with `title` and `eyebrow` required and no defaults. `image` is a site-relative public path, for example `/images/projects/opendoor-cited-answer.png`.

- [ ] **Step 1: Write failing checks and negative tests.**
  - **`og-images`:** on each indexable page and alias, exactly one `og:image` that starts with `${SITE}/_og/`, and `og:image:width` 1200 and `og:image:height` 630. The referenced file exists, and its PNG header reads 1200x630 (read the IHDR from the Buffer). The 5 indexable pages use 5 different files. Aliases use Home's.
  - **`og-screenshot`:** each case study image shows its screenshot. Use `sharp` on the right half: the channel standard deviation is above a threshold you calibrate against Home's text-only card, then record both numbers in a comment.
  - **`twitter-card`:** the 5 indexable pages and the aliases have `twitter:card` = `summary_large_image`.
- [ ] **Step 2: Run** and confirm the failures.
- [ ] **Step 3: Implement.**
  - **`Card.takumi.vue`:**
    - Required props.
    - Palette A tokens as literals (paper `#F7F7F4`, accent `#12354E`, soft `#A5C8D1`, ink `#141614`, ink-3 `#5F655F`).
    - Layout: the eyebrow (type label) and title on the left. When `image` is given, the screenshot on the right, uncropped (`object-fit: contain`), on a soft `#A5C8D1` panel with rounded corners, like v11's `.stage`.
    - Home keeps `{ title: 'James Littlefield', eyebrow: 'AI Engineer' }`.
  - **`[slug].vue`:** `defineOgImage('Card', { title: project.name, eyebrow: project.typeLabel, image: project.hero.src })`.
  - **If takumi can't embed a public image** after trying the module's documented way: stop and report DONE_WITH_CONCERNS with what you tried. The controller rules between a text-only card and the spec's hand-built `public/og/` fallback.
  - **`_og-static-fonts/`** (unused Inter TTFs): drop it if a module option allows. If not, leave it and add a Phase 6 sync-exclusion line to the carry-forward notes.
- [ ] **Step 4: Verify.**
  - Regenerate and run `test:output` and `check-seo`. Expect PASS.
  - Open the 5 PNGs and check them by eye: no clipped text, the screenshot uncropped.
  - Report their paths.

### Task 3: Structured data

**Files:**
- Modify: `nuxt.config.ts` (`schemaOrg.identity`), `app/pages/projects/[slug].vue`, `scripts/check-seo.ts`, `tests/output/check-seo.test.ts`

**Interfaces:**
- Consumes: `site` (`githubUrl`, `linkedinUrl`, `name`, `role`) and the check-seo API.

- [ ] **Step 1: Write failing checks and negative tests.**
  - **`json-ld`:** every `script[type="application/ld+json"]` on the 5 pages and aliases parses as JSON.
    - No object anywhere in any graph has an `email` key. Walk the graph recursively.
    - Every page's graph has one `WebSite` and one `Person`:
      - `name` "James Littlefield"
      - `jobTitle` "AI Engineer"
      - `url` `${SITE}/`
      - `image`: an absolute `${SITE}/...` URL to the portrait
      - `sameAs` equal to `[githubUrl, linkedinUrl]`
  - **`case-study-schema`:** each case study graph has:
    - a `CreativeWork` whose `name` is the project name and whose `author` references the Person's `@id`
    - a `BreadcrumbList` with exactly 2 items: "James Littlefield" at `${SITE}/`, then the project name at its own URL
- [ ] **Step 2: Run** and confirm the failures.
- [ ] **Step 3: Implement.**
  - **`nuxt.config.ts`:** `schemaOrg: { identity: definePerson({...}) }`, or the equivalent the installed nuxt-schema-org 7 documents. The image is the portrait's absolute URL (`/images/james.jpg` resolved against the site).
  - **`[slug].vue`:** `useSchemaOrg([defineCreativeWork({ name, description, image: hero, author: { '@id': <Person @id> } }), defineBreadcrumb({ itemListElement: [...] })])`.
- [ ] **Step 4: Verify.**
  - Regenerate and run `test:output` and `check-seo`. Expect PASS.
  - Paste one case study's JSON-LD into the report.

### Task 4: Sitemap, robots.txt, llms.txt, and the output privacy scan

**Files:**
- Modify: `nuxt.config.ts` (`sitemap`, `robots`, `aiReady`), `scripts/check-seo.ts`, `tests/output/check-seo.test.ts`, `tests/output/privacy.test.ts` (its two scan tests move into check-seo; its lazy-load SDK test stays)

**Interfaces:**
- Consumes: the check-seo API.
- Produces: check-seo constants `EMAIL_NEEDLE = 'jameslittlefield3@'` and `EMAIL_ALLOWED = ['resume.pdf']`. A unit test asserts `EMAIL_NEEDLE === site.emailUser + '@'`.

- [ ] **Step 1: Write failing checks and negative tests.**
  - **`sitemap`:** `sitemap.xml` has exactly the 5 indexable `<loc>` URLs (no `/projects`, `/contact` or `.md`), and every `<image:loc>` maps to an existing output file.
  - **`robots-txt`:**
    - `robots.txt` allows `/` for `*`.
    - It has a group naming each of `GPTBot`, `ClaudeBot` and `PerplexityBot` that allows `/`.
    - It contains `Sitemap: ${SITE}/sitemap.xml`.
    - It has no `Disallow: /` for any of those agents.
  - **`llms`:**
    - `llms.txt` lists exactly the 5 indexable pages.
    - No `projects.md`, `contact.md` or `sitemap.md` file exists.
    - Every `link[rel=alternate][type="text/markdown"]` on any page points to an existing file.
  - **`email-address`:** the privacy scan moved here.
    - No file under the output (as Buffers) contains `EMAIL_NEEDLE`, except the paths in `EMAIL_ALLOWED`, each of which must exist.
    - No `.html`, `.json`, `.md`, `.xml` or `.txt` file contains `mailto:`.
- [ ] **Step 2: Run** and confirm the failures.
- [ ] **Step 3: Implement.**
  - **Sitemap:** exclude `/projects` and `/contact`.
  - **Robots:** add a group for the three AI agents allowing `/`.
  - **nuxt-ai-ready:**
    - `contentNegotiation: false`, `botNegotiation: false`, `sitemapMd: false`.
    - Exclude `/projects` and `/contact` from the Markdown copies and `llms.txt`. Use the module's route-level switch if one exists (check `node_modules/nuxt-ai-ready/dist/runtime/types.d.ts` and its README). Otherwise, remove them in a build hook and drop their `alternate` links.
  - **Generate output:** must show no Markdown negotiation warning.
- [ ] **Step 4: Verify.**
  - Regenerate and run `test:output`, `check-seo` and `npm test`. Expect PASS.
  - Paste the final `robots.txt` and `llms.txt` into the report.

### Task 5: Image delivery and list semantics

**Files:**
- Modify: `app/components/IntroHero.vue`, `app/components/case/CaseHeader.vue`, `app/components/ProjectBlock.vue`, the components with `list-style: none` lists (ProjectTabs, SectionToc, FeatureList and DecisionList where plain, ArchitectureSteps, ProofLinks), `tests/output/home.test.ts:63`, `tests/nuxt/data.test.ts`, `tests/e2e/case-studies.spec.ts`, `tests/e2e/home.spec.ts`

- [ ] **Step 1: Write failing tests.**
  - **Portrait:** `public/images/james.jpg` has its declared width and height (`imageSize` helper). The rendered portrait is a `<picture>` with AVIF and WebP sources.
  - **Hero srcset:** in each case study's HTML, every hero `srcset` candidate width is at most the source width (1800). The hero has a `link[rel=preload][as=image]` (with `imagesrcset`) or the equivalent the module emits.
  - **Home sizes:** `home.test.ts:63` asserts the exact `sizes` string instead of `toContain('100vw')`.
  - **e2e "srcset honesty"** (the gallery test's pattern, in `home.spec.ts` and `case-studies.spec.ts`):
    - At 1440 (DPR 1 and 2) and at 390 (DPR 3), the Home screenshots and the case study hero each pick a source at least 0.95x the rendered need, or the original file.
    - At 1440 DPR 1, none picks more than 1.6x the need.
  - **Lists:** every `ul` and `ol` with computed `list-style-type: none` inside `main` has `role="list"`. Check in e2e on Home and one case study.
- [ ] **Step 2: Run** and confirm the failures.
- [ ] **Step 3: Implement.**
  - Portrait to `NuxtPicture` with `format="avif,webp"`, keeping eager loading and `fetchpriority="high"`.
  - Hero `sizes` and screens set so that no candidate exceeds 1800, plus the hero preload (`preload` prop).
  - `ProjectBlock` `sizes` tightened to the measured rendered widths.
  - `role="list"` on those lists.
- [ ] **Step 4: Verify.** Regenerate and run the full gate: lint, typecheck, unit, output, check-seo and e2e. Expect PASS.

### Task 6: Lighthouse at 95 or above

**Files:**
- Create: `scripts/lighthouse.mjs`
- Modify: `package.json` (dev dependency `lighthouse`, script `"lighthouse": "node scripts/lighthouse.mjs"`), `.gitignore` (`.lighthouse/`), plus whatever the audits show must change

**Interfaces:**
- **Produces:** `npm run lighthouse`.
  - It serves `.output/public` with `scripts/serve-static.mjs` on port 4319.
  - It runs Lighthouse (mobile preset, default simulated throttling) with Playwright's Chromium (`chromium.executablePath()`) on `/` and `/projects/open-door`.
  - It writes JSON and HTML reports to `.lighthouse/`.
  - It prints the four scores per page.
  - It exits 1 if any score is below 0.95.

- [ ] **Step 1: Write the script and run it.** Record the baseline scores and the failing audits in the report.
- [ ] **Step 2: Fix what blocks 95, within the Global Constraints.** Expected suspects:
  - **The intro settle** (`IntroHero.vue:60-67`) holds every intro child at `opacity: 0` for up to 900ms. If the LCP element is in the intro and its render delay comes from the settle, the LCP element must not start invisible. For example, keep the 8px rise but start it at full opacity, or exclude it from the opacity part. All other intro children keep v11's settle.
  - **robots.txt:** if Lighthouse flags it, for example for the `Content-Signal` line, drop that line through the module option.
  - **Anything else:** fix it the smallest way, and name it in the report.
- [ ] **Step 3: Verify.**
  - Run `npm run lighthouse` 3 times. All 4 categories must be at least 0.95 on both pages every time.
  - Then run the full gate. Expect PASS.

### Task 7: Deep-link landing and the contact draft (later polish)

**Files:**
- Modify: `app/router.options.ts`, `app/assets/css/base.css` (only if needed), `app/components/ContactForm.vue`, `tests/e2e/case-nav.spec.ts`, `tests/e2e/contact.spec.ts`, the carry-forward notes

- [ ] **Step 1: Write failing e2e tests.**
  - **`a direct landing on a case study hash jumps there`:**
    - `goto('/projects/folio#results')` with default motion. Record scroll positions from the earliest point (an init script).
    - After hydration and idle, `#results` is at its scroll margin, and no recorded scroll position lies strictly between 10 and the target minus 10.
  - **`a half-typed message survives a visit to a case study`:**
    - Type into all four fields on `/contact`.
    - Client-navigate to `/projects/folio` through a Case study link, then `goBack()`.
    - The four values are still there.
    - After a successful send (intercepted), a later visit shows empty fields.
- [ ] **Step 2: Run** and confirm the failures.
- [ ] **Step 3: Implement.**
  - **R2, the hash landing:**
    - Make the first-load scroll to a hash instant, including Nuxt's second `scrollBehavior` call on prerendered pages.
    - Treat any call made while the app is hydrating as the first load.
    - Stop the browser's own fragment jump from animating on load. For example, apply `scroll-behavior: smooth` through a class `base.css` keys on, added after hydration.
    - Correct the step 2 comment in `router.options.ts`.
    - Every existing navigation test must stay green.
  - **M7, the draft:** keep `fields` in `useState('contact-draft', …)`, reset by the existing success path. The honeypot is not kept.
- [ ] **Step 4: Verify.**
  - Run the full gate, plus `npx playwright test section-nav case-nav contact --repeat-each=10` with zero failures.
- [ ] **Step 5: Update the carry-forward notes.**
  - Mark Phase 5 and its items done. Name how each was handled, including the PNG fallback and gallery band rulings.
  - Remove R2 and M7 from "Later polish".
  - Mark M5 accepted.
  - Keep R1 and M4, retitled "Launch prep".
  - Add any Phase 6 items found, for example `_og-static-fonts/` and the `.lighthouse/` ignore.

### Review stop (controller with James)

- Show James:
  - the 5 share images
  - one case study's preview in a link-preview checker run locally, or the raw tags if none is available
  - the Lighthouse scores
- Ask for his résumé decision: keep the PDF as the named exception, or send a version without the address.
