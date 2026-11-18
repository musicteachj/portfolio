# Carry-forward notes (Phases 1 to 4)

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

## Phase 5 (SEO and performance)

- Keep `/projects` and `/contact` out of `sitemap.xml`. The sitemap currently lists them.
- `nuxt-ai-ready` emits `llms.txt`, `llms-full.txt` and `.md` copies of each page (including `projects.md` and `contact.md`, each with its own `canonical_url`), plus a generate warning about Markdown negotiation. Decide how the alias pages appear there, or exclude them.
- Drop `_og-static-fonts/` (unused Inter TTFs, about 134 KB) if the module allows. Otherwise exclude it in the Phase 6 sync.
- Make `check-seo` read binary files correctly (Buffers or `/usr/bin/grep -a`).
- **Open decision for James:** the résumé PDF contains his email address. It must either be the documented exception to "the email appears nowhere in the output", or be replaced with a résumé without it.
- The 1800w `<img>` fallback is a PNG. Consider a smaller or different fallback.
- Give the Card OG template props real requirements, not defaults.

## Phase 6 (Hosting, CI and docs)

- `scripts/serve-static.mjs` should import and run `infra/cloudfront/viewer-request.js`, so e2e covers the 301 trailing-slash redirects and the real rewrites. Also tighten its root check to `startsWith(root + sep)`.
- Every top-level path in `.output/public` needs a sync pass or an explicit exclusion:
  - Exclude `200.html` (an empty SPA shell that would be a soft 404).
  - `_payload.json` (per route) goes in the no-cache pass.
  - Also account for `_og/`, `__sitemap__/`, `__ai-ready/`, `llms-full.txt`, `.md` copies and `favicon.svg`.
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
  - `base.css` sets `html { scroll-behavior: smooth }`, so `'auto'` is smooth. Use `'instant'` when you mean instant.
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

### Phase 5 (SEO and performance)

- **Image sizes:**
  - Tighten the loose `toContain('100vw')` check to the exact `sizes` string.
  - Screenshot `sizes` is 800px from 1200px up, about 45% over-fetch on desktop (accepted for now; revisit).
- **Portrait:** has no `format="avif,webp"`, and `james.jpg` has no size test.
- **Email scan:** `check-seo` must scan every file for the address and non-JS text output (HTML, JSON, Markdown, XML, TXT) for `mailto:`. `tests/output/privacy.test.ts` already does both, so `check-seo` can reuse that logic.
- **Résumé PDF:** `public/resume.pdf` still contains the email address. It is the single named exception in `tests/output/privacy.test.ts`, pending James's decision (keep the exception or replace the PDF).
- **Lighthouse:** the intro "settle" animation holds text at opacity 0 for up to about 900ms. Check LCP.

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

### Phase 5 (SEO and performance)

- **Lists:** add `role="list"` to lists styled `list-style: none` (project tabs, section TOC, plain lists, architecture steps, proof links). Safari drops their list semantics otherwise.
- **Hero image:**
  - The case study hero srcset declares a 2360w candidate above the 1800px source. Make the srcset honest.
  - Consider a preload for the hero (likely LCP).
  - Check the hero for over-fetch.
- **Gallery:** sizes over-fetch slightly between 1100 and 1180px (the column is narrower than 864px there). Small; revisit only if Lighthouse flags it.

### Later polish (any phase before launch)

From Phase 3. Both behaved this way before the Phase 3 fixes. They only affect glide versus jump, and readers with reduced motion already get jumps.

- **Back/Forward within a page with no saved position glides.** For example, Back between two TOC jumps, or Forward into one. `$isHistoryNav()` can't tell these from a TOC click, because both arrive as popstate. The popstate `event.state` (null for a fresh native hash entry, set on traversal) can.
- **A direct landing on a case study hash glides from the top under default motion** (for example `/projects/folio#results`). On prerendered pages, Nuxt calls `scrollBehavior` a second time with a `from` that isn't `START_LOCATION`, so the "first load jumps" path never runs. The browser's own jump to the hash also animates, because of `html { scroll-behavior: smooth }`. The step 2 comment in `router.options.ts` ("the browser has already jumped there") is wrong in practice.

From the Phase 4 final review (items M4, M5 and M7), parked by ruling. Each needs a rare condition.

- **A stalled send shows "Sending..." indefinitely.** The SDK's `send` is a bare `fetch` with no timeout or signal. On a half-dead connection the button reads "Sending..." for minutes, the in-flight guard ignores every press of Send, and a reload (which loses the message) is the only way out. Racing `send` against a timeout of about 20 seconds would show the failure copy with the text kept, but a late success plus a retry could send a duplicate email.
- **With site storage blocked, every send fails, and the copy blames the connection.** The SDK reads `localStorage` when its module loads, so a browser that throws `SecurityError` for blocked site data makes the lazy import reject. The failure copy still offers to email directly, and the Email links work. The options are to accept it, or to post to the EmailJS REST endpoint with our own `fetch` (which would also allow an `AbortController` for the stall above). The second departs from the spec's `@emailjs/browser`, so it is James's call.
- **A half-typed message is lost after visiting a case study and pressing Back.** Home unmounts when you leave it, so the fields come back empty. A send still pending when you leave completes, but its confirmation is never shown. This predates Phase 4. Keeping `fields` in `useState('contact-draft')` would keep the draft across client navigation.

## Added by Phase 4 (for Phase 6)

The polish items Phase 4 parked are under "Later polish" above.

### Phase 6 (Hosting, CI and docs)

- **CI config:** the `build-and-test` job needs non-empty `NUXT_PUBLIC_EMAILJS_SERVICE_ID`, `NUXT_PUBLIC_EMAILJS_TEMPLATE_ID` and `NUXT_PUBLIC_EMAILJS_PUBLIC_KEY` at generate time. Dummy values are fine, because every e2e request to EmailJS is intercepted. The deploy job maps the real secrets.
- **Docs:** James turns on the EmailJS domain allowlist (adding `localhost` only if he wants local sends) and a rate limit in the EmailJS dashboard.
- **Docs, EmailJS 412:** an HTTP 412 from EmailJS means its Gmail permission has expired, even when the dashboard still says "Connected as...". The fix is Email Services, the Gmail service, Disconnect, then Connect Account with "Send email on your behalf" checked, then Update Service. This happened on 2026-11-18, and the README should say so.
- **DESIGN.md motion:** besides the intro "settle", the contact form's Send button shows a small spinner (`.spinner` in `ContactForm.vue`) while a message sends. The sending state lasts at least 600ms, so a fast reply doesn't flash. James asked for this on 2026-11-18, and the spec's Motion line records it.
- **No-JS submit:** a send before the JS loads is a plain `POST /contact` (the form has `method="post"` and no action). `scripts/serve-static.mjs` ignores the method and returns the page with a 200, so e2e can't show what production does.
  - CloudFront allows only GET and HEAD by default, so it probably answers with a 403. The 403 → `/404.html` custom error response would then show "Page not found" with a 404, and the message is lost.
  - Allowing POST wouldn't help, because the S3 website endpoint serves only GET and HEAD.
  - After the error responses are swapped, check with `curl -i -X POST https://jameslittlefield.net/contact`. Then decide whether to accept that for the tiny no-JS audience or to return something better.
