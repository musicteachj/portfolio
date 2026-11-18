# Carry-forward notes (Phases 1 to 5)

Phase 1 ("Foundation and tracer bullet") is committed as `184d060`. These are the findings from its task reviews and its final whole-phase review that were deliberately left to later phases. The plan for each phase must account for the items listed under it.

## Facts learned in Phase 1 (use these, not the original plan's guesses)

- **Fonts:** `@nuxt/fonts` 1.2.0 serves fonts from `/_nuxt/fonts/*.woff2`. These are hashed build assets, not `/_fonts/`.
- **Images:** IPX output paths look like `_ipx/f_<avif|webp|png>&s_<W>x<H>/images/...png`.
  - The `.png` extension stays even when the file contains AVIF or WebP data.
  - An unprefixed entry in `sizes`, such as `100vw`, produces junk 1w and 2w srcset candidates. Prefix every entry (`xs:100vw sm:100vw md:50vw`).
  - `image.screens` is merged with the module defaults (xl 1280 and 2xl 1536 stay unless overridden).
- **Section URLs:** `definePageMeta({ alias: ['/projects', '/contact'], key: 'home' })`.
  - The `key` stops a remount when navigating between `/`, `/projects` and `/contact`.
  - The Home canonical is pinned with `useHead` link key `canonical`.
- **404 page:** prerendered via `experimental.prerenderErrorPages: [404]`. `@nuxtjs/robots` hard-codes the robots meta on `/404.html`, and a nitro `prerender:generate` hook removes the duplicate.
- **OG image:** nuxt-og-image v7 API is `defineOgImage('Card', props)`. The PNG lands at `/_og/s/o_<hash>.png`. The module's default height is 600, so 630 is set explicitly.
- **Lint and aliases:** the `link-checker/valid-route` lint rule doesn't know about route aliases, so links to `/projects` and `/contact` currently need an eslint-disable. Decide once, in Phase 2.
- **Shell grep:** `grep` in this environment skips binary files. Use `/usr/bin/grep -a`, or read Buffers, when checking output for strings.

## Phase 2 (Home page): done

Every item below was closed in Phase 2.


- Add an e2e test proving that client navigation between `/`, `/projects` and `/contact` doesn't remount Home. For example, typed text in a contact field survives a nav click.
- Retune `image.screens` to match the CSS breakpoints (the screenshot sits beside the text from 900px), and override xl/2xl explicitly. Remove redundant `sizes` entries.
- Set the Home title in `index.vue` so `/projects` and `/contact` don't get the inferred titles "Projects | ..." and "Contact | ...". Add an output assertion.
- Assert that `/projects` has exactly one canonical pointing at the root after hydration.
- Use `withSiteUrl('/')` instead of the hard-coded origin in `index.vue`.
- **Tests:**
  - Make `npm test` output pristine. Currently "SSR is disabled" warnings print from the Nuxt test environment.
  - Replace the vitest `process.argv` sniff in `vitest.config.ts`.
  - Bring tests under typecheck: `nuxt typecheck` only covers `app/**`, `nuxt.config.*` and `tests/nuxt/**`. Use `tests/nuxt/` or add a tests tsconfig.
- Remove the tracer-only `console.log` and the wrapper `<div>` in `index.vue` once real components exist.

## Phase 3 (Case studies and 404): done

- In the unknown-slug e2e test, replace the `!/404/` console filter with a check that excludes only the document response.
- Add a test that the 404 page links to `/projects`.
- Height rounding: IPX's 1800w file is 1798x1125. That's fine, but don't assert exact IPX dimensions.

## Phase 5 (SEO and performance): done

Every item below was handled in Phase 5, as noted. Only the résumé decision is still open.

- Keep `/projects` and `/contact` out of `sitemap.xml`.
  - Done with `sitemap.exclude`. The `sitemap` check in `scripts/check-seo.ts` requires exactly the 5 indexable URLs.
- `nuxt-ai-ready` emits `llms.txt`, `llms-full.txt` and `.md` copies of each page (including `projects.md` and `contact.md`, each with its own `canonical_url`), plus a generate warning about Markdown negotiation. Decide how the alias pages appear there, or exclude them.
  - Excluded. The module has no route-level switch, so `nitro.prerender.ignore` skips `/projects.md` and `/contact.md`, which also keeps them out of `llms.txt` and `llms-full.txt`. The `prerender:generate` hook drops the Markdown `alternate` link from the two alias pages.
  - `contentNegotiation`, `botNegotiation` and `sitemapMd` are off, because static hosting can't negotiate. That removed the warning. The module now prints its own note that negotiation is off, which is expected.
