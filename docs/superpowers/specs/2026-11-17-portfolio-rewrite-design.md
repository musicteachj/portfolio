# Portfolio rewrite design: Nuxt static site from the v11 Product Showcase

Status: approved by James on 2026-11-17. Branch: `nuxt-rewrite` (off `origin/dev`).

## Context

James is actively job-hunting as an AI engineer. He's replacing jameslittlefield.net (a Vue 3 + Vuetify single-page app) with a new portfolio built around 4 AI projects:
- Open Door
- Packwright
- Folio
- ResumeIQ

**Why the current site fails on SEO** (verified with curl on 2026-11-17):
- Every route except `/` returns HTTP 404, because CloudFront's single-page-app fallback serves `index.html` with a 404 status. Google drops those pages.
- The HTML is an empty `<div id="app">`, so link-preview bots and AI crawlers see nothing.
- Every page shares one title and preview.
- The JSON-LD publishes his email.

James isn't keeping any of the old site.

**What's already settled:**
- **Layout:** Product Showcase, final mockup `v11-product-showcase.html`.
- **Palette:** Sanzo Wada A, Tyrian blue.
- **Framework:** Nuxt with static generation, keeping Vue.
- **Hosting:** stays on AWS S3 + CloudFront.

**Intended outcome:**
- Every page ships as complete, correct HTML with its own title, description, share image and structured data, served with real HTTP status codes.
- The site looks and behaves like v11 at every width.
- It meets WCAG 2.1 AA.

**Process note:** brainstorming is approved through this plan. Execution is phased (see "Phased development plan"). Phase 0 saves the design section below as the spec. Before each phase, `superpowers:writing-plans` writes that phase's task plan, and `superpowers:subagent-driven-development` executes it. Each phase ends with a review stop. **No commit, push, PR, or AWS change without James's explicit per-action OK.**

**Calls I made that you may want to check:**
- **Same repo:** the rewrite happens in `my-portfolio`, on a new branch off `dev`. It goes in by PR into `dev`, then `dev` into `main`, your usual flow. Merging to `main` is the launch.
- **Content:** written in TypeScript data files, not Markdown.
- **Styling:** plain CSS with no UI library.
- **Email address:** it's never in the HTML. The Email button builds the link in the browser.
- **Old URLs:** they redirect (301) to the new pages.
- **Résumé:** the old résumé moves to `/resume.pdf` until you send an AI Engineer version.
- **AI search:** `llms.txt` is kept for AI search tools.
- **AWS:** you make the AWS changes from a written checklist, or I run them only with your OK.

---

## Design

### Goals, non-goals, anti-goals
- **Goals:**
  - Recruiters land on Home and can scan all 4 projects quickly.
  - Each project has a full case study page.
  - Each page indexes in Google and Bing and produces a correct preview in LinkedIn and Slack.
  - AI crawlers can read the full content.
  - The contact form keeps emailing James.
