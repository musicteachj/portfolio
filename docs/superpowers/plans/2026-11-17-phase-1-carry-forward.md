# Carry-forward notes (Phases 1 and 2)

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

## Phase 3 (Case studies and 404)

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

### Phase 3 (Case studies and 404)

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

### Phase 4 (Contact form)

- **Email links:** the hero and contact Email links are plain `/contact` hrefs. Clicking them reloads the page, and on `/contact` that clears a half-typed form. Phase 4's client-side `mailto:` switch replaces them; until hydration they must not wipe the form.
- **No JS:** without JS the form submits a GET with the field values in the URL. Give it `method="post"` with no action, or another no-JS-safe fallback.

### Phase 5 (SEO and performance)

- **Image sizes:**
  - Tighten the loose `toContain('100vw')` check to the exact `sizes` string.
  - Screenshot `sizes` is 800px from 1200px up, about 45% over-fetch on desktop (accepted for now; revisit).
- **Portrait:** has no `format="avif,webp"`, and `james.jpg` has no size test.
- **Email scan:** `check-seo` must scan every text file for `mailto:` and `jameslittlefield3@`, not just `index.html`.
- **Lighthouse:** the intro "settle" animation holds text at opacity 0 for up to about 900ms. Check LCP.