- Drop `_og-static-fonts/` (unused Inter TTFs, about 134 KB) if the module allows. Otherwise exclude it in the Phase 6 sync.
  - nuxt-og-image copies them on every build and has no option to stop it, so the Phase 6 sync excludes them (see the Phase 6 list below).
- Make `check-seo` read binary files correctly (Buffers or `/usr/bin/grep -a`).
  - Done. Its output reader returns every file as a Buffer, and the email scan searches the bytes.
- **Open decision for James:** the résumé PDF contains his email address. It must either be the documented exception to "the email appears nowhere in the output", or be replaced with a résumé without it.
  - Still open, for the Phase 5 review. Until James decides, `resume.pdf` is the only entry in `EMAIL_ALLOWED` in `scripts/check-seo.ts`. Replacing the PDF is a file swap plus deleting that entry.
- The 1800w `<img>` fallback is a PNG. Consider a smaller or different fallback.
  - Ruled: the legacy `<img>` fallback stays PNG. Only browsers without AVIF and WebP fetch it, and Lighthouse's Chrome never does. Revisit only if Lighthouse flags it.
- Give the Card OG template props real requirements, not defaults.
  - Done. `title` and `eyebrow` are required with no defaults, and `image` is optional. Each case study passes its hero screenshot, which shows uncropped beside the text on the 1200x630 card.

## Phase 6 (Hosting, CI and docs)

- `scripts/serve-static.mjs` should import and run `infra/cloudfront/viewer-request.js`, so e2e covers the 301 trailing-slash redirects and the real rewrites. Also tighten its root check to `startsWith(root + sep)`.
- Every top-level path in `.output/public` needs a sync pass or an explicit exclusion:
  - Exclude `200.html` (an empty SPA shell that would be a soft 404).
  - `_payload.json` (per route) goes in the no-cache pass.
  - Also account for `_og/`, `__sitemap__/`, `__ai-ready/`, `llms-full.txt`, `.md` copies and `favicon.svg`.
  - Exclude `_og-static-fonts/` (unused Inter TTFs emitted by nuxt-og-image; the module has no option to drop them).
- Add `npm run test:output` to the CI `build-and-test` job. The spec's list omits it.
- Set Playwright `reuseExistingServer: !process.env.CI`. Port 4173 is also Vite preview's default.
- Add one `_ipx` AVIF URL to the post-launch curl checks (content type and the `&` in the key).
- The spec's Verification 4 says `npx serve`. The project uses `scripts/serve-static.mjs`.

## Added by Phase 2 (for Phases 3 to 6)

### Facts learned in Phase 2

- **Section links and router pushes:** `/`, `/projects` and `/contact` are one route record (aliases). A `router.push` between them is NAVIGATION_DUPLICATED. So the header uses plain `<a href>` with handlers in `SiteHeader.vue` (`isPlainClick`, `pushForced` with `force: true`), and the wordmark is a plain `<a>` too.
  - Any new link to `/projects` or `/contact` from inside Home needs the same handling, or it does nothing.
  - Links from other pages work as normal NuxtLinks.
- **`aria-current`:**
  - Section links use `aria-current="location"`, only for the matching path.
  - The wordmark uses `aria-current="page"` only on `/`.
- **`scrollBehavior` in `app/router.options.ts`, in order:**
  1. A saved position is restored with `behavior: 'instant'`.
  2. A hash wins over a section path.
  3. A section path scrolls to that section.
  4. Otherwise the page goes to the top.
  - `base.css` sets `html { scroll-behavior: smooth }`, so `'auto'` is smooth. Use `'instant'` when you mean instant. (Since Phase 5 the rule is on `html.smooth-scroll`, added after hydration. See "Facts learned in Phase 5".)
- **Playwright `reuseExistingServer: true`:** a stray server on port 4173 made a whole e2e run fail with ECONNREFUSED. Set it to `!process.env.CI` and consider a less common port. This was originally a Phase 6 item; do it early in Phase 3.

### Phase 3 (Case studies and 404): done

- **Expand `scrollBehavior`:**
  - Wait for `page:loading:end` before scrolling, the way Nuxt's default does, so async case study pages render first.
  - Use `'instant'` for page changes.
  - Honor `scroll-margin-top` for hash targets (`.cs-sec`).
  - Return `false` for same-path, non-hash changes.