- **Non-goals:**
  - Work history or an About section (both removed for good).
  - Blog.
  - Dark mode.
  - Analytics (James chose "not now").
  - A public design-system page (the mockup's "System" view becomes `DESIGN.md`, not a route).
- **Anti-goals:**
  - Anything that reads as AI-generated copy or the "AI look" (see the `portfolio-voice` memory).
  - Dead links: no button points at something that doesn't exist.
  - Cropped screenshots.
  - Publishing his email address in the static HTML.

### Approaches considered
1. **Nuxt 4 static generation (chosen).** Everything stays in Vue, which James asked for. `nuxt generate` writes complete HTML per route, and the `@nuxtjs/seo` modules cover sitemap, robots, schema.org and OG images.
2. **Astro with Vue islands.** It matches Nuxt on SEO and ships less JavaScript, but most of the site would be `.astro` files instead of Vue.
3. **Vite + Vue SPA with a prerender plugin.** This is the closest to today's site, but it rebuilds by hand what Nuxt gives you (per-route head, sitemap, schema, OG), and it was the fragile path before.

### Stack
- **Framework:** Nuxt `^4.6` with the `app/` directory layout and TypeScript. Production builds use `nuxt generate`, which prerenders everything.
- **Node:** 24 LTS, set in `.nvmrc` (Nuxt 4.6 requires Node ^22.22.3 or newer).
- **Modules:**
  - `@nuxtjs/seo` (site config, sitemap, robots, schema-org, og-image, link-checker)
  - `@nuxt/image` (static IPX at generate time, which produces WebP/AVIF + srcset)
  - `@nuxt/fonts` (self-hosted Onest 400/500/600/700 and Fragment Mono 400)
- **Contact form:** `@emailjs/browser` replaces the deprecated `emailjs-com`.
- **Styling:** plain CSS. A global `tokens.css` + `base.css` holds the v11 tokens, and each component uses scoped styles. No UI library, no Tailwind.
- **No state library:** content is static typed data.
- **Testing:** Vitest + `@nuxt/test-utils` for units, Playwright + `@axe-core/playwright` for e2e and accessibility.
- **Repo:** same repo `my-portfolio`, on a new branch `nuxt-rewrite` off `origin/dev`. `origin/dev` and `origin/main` have identical content today. It ships by PR `nuxt-rewrite` → `dev`, then `dev` → `main`, which deploys. The old Vite/Vuetify app is removed on that branch. This keeps git history, the GitHub secrets and the deploy workflow.

### Information architecture and URLs

| Route | Content |
|---|---|
| `/` | Header (wordmark, nav: Projects, Contact, Résumé). Intro: photo, name, "AI Engineer", positioning line, current role line, "Open to AI engineering roles", buttons Résumé (PDF) / Email / GitHub / LinkedIn. Projects heading. 4 project blocks. Capabilities strip. Contact (direct links + form). Footer |
| `/projects/open-door`, `/projects/packwright`, `/projects/folio`, `/projects/resumeiq` | Case study page. Project tabs plus "All projects" link (to `/projects`). Type label, h1, lede, proof links (Live demo, Video, Code). Hero screenshot. Sticky section TOC on wide screens. Sections in order: Overview, Key features, How the AI works, Tech stack, Architecture, Results and evals, Decisions and lessons, then "Screenshots". The last section becomes "Video and screenshots" once a video is enabled. Previous/next project |
| `/projects`, `/contact` | **Section URLs:** they render the Home page and scroll to that section on load, so the address bar shows clean paths. `<link rel="canonical" href="https://jameslittlefield.net/">`, same title as Home, and kept out of the sitemap |
| `/resume.pdf` | Résumé at a stable address |
| anything else | `404.html`, served with HTTP 404 |

**Navigation:**
- "Projects" goes to `/projects` and "Contact" goes to `/contact`. They're `<NuxtLink>`s.
- On Home, the router's `scrollBehavior` scrolls smoothly to the section, or instantly under `prefers-reduced-motion`, below the header. The URL updates without a reload.
- Landing directly on `/projects` or `/contact` scrolls there after hydration.
- The section elements keep their ids `projects` and `contact`, so they still work as in-page anchors and in the link checker.
- The wordmark goes to `/` and the top of the page.
- In-page anchors inside a case study (the TOC) still use `#section` links, which is standard.
- **No `/#...` URLs in nav.**
- Each project's name on Home links to its case study, and so does its "Case study" proof link.
- There's no separate "Case studies" nav item, because the project pages are the case studies.

### Content model (`app/data/projects.ts`, typed in `app/types/project.ts`)
- **Content source:** copy and numbers are ported from the v11 mockup, which is already reviewed. `content-brief-v3.md` is the fact source.
- **Fields per project:**
  - `slug`, `name`, `typeLabel`
  - `oneLine` (the case study lede)
  - `overview` (Home paragraph)
  - `stack` (grouped: AI, Frontend, Backend, Data, Infra)
  - `stats` (exactly 3: value, unit, label)
  - `screenshots` (src, width, height, alt, caption, `dark?` frame)
  - `features[]`
  - `howAiWorks`
  - `architecture`: a union type, either linear step groups or a branching flow, because Open Door's v11 diagram branches
  - `results` (table rows)
  - `decisions[]`
  - `seo` (title, description)
  - `links`, defined below
- **`links` shape:**
  - `code: { url, enabled }`
  - `demo: { url?: string, enabled }`
  - `video: { enabled, src?, poster?, durationLabel?, captions?, description? }`
- **Proof link rules** (one `ProofLinks` component, used on Home and on case study pages):
  - Order: Case study, Video, Code, Live demo on Home. Case study pages show Live demo, Video, Code.
  - Case study is always enabled.
  - Video, Code and Live demo are each enabled iff `enabled: true` (and, for Video and Live demo, a `src`/`url` is set).
  - The data-integrity test fails if `enabled` is true without its URL or file.
  - An enabled Video links to `/projects/<slug>#video`.
  - Disabled items render as `<span aria-disabled="true">`. They are not links and not focusable. They're muted with the v11 `.proof-off` style and keep the label and sub-text.
  - Sub-text: Case study "read", Video = duration label, Code "GitHub", Live demo "view".
- **Launch state** (James's choice):
  - **Video, Code and Live demo are disabled on all 4 projects.** Only Case study is active.
  - No video players render. Case studies show a "Screenshots" section.
  - Enabling any of them later is a data-only change in `projects.ts`, plus dropping a file in `public/videos/` for videos.
- **Video support** (built and unit-tested now with a fixture, unused at launch):
  - **`VideoPlayer`:** `preload="none"`, poster, `controls`, `object-fit: contain`, an optional captions `<track>` (`.vtt`) and an optional text description below. The description is required for silent videos (WCAG 1.2.1).
  - **Videos ready for when James enables them:**
    - Open Door: `open-door/apps/web/public/media/walkthrough.mp4` + `walkthrough-poster.jpg` (silent).
    - ResumeIQ: the v2 draft in `portfolio-videos/out/`, with an `.srt` to convert to `.vtt`.
  - `README.md` documents the steps.
- **Live demo URLs:** none exist yet. `demo.url` is left empty for all 4 until James deploys.
- **Site data** (`app/data/site.ts`):
  - Name, role, positioning line.
  - GitHub `https://github.com/musicteachj`, LinkedIn `https://www.linkedin.com/in/james-littlefield-93037713b/`.
  - Capabilities list.
  - Résumé path.

### Design system (from v11; also written up as the new `DESIGN.md`, replacing "Professional Navy")
- **Colors:**
  - Neutrals: paper `#F7F7F4`, surface `#FFFFFF`, sunken `#EFEFEB`, line `#E2E2DC`, line-strong `#C9C9C1`, field-border `#8A8F88`.
  - Ink: ink `#141614`, ink-2 `#464B47`, ink-3 `#5F655F`.
  - Palette A: accent `#12354E`, accent-hover `#0B2436`, soft `#A5C8D1`, tint `#E6EFF2`.
  - Status: pass `#3D6650`/`#E7EEE9`, miss `#9A5800`/`#F8EEDC`, error `#A32B22`/`#FBECEA`.
  - Contrast ratios are recorded in `DESIGN.md`. Every text pair is AA. Field borders are 3.3:1.
- **Type:**
  - Onest for UI and headings, Fragment Mono for small data labels.
  - Scale: display `clamp(2.5rem, …, 3.75rem)`, h2, lede, small 0.875rem, mono 0.8125rem, stat.
  - All values come from v11 `:root`.
- **Spacing and shape:**
  - Spacing scale 4/8/12/16/24/32/48/72/112.
  - Radii: control 6, frame 10, stage 14.
  - Max width 1160.
- **Components:**
  - SiteHeader, SiteFooter, IntroHero, ProjectBlock (alternating sides, sticky media at 900px and up), ProofLinks, StackList, StatRow
  - BrowserFrame (light/dark bar, address label), MediaStage (soft panel)
  - CapabilitiesStrip, ContactForm, DirectLinks
  - ProjectTabs, SectionToc, ArchitectureSteps, ResultsTable (scrolls in a focusable region), VideoPlayer, ScreenshotGallery, PrevNext
- **Responsive (from v10/v11 QA):**
  - No horizontal scroll from 360 to 1440.
  - Touch targets ≥ 44px.
  - Nav wraps under the wordmark on narrow phones.
  - Proof links 2x2, or 1x4 where they fit.
  - Tablet: 2-column stack, 3-column stats.
  - Screenshot beside text from 900px.
  - The photo goes small and above the name under 820px.
- **Motion:** only the intro "settle" on load. Respect `prefers-reduced-motion`.
- **Writing rules:** American English, no em dashes, no "→", no middle-dot meta strings, sentence case.

### Contact form
- **Fields:** Name, Email, Subject, Message, all required. Email format is validated.
- **Labels and errors:** labels sit above the fields. Errors show inline on blur/submit, with `aria-invalid` + `aria-describedby`.
- **Submit:** "Send message", with a sending state.
- **Status messages** (announced through `aria-live`):
  - Success: "Message sent. I'll reply to your email." The form then resets.
  - Failure: "Your message didn't send. Check your connection and try again, or email me directly." The fields are kept.
- **Spam:**
  - A honeypot field in an `aria-hidden` wrapper, with `tabindex="-1"` and `autocomplete="off"`, visually hidden.
  - If it's filled, skip the send but show the normal success message.
  - James turns on EmailJS's domain allowlist and rate limit in its dashboard (his action).
  - Don't enable EmailJS `blockHeadless`: it returns 451 errors in Playwright.
- **Config:**
  - `runtimeConfig.public.emailjs{ServiceId,TemplateId,PublicKey}`, set from `NUXT_PUBLIC_EMAILJS_*` at build time.
  - The local `.env` keys get renamed.
  - The EmailJS template params stay exactly as in the current `src/views/ContactView.vue:178`: `{ name, email, subject, message }`. The existing EmailJS template depends on these names.

### Email address exposure
- The email address never appears in generated HTML or JSON-LD.
- The server always renders `href="/contact"` on the Email button and on the direct link.
- In `onMounted`, they switch to `mailto:` built from parts in `site.ts`. Setting it in `onMounted` avoids a hydration mismatch.
- Without JS, Email goes to the contact form.

### SEO
- **Site config:**
  - `url: https://jameslittlefield.net`, name "James Littlefield", `trailingSlash: false`.
  - Title template `%s | James Littlefield`.
  - Home title: "James Littlefield, AI Engineer".
- **Per page:** `useSeoMeta` sets a unique title and description (from `seo` in the data), the canonical, `og:*` and `twitter:card=summary_large_image`.
- **Share images:**
  - 1200x630 per page, made with `nuxt-og-image` from one custom template in palette A (project name, type label, screenshot).
  - **Module settings:**
    - `ogImage.zeroRuntime: true`, so the PNGs are prerendered at generate time.
    - `ogImage.defaults.height: 630`, because the module defaults to 600.
    - Install the `@takumi-rs/core` renderer and name the template `app/components/OgImage/Card.takumi.vue`. The default Satori renderer can't read woff2 fonts.
    - Set `global: true` on Onest in `fonts.families`, so the image renders in Onest and not the default font.
    - Never set `ogImage` in `useSeoMeta`. Use `defineOgImage` instead.
  - Home gets its own image.
  - **Fallback if the module fights static output:** hand-built PNGs in `public/og/`.
- **Structured data** (`nuxt-schema-org`):
  - `Person` on the site: name, jobTitle "AI Engineer", url, image, `sameAs` GitHub/LinkedIn, **no email**.
  - `WebSite`.
  - On each case study: `CreativeWork` with `author` = Person, plus a `BreadcrumbList`. Not `SoftwareApplication`: Google's rich-results check flags it without `offers`.
- **Sitemap:** generated, exactly 5 URLs.
  - @nuxtjs/seo 6 also generates `llms.txt` and `.md` copies of each page. Keep `llms.txt`, since it helps AI crawlers.
  - Keep the `.md` copies out of the sitemap, or disable them.
- **robots.txt:**
  - Allows everything, explicitly including GPTBot, ClaudeBot and PerplexityBot.
  - Points to the sitemap.
- **404 page:**
  - `error.vue`, prerendered with real content via `experimental.prerenderErrorPages: true`. By default it's an empty shell.
  - `noindex`, with links back to Home and the projects.
- **Turn off `skewProtection`.** It ships with @nuxtjs/seo 6 and does nothing useful without a build cache that persists between CI runs.
- **Semantics:**
  - One h1 per page.
  - Real text everywhere: no text inside images.
  - Every image has alt text and explicit width/height.
- **Link checking:** link-checker runs with `failOnError: true`. It also checks anchors, so these ids must exist:
  - section ids `projects` and `contact` on Home
  - `video` on any case study with an enabled video (v11 uses `opendoor-video`, so rename it)

### Performance
- **Images:** screenshots go through `<NuxtImg>`/`<NuxtPicture>` with WebP/AVIF, responsive `sizes` and lazy loading below the fold. The portrait is eager and high priority.
- **Fonts:** self-hosted with `font-display: swap`.
- **Video:** `preload="none"`.
- **Target:** Lighthouse ≥ 95 for Performance, Accessibility, Best Practices and SEO on Home and one case study (mobile profile).

### Hosting and deploy (AWS S3 + CloudFront, unchanged otherwise)
- **Origin (verified):**
  - CloudFront fronts the **S3 website endpoint**: `/nope` returns `x-amz-error-code: NoSuchKey` from AmazonS3.
  - Today's "everything returns index.html with a 404" comes from the bucket's **ErrorDocument = index.html**.
  - S3 website also 302-redirects `/x` to `/x/` when `x/index.html` exists. That's why the rewrite and the trailing-slash 301 below must ship and be tested together, or they redirect in a loop.
- **CloudFront viewer-request function:** `infra/cloudfront/viewer-request.js` (cloudfront-js-2.0).
  - **Code rules:**
    - A top-level `handler`, no CommonJS. The export for tests is guarded with `typeof module !== 'undefined'`.
    - Under 10 KB.
    - Unit-tested.
  - **Order:**
    1. Normalize the trailing slash. Any path ending in `/` (except `/`) is matched without the slash.
    2. Redirect table (301). A `#` in `Location` is valid.
    3. Rewrite.
  - **301 redirects:**
    - `/about`, `/experience`, `/home`, `/portfolio`, `/work` → `/`
    - `/projects/6` → `/projects/resumeiq`
    - `/projects/7` → `/projects/folio`
    - any other `/projects/<number>` → `/projects`
    - `/James_Littlefield_Senior_Full_Stack_Developer.pdf` → `/resume.pdf`
    - any other path that had a trailing slash → the same path without it
  - **Rewrites:**
    - `/` → `/index.html`
    - `/projects` → `/projects/index.html` and `/contact` → `/contact/index.html` (the prerendered section URLs; this case is covered by the generic rule but is tested explicitly)
    - extensionless paths → `<path>/index.html`
- **Error handling:**
  - Set the bucket website **ErrorDocument to `404.html`** (`aws s3api put-bucket-website`).
  - Also add a CloudFront custom error response mapping 403/404 → `/404.html` with **HTTP 404**, as a backup. Remove any existing mapping to `index.html`.
- **Who changes AWS:** James applies the CloudFront and bucket changes himself, from documented steps in `infra/cloudfront/README.md`. Or I run the `aws` CLI only with his explicit OK.
- **`.github/workflows/deploy-aws.yml`:**
  - **Triggers:** add a `build-and-test` job on pull requests and pushes. It runs `npm ci`, lint, unit tests, `npm run generate`, `check-seo` and Playwright, and doesn't deploy. That way the first Linux build (with its native image binaries) isn't the launch itself. The deploy job runs on `main` only and needs `build-and-test`.
  - **Build:** Node from `.nvmrc`. `npm ci`, then `npm run generate`.
  - **Env:** map the EmailJS vars from the existing secrets, e.g. `NUXT_PUBLIC_EMAILJS_SERVICE_ID: ${{ secrets.VITE_EMAILJS_SERVICE_ID }}`, and the same for the other two.
  - **Sync `.output/public/`:** passes with non-overlapping include/exclude lists, no `--delete` until the end:
    1. `_nuxt/` except `_nuxt/builds/`: `max-age=31536000, immutable` (these are content-hashed).
    2. `_nuxt/builds/`: `no-cache`.
    3. `_ipx/`: `max-age=86400`. These paths aren't content-hashed, and the files keep the source extension while holding WebP or AVIF, so use per-format passes with an explicit `--content-type`: `--include "*f_webp*"` gets `image/webp`, `*f_avif*` gets `image/avif`.
    4. Other assets (`images/`, `videos/`, `og/`, `resume.pdf`, fonts): `max-age=86400`. `.vtt` gets `--content-type text/vtt`.
    5. HTML, `sitemap.xml`, `robots.txt`, `llms.txt`: `no-cache`, last.
    6. A final `aws s3 sync --delete` to remove stale files.
  - **Then** the CloudFront invalidation.
  - Merging to main is the launch.
- **Launch order:**
  1. Merge, which deploys.
  2. Set the bucket ErrorDocument.
  3. Publish and associate the CloudFront function.
  4. Swap the error responses.
  5. Invalidate.
  6. Verify with curl.
  7. Submit the sitemap in Google Search Console and Bing Webmaster.
  8. Check one case study in LinkedIn Post Inspector.

### Inputs James supplies (not blockers)
- An AI Engineer résumé PDF. Until then, the current PDF is copied to `public/resume.pdf`.
- Open Door and Folio live demo URLs when deployed.
- Videos when he's ready. Enabling one means setting `video.enabled`, `src` and `poster` in `projects.ts` and adding the files to `public/videos/`. Swapping in a better version later means replacing the file.
- Code links: the repos are already in the data, so set `code.enabled: true` when ready.

### Left to the builder
- Exact component boundaries.
- Test file layout.
- The OG template's visual details, within palette A.

---

## Phased development plan

Build in 7 phases. Each phase ends at a working, reviewable state. Then work stops so James can review (localhost link plus screenshots) and wait.
- **Commits:** I propose one commit per phase on `nuxt-rewrite` and run it only on his explicit OK. Nothing is pushed until Phase 7.
- **Task plans:** `superpowers:writing-plans` writes a task-level plan **for the next phase only**, just before it starts, so each plan reflects what earlier phases taught. This avoids one big plan that goes stale.
- **Order:** risky tooling is proven first, so problems surface on a near-empty app rather than at launch.
- **Phase tests:** each phase's tests are added in that phase and must stay green in every later phase.

### Phase 0: Spec (docs only)
- **Work:**
  - Save this document as `docs/superpowers/specs/2026-11-17-portfolio-rewrite-design.md`.
  - Write the Phase 1 task plan in `docs/superpowers/plans/`.
- **Done when:** both files exist and James has seen them.

### Phase 1: Foundation and tracer bullet (prove the risky tooling)
- **Setup:**
  - `git fetch`, then `git switch -c nuxt-rewrite origin/dev`. Local `main`/`dev` are stale: local `main` is 108 commits behind and lacks `deploy-aws.yml`. Carry over the `.superpowers/` line in `.gitignore`.
  - Use Node 24 locally (fnm). Set `.nvmrc` to 24.
  - Remove the old `src/`, `index.html`, `vite.config.ts`, `tsconfig.node.json`, Vuetify deps, `dist/` and `public/sitemap.xml` + `robots.txt`. Read `src/views/ContactView.vue` first for the EmailJS params.
  - Scaffold Nuxt 4 in the repo root with the modules from Stack.
  - Add `@nuxt/eslint` and Prettier, keeping `.prettierrc.json`. Set up Vitest and Playwright.
- **Port** the v11 tokens, base CSS and focus styles into `app/assets/css/`. Set up `@nuxt/fonts` (Onest `global: true`).
- **Tracer bullet** (one bare Home and one bare `/projects/open-door`), proving each risky item:
  - `nuxt generate` writes full HTML for both, plus `/projects` and `/contact`.
  - One `<NuxtImg>` produces `_ipx/` WebP/AVIF.
  - One `nuxt-og-image` PNG at 1200x630, rendered in Onest with `@takumi-rs/core`.
  - `404.html` has real content (`prerenderErrorPages`).
  - `skewProtection` is off.
  - link-checker runs with `failOnError`.
- **Done when:**
  - lint, unit tests and generate pass on Node 24.
  - Inspecting `.output/public` confirms every item above.
  - **If the OG module fights static output, switch to the hand-built PNG fallback now**, not later.

### Phase 2: Home page
- **Types and data:** `app/types/project.ts` (including the architecture union), `app/data/projects.ts` (all 4 projects ported from v11) and `app/data/site.ts`.
- **Assets:** screenshots go to `public/images/projects/`, `james.jpg` to `public/images/`, and the current résumé to `public/resume.pdf`.
- **Components:**
  - SiteHeader, IntroHero, ProjectBlock, ProofLinks (disabled states), StackList, StatRow, BrowserFrame, MediaStage, CapabilitiesStrip, SiteFooter
  - Contact section markup with DirectLinks and the form fields. The form doesn't send yet.
- **Section URLs:** `/projects` and `/contact` with `scrollBehavior`, reduced-motion handling, header offset and canonical `/`.
- **Tests:** ProofLinks and data-integrity unit tests. Playwright checks nav and section URLs, that Tab skips disabled links, axe on Home, and no overflow at the 6 widths.
- **Done when:** Home matches the v11 screenshots at 390, 820 and 1440, and all tests pass.

### Phase 3: Case study pages and 404
- **Page:** `pages/projects/[slug].vue`, prerendered for the 4 slugs.
- **Components:** ProjectTabs, SectionToc (sticky on wide screens), ArchitectureSteps (both union shapes), ResultsTable (scrolls in a focusable region), ScreenshotGallery (uncropped), PrevNext.
- **Video:** VideoPlayer, tested with a fixture only (no video renders at launch).
- **Error page:** `error.vue` with real content, `noindex` and links home.
- **Tests:** VideoPlayer unit test. Playwright checks project-name and Case study links reach each page, axe on all 4 pages plus 404, and no overflow.
- **Done when:** all 4 case studies match v11 at the 3 widths and all tests pass.

### Phase 4: Contact form
- **Form:**
  - `@emailjs/browser` with `runtimeConfig.public.emailjs*`. Rename the local `.env` keys to `NUXT_PUBLIC_EMAILJS_*`.
  - Validation on blur and submit, `aria-invalid`/`aria-describedby`, `aria-live` status.
  - Sending, success and failure states.
  - The honeypot (shows the normal success message, no `blockHeadless`).
- **Email links:** the Email button and direct link switch to `mailto:` in `onMounted`.
- **Tests:** ContactForm unit tests with EmailJS mocked. Playwright intercepts the EmailJS request for error, success and failure.
- **Done when:** tests pass, and **one real test message reaches James's inbox** from local dev (he confirms).

### Phase 5: SEO and performance
- **SEO setup:**
  - Site config and title template.
  - `useSeoMeta` per page, using `defineOgImage` for each page's image.
  - Schema.org: Person (no email), WebSite, CreativeWork + BreadcrumbList.
  - Sitemap (exactly 5 URLs, no `.md` copies).
  - robots.txt (welcomes AI crawlers) and `llms.txt`.
  - OG images for all 5 pages.
- **Performance:** `<NuxtImg>` sizes and loading priority everywhere.
- **SEO check:** `scripts/check-seo.ts`, which runs every check in Verification step 3.
- **Done when:**
  - `check-seo` passes.
  - Lighthouse (mobile) is ≥ 95 in all four categories on Home and `/projects/open-door`.
  - The `jameslittlefield3@` grep finds nothing.

### Phase 6: Hosting, CI and docs
- **CloudFront function:** `infra/cloudfront/viewer-request.js` with unit tests for every redirect, rewrite and trailing-slash case, under 10 KB.
- **AWS steps:** `infra/cloudfront/README.md` lists, step by step:
  - the bucket ErrorDocument change to `404.html`
  - function publish and association
  - the error-response swap
  - the curl checks
- **`deploy-aws.yml`:**
  - a `build-and-test` job on PRs and pushes
  - a main-only deploy that depends on it
  - Node from `.nvmrc`
  - the EmailJS secret mapping
  - the ordered sync passes with content types, then the final `--delete` and the invalidation
- **Docs:** a new `DESIGN.md` (tokens, contrast table, components, rules). `README.md` covers dev, generate, preview, deploy, and how to enable a Video, Code or Live demo link.
- **Done when:**
  - unit tests pass
  - the workflow passes `actionlint` (if available) or a careful review
  - the full Verification section passes locally

### Phase 7: Launch (every step needs James's explicit OK)
1. Push `nuxt-rewrite` and open a PR into `dev`. Confirm `build-and-test` passes on Linux.
2. Merge into `dev`, then open the PR `dev` → `main`.
3. Merge to `main`, which deploys.
4. James applies the AWS steps from the README, or I run them with his OK.
5. Post-launch checks (Verification step 8), the LinkedIn Post Inspector, and the Search Console and Bing sitemap submissions.

**Rollback:** if launch goes wrong, revert the merge on `main`, which redeploys the old site, and undo the AWS changes. The README records the original CloudFront and bucket settings before anything is changed.

## Critical files
- **New:**
  - `nuxt.config.ts`, `app/app.vue`, `app/error.vue`
  - `app/pages/index.vue`, `app/pages/projects/[slug].vue`
  - `app/components/*`
  - `app/data/projects.ts`, `app/data/site.ts`, `app/types/project.ts`
  - `app/assets/css/tokens.css`, `app/assets/css/base.css`
  - `infra/cloudfront/viewer-request.js`
  - `tests/unit/*`, `tests/e2e/*`, `scripts/check-seo.ts`
- **Changed:** `.github/workflows/deploy-aws.yml`, `package.json`, `.nvmrc`, `.gitignore`, `DESIGN.md`, `README.md`.
- **Removed:**
  - `src/`, `index.html`, `vite.config.ts`, `tsconfig.node.json`
  - `public/sitemap.xml`, `public/robots.txt` (both now generated)
- **References** (read-only):
  - `.superpowers/brainstorm/18672-1794933570/content/v11-product-showcase.html` (the visual and copy source of truth)
  - `.superpowers/brainstorm/content-brief-v3.md`
  - the current `src/views/ContactView.vue` (EmailJS params), read before deleting

## Verification
1. **Unit tests** (`npm run test`):
   - ContactForm: validation messages, honeypot, success/failure states with `@emailjs/browser` mocked.
   - ProofLinks: enabled vs disabled rendering. Disabled items are not anchors and not focusable.
   - VideoPlayer: with a fixture, it renders poster, track and description.
   - Data integrity: each project has 3 stats, and every referenced image file exists in `public/`. Any link with `enabled: true` has its URL, or its file for videos.
   - CloudFront function: every redirect, rewrite and trailing-slash case.
2. **`npm run generate`** succeeds with link-checker clean.
3. **`scripts/check-seo.ts` on `.output/public`:**
   - The 5 indexable pages (Home + 4 case studies) each have a unique `<title>`, meta description, self canonical, `og:image` (the file exists, 1200x630) and parseable JSON-LD.
   - `projects/index.html` and `contact/index.html` exist with canonical `/`.
   - Each page's body text is present in the raw HTML.
   - The string `jameslittlefield3@` appears nowhere in the output.
   - The sitemap has exactly the 5 URLs.
   - `404.html` exists, has body text and is `noindex`.
   - No `.md` copies in the sitemap.
   - `og:image` PNGs are 1200x630.
4. **Playwright e2e against `npx serve .output/public`:**
   - Nav: Projects and Contact change the URL to `/projects` and `/contact` and scroll to the section. Loading `/contact` directly lands on the form. The URL bar never shows `#`.
   - Project-name links and Case study links reach each case study.
   - Video, Code and Live demo are disabled on all 4, and Tab skips them.
   - No video players render.
   - The contact form shows errors, then success and failure, with the EmailJS request intercepted.
   - axe reports no serious or critical violations on all 5 pages.
   - No horizontal overflow at 360, 390, 768, 1024, 1280 and 1440.
5. **Visual check:** headless Chrome screenshots at 390, 820 and 1440, compared with the v11 mockup shots in `.superpowers/brainstorm/18672-1794933570/shots/`.
6. **Lighthouse** (mobile) on Home and `/projects/open-door`: ≥ 95 in all four categories.
7. **Grep the source and output:** no em dashes, "→" or " · " in copy, and no British spellings (`colour`, `organis`, `behaviour`).
8. **After launch** (with James): curl `/`, `/projects`, `/contact`, `/projects/open-door`, `/nope` and `/about`, expecting 200, 200, 200, 200, 404 and 301. Then the LinkedIn Post Inspector preview, then submit the sitemap in Search Console.