- **Component variants needed by the case study:**
  - ProofLinks: a `page` variant with v11's `proof--3` grid (3 columns, 1 under a 420px container).
  - StackList: scope the 600-899px two-column rule to the Home context, and add the `.stack--page` variant.
  - BrowserFrame: an option to render a `div.frame` inside a `figure.g-item` with a `figcaption` for the gallery.
  - Port the `.frame video` rule.
  - Consider replacing the anchor-id map in `ProjectBlock.vue` with an `anchorId` data field.
- **Tests:**
  - Share a robust image-dimension helper: JPEG marker scan handling SOF1 and standalone markers, used by the data tests.
  - Resolve every `public/` path from `import.meta.url` (the hero-size test still uses the cwd).
  - Share an axe helper that waits for animations using `a.finished.catch(() => {})`, and run it on all 5 pages.
- **Accessibility:**
  - The four "Case study read" links have identical names. Add a visually hidden project name.
  - On the 404 page, the h1 sits tight under the header and the two links run together. `error.vue` shows "Page not found" for non-404 errors too.

### Phase 4 (Contact form): done

- **Email links:** done. Both Email links switch to `mailto:` after hydration (`useEmailHref`), and `tests/e2e/contact.spec.ts` pins it.
- **No JS:** done. The form has `method="post"` and no action, so field values never land in a URL.

### Phase 5 (SEO and performance): done

- **Image sizes:**
  - Tighten the loose `toContain('100vw')` check to the exact `sizes` string. Done in `tests/output/home.test.ts`.
  - Screenshot `sizes` is 800px from 1200px up, about 45% over-fetch on desktop. Done: the `ProjectBlock` `sizes` follow the measured widths (`xs:90vw sm:100vw 800:100vw md:40vw lg:560px`). e2e "srcset honesty" tests on Home and the case study hero check the chosen file at 1440 (DPR 1 and 2) and 390 (DPR 3), and Home also at 768, 820 and 899 (DPR 2), which the `800:100vw` entry covers with a 1600w candidate.
- **Portrait:** has no `format="avif,webp"`, and `james.jpg` has no size test. Done: it's a `NuxtPicture` with AVIF and WebP, and `tests/nuxt/data.test.ts` checks the file's declared size.
- **Email scan:** `check-seo` must scan every file for the address and non-JS text output (HTML, JSON, Markdown, XML, TXT) for `mailto:`. Done: the `email-address` check in `scripts/check-seo.ts` does both. `tests/output/privacy.test.ts` keeps only the test that the EmailJS SDK loads on demand.
- **Résumé PDF:** `public/resume.pdf` still contains the email address. It is the single named exception (now `EMAIL_ALLOWED` in `scripts/check-seo.ts`), pending James's decision at the Phase 5 review (keep the exception or replace the PDF).
- **Lighthouse:** the intro "settle" animation holds text at opacity 0 for up to about 900ms. Check LCP. Done: the name (`h1#hero-name`, the element Lighthouse reports for LCP) starts at full opacity and keeps the 8px rise. The rest of the intro keeps v11's settle.
  - `npm run lighthouse` (mobile, simulated throttling) scores Home 1.00 in all four categories, and Open Door 0.99 / 1.00 / 1.00 / 1.00 (performance, accessibility, best practices, SEO).
  - Local runs compress like CloudFront does (`scripts/serve-static.mjs`). Without compression Open Door's performance drops to about 0.91 to 0.94.

## Added by Phase 3 (for Phases 4 to 6)

### Facts learned in Phase 3

- **`scrollBehavior` now compares pages, not paths.** A route's page key is `meta.key` (Home's `/`, `/projects` and `/contact` share `'home'`), otherwise its path.
  - Within one page (a section link on Home, the wordmark from `/contact`, a TOC link), the scroll follows the motion preference: a glide, or a jump under reduced motion.
  - A page change waits for `page:loading:end` and then jumps (`'instant'`), including into a section URL or a hash.
  - Back and Forward always jump, including Back out of a TOC jump (the router never saved a position for that entry, so it goes to the top).
  - The router has already decoded `to.hash`. Don't decode it again.
- **Focus on arrival:**
  - A link into a case study focuses its h1 (`#case-title`).
  - A link to a hash inside it (`#media`, `#video`) focuses the h2 of the section that holds the target instead. Every case study h2 has `tabindex="-1"` for this.
  - The first load and Back/Forward keep the browser's own focus (`$isHistoryNav()` from `app/plugins/history-nav.client.ts`).
- **`<NuxtRouteAnnouncer>` is client-only** (Nuxt registers it with `mode: 'client'`). It never appears in prerendered HTML, so test it after hydration. `error.vue` renders instead of `app.vue`, so it has its own.
- **Gallery `sizes` depend on the image count**, because the auto-fit grid stretches one or two images across the row. Numeric keys (`640:50vw`, `1100:864px`) work in `@nuxt/image` sizes.
  - `tests/e2e/case-studies.spec.ts` guards this at 1440 (DPR 1 and 2) and against over-fetch at 768.
- **Video:** the description (needed for a silent video, WCAG 1.2.1) renders below the stage as `.video-note`, as in v11. The poster is optional.
  - The data test fails if an enabled video has neither a description nor captions.
- **Scroll test helpers:** `tests/e2e/helpers/scroll.ts` (`recordScrolls`, `scrollsBetween`, `waitForScrollIdle`) tell a glide from a jump.
  - Scroll with `window.scrollTo({ behavior: 'instant' })` plus two animation frames, not `page.mouse.wheel`. A wheel resolves before Chromium applies it, and the pending scroll can cancel the next smooth scroll.

### Phase 5 (SEO and performance): done

- **Lists:** add `role="list"` to lists styled `list-style: none` (project tabs, section TOC, plain lists, architecture steps, proof links). Safari drops their list semantics otherwise. Done on those, plus the capabilities strip and the contact links. The feature list keeps its bullets. An e2e test checks every `list-style: none` list in `main` on Home and a case study.
- **Hero image:**
  - The case study hero srcset declares a 2360w candidate above the 1800px source. Make the srcset honest. Done: `densities="1"` and `sizes` of `xs:90vw sm:90vw md:90vw lg:1042px 2400:<source width>px`, so no candidate is wider than the source (Folio's is 1600px, the others 1800px).
  - Consider a preload for the hero (likely LCP). Done: the `preload` prop with `fetchPriority: 'high'`.
  - Check the hero for over-fetch. Done: the srcset honesty e2e tests cover the hero (at least 0.95x the need at 1440 and 390, at most 1.6x at 1440 DPR 1).
- **Gallery:** sizes over-fetch slightly between 1100 and 1180px (the column is narrower than 864px there). Ruled: the slight over-fetch in that band stays. Lighthouse didn't flag it.

### Launch prep

From Phase 3 and the Phase 4 final review, parked by ruling. Each needs a rare condition. Phase 5 built the other two later polish items: R2 (a direct landing on a case study hash now jumps) and M7 (the contact draft survives a visit to a case study). See "Facts learned in Phase 5".

- **R1: Back/Forward within a page with no saved position glides.** For example, Back between two TOC jumps, or Forward into one. `$isHistoryNav()` can't tell these from a TOC click, because both arrive as popstate. The popstate `event.state` (null for a fresh native hash entry, set on traversal) can. It behaved this way before the Phase 3 fixes, it only affects glide versus jump, and readers with reduced motion already get jumps.
- **M4: A stalled send shows "Sending..." indefinitely.** The SDK's `send` is a bare `fetch` with no timeout or signal. On a half-dead connection the button reads "Sending..." for minutes, the in-flight guard ignores every press of Send, and a reload (which loses the message) is the only way out. Racing `send` against a timeout of about 20 seconds would show the failure copy with the text kept, but a late success plus a retry could send a duplicate email. A related edge: `sending` and `status` are per mount while the draft is shared (`useState('contact-draft')`). Leaving Home mid-send and returning shows the sent text with Send enabled, which invites a duplicate send, and a late success clears anything typed after returning. One fix is to move `sending` and `status` into `useState` too.
- **R3: A reload, or a Back that isn't restored from the bfcache, on a case study hash URL lands at the hash, not the saved scroll offset.** The saved position is restored by the first `scrollBehavior` call, and the second call (Nuxt's landing replace) then scrolls to the hash. One fix is to skip the restore call's hash scroll when the first call had a saved position.
- **M5: With site storage blocked, every send fails, and the copy blames the connection.** Accepted in Phase 5, so there is nothing to do. The SDK reads `localStorage` when its module loads, so a browser that throws `SecurityError` for blocked site data makes the lazy import reject. It needs a browser with site data blocked, the failure copy still offers to email directly, and the Email links work. (Posting to the EmailJS REST endpoint with our own `fetch` would avoid it, and would also allow an `AbortController` for M4, but it departs from the spec's `@emailjs/browser`.)
- **Launch check: hash landings in Safari and Firefox.** Verify a direct landing on a case study hash (for example `/projects/folio#results`) in both. The e2e suite is Chromium only.
- **Launch check: LinkedIn may keep a cached share image after a screenshot swap.** The `_og` image URLs are keyed by props, so changing a hero image can leave the old card cached. Re-scrape the page in LinkedIn's Post Inspector after changing a hero.

## Added by Phase 4 (for Phase 6)

The polish items Phase 4 parked are under "Launch prep" above.

### Phase 6 (Hosting, CI and docs)

- **CI config:** the `build-and-test` job needs non-empty `NUXT_PUBLIC_EMAILJS_SERVICE_ID`, `NUXT_PUBLIC_EMAILJS_TEMPLATE_ID` and `NUXT_PUBLIC_EMAILJS_PUBLIC_KEY` at generate time. Dummy values are fine, because every e2e request to EmailJS is intercepted. The deploy job maps the real secrets.
- **Docs:** James turns on the EmailJS domain allowlist (adding `localhost` only if he wants local sends) and a rate limit in the EmailJS dashboard.
- **Docs, EmailJS 412:** an HTTP 412 from EmailJS means its Gmail permission has expired, even when the dashboard still says "Connected as...". The fix is Email Services, the Gmail service, Disconnect, then Connect Account with "Send email on your behalf" checked, then Update Service. This happened on 2026-11-18, and the README should say so.
- **DESIGN.md motion:** besides the intro "settle", the contact form's Send button shows a small spinner (`.spinner` in `ContactForm.vue`) while a message sends. The sending state lasts at least 600ms, so a fast reply doesn't flash. James asked for this on 2026-11-18, and the spec's Motion line records it.
- **No-JS submit:** a send before the JS loads is a plain `POST /contact` (the form has `method="post"` and no action). `scripts/serve-static.mjs` ignores the method and returns the page with a 200, so e2e can't show what production does.
  - CloudFront allows only GET and HEAD by default, so it probably answers with a 403. The 403 → `/404.html` custom error response would then show "Page not found" with a 404, and the message is lost.
  - Allowing POST wouldn't help, because the S3 website endpoint serves only GET and HEAD.
  - After the error responses are swapped, check with `curl -i -X POST https://jameslittlefield.net/contact`. Then decide whether to accept that for the tiny no-JS audience or to return something better.

## Added by Phase 5 (for Phase 6)

### Facts learned in Phase 5

- **SEO gate:** `npm run check-seo` runs 16 checks on `.output/public` (titles, descriptions, canonicals, robots meta, share images, structured data, sitemap, robots.txt, llms files, the email scan and more). `tests/output/check-seo.test.ts` runs the same checks, so `npm run test:output` covers them. Regenerate first.
- **Smooth scrolling starts after hydration.** `base.css` sets `scroll-behavior: smooth` on `html.smooth-scroll`, and `app/plugins/smooth-scroll.client.ts` adds that class on `app:suspense:resolve`.
  - Before that, and without JS, anchor links jump. So the browser's own jump to a `#hash` on a direct landing is instant, while TOC and skip links glide after hydration (and jump under reduced motion).
- **`scrollBehavior` knows the landing.** On a prerendered page loaded with a hash or query, Nuxt calls `scrollBehavior` once more just after hydration: it replaces the route with the URL the page loaded at, so `to` and `from` are the same location.
  - `router.options.ts` treats that call, the first call and any call while hydrating as the landing. A hash landing jumps, so a shared deep link opens at its section.
  - A test in `tests/e2e/case-nav.spec.ts` records every scroll from page start, and the motion the router asks for.
- **Contact draft:** the four fields live in `useState('contact-draft')`, so a half-typed message survives a visit to a case study and Back. A successful send clears it, and the honeypot stays local, so it is never kept.
  - State outlives a mount in the Nuxt test environment, so `tests/nuxt/ContactForm.test.ts` clears the draft after each test (`clearNuxtState`).

### Phase 6 (Hosting, CI and docs)

- **Keep CloudFront compression on.** Verified live on 2026-11-18: `/` and its JS bundle return `content-encoding: br` over HTTP/2. Without compression the Open Door Lighthouse performance score drops to about 0.91 to 0.94.
- **Response headers:** consider a CloudFront response headers policy for CSP, HSTS and COOP. The live site sends none of them. Cache-control comes from the planned sync passes.
- **Lighthouse in CI:** `scripts/lighthouse.mjs` launches Playwright's Chromium (`chromium.executablePath()`), so a CI job that runs it must install that browser first (`npx playwright install chromium`). Its reports go to `.lighthouse/`, which is gitignored. Upload that folder as an artifact if CI runs it.
- `_og-static-fonts/` is already on the sync exclusion list above. Phase 5 confirmed nuxt-og-image has no option to drop it.
