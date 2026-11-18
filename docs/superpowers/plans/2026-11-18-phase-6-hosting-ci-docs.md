# Phase 6: Hosting, CI and Docs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Everything needed to launch is built, tested locally and documented, with nothing touching AWS or GitHub yet:
- the CloudFront viewer-request function
- a deploy that uploads each file with the right cache and content headers
- a CI workflow that tests every push and pull request before main deploys
- a step-by-step AWS runbook
- a new README and DESIGN.md

**Architecture:**
- **The function is the router.** `infra/cloudfront/viewer-request.js` normalizes trailing slashes, redirects old URLs and rewrites clean URLs to `index.html` files. `scripts/serve-static.mjs` runs the same file, so the e2e suite exercises the production redirects and rewrites.
- **The deploy is data.** The S3 sync passes live in one module as data. A pure matcher reproduces the AWS CLI's include and exclude rules, so an output test proves every generated file lands in exactly one pass or on the exclusion list. A small script turns the passes into `aws s3 sync` commands, and the workflow runs that script.
- **CI before launch.** The workflow gets a `build-and-test` job on every push and pull request. Deploy runs only on a push to `main`, after `build-and-test` passes, so the first Linux build is never the launch.

**Tech Stack:**
- CloudFront Functions (`cloudfront-js-2.0`), AWS CLI v2 `s3 sync`
- GitHub Actions
- Node 24 ESM scripts, Vitest 5 (a new plain-node test project), Playwright (adding Firefox and WebKit for one tagged test)
- `yaml` (already installed transitively; made explicit)

**Spec:** `docs/superpowers/specs/2026-11-17-portfolio-rewrite-design.md`. Read "Hosting and deploy", "Contact form" (Spam, Config), Phase 6 in "Phased development plan", and Verification items 1, 4 and 8.

**Carry-forward:** `docs/superpowers/plans/2026-11-17-phase-1-carry-forward.md`. Every Phase 6 item and every "Launch prep" item there is accounted for below, either built or ruled on.

## Global Constraints

- **Node:** locally, run every `node`/`npm`/`npx` command as `fnm exec --using=24 -- <command>`. In CI, Node comes from `.nvmrc` (`24`).
- **Git:**
  - Never `git commit`, `git push`, `git add`, `git stash`, `git checkout`, `git restore` or `git reset`, and never open a PR.
  - The controller stages approved work.
  - The phase ends with one proposed commit that needs James's explicit OK.
- **AWS:**
  - No task runs the `aws` CLI against real resources or changes AWS. The `aws` CLI isn't even installed locally.
  - The deploy script must have a `--print` mode that prints the commands and runs nothing. Tests use only that mode.
- **Secrets:** never print `.env` values or the EmailJS config values. No test may send a real email.
- **Deploy facts (from the current workflow):**
  - bucket `s3://jameslittlefield.net`, region `us-east-1`
  - secrets `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `CLOUDFRONT_DISTRIBUTION_ID`, `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`
- **Cache-Control values** (verbatim from the spec):
  - `max-age=31536000, immutable` for hashed assets
  - `no-cache` for HTML, data and crawler files
  - `max-age=86400` for other assets
- **Function rules (from the spec):**
  - `cloudfront-js-2.0`: a top-level `function handler(event)`, no `import`, `export` or `require`.
  - The test export is guarded with `typeof module !== 'undefined'`.
  - Under 10 KB.
  - Order: normalize the trailing slash, then redirect (301), then rewrite.
- **Copy:**
  - American English.
  - No em dashes anywhere, comments and docs included.
  - No "→" or " · " in copy.
  - Sentence case.
  - README and DESIGN.md read as written by a person (see the `portfolio-voice` rules: plain, specific, no hype).

## Decisions this plan makes

- **Location headers are path-only** (`/projects`, not `https://...`), and keep the query string. Both are valid in a 301, and they work on any host.
- **Trailing slashes:** a path with several trailing slashes is matched with all of them removed. Old URLs redirect in one hop, even with a trailing slash (`/projects/6/` goes straight to `/projects/resumeiq`).
- **Tests for the function and the deploy logic** run in a new plain-node Vitest project inside `npm test` (`tests/infra/`). The test that needs the built site lives in `tests/output/`.
- **Workflow checking:** `actionlint` isn't installed, so a Vitest test parses the workflow YAML and asserts its structure (jobs, triggers, `needs`, the `main` guard, env mapping, step order). The final review reads it as a whole.
- **CI order:** `npm ci`, lint, typecheck, unit tests, generate, `test:output`, `check-seo`, then Playwright. Typecheck runs before generate, because `nuxt typecheck` wipes `.output`.
- **The deploy job builds again** with the real EmailJS secrets, because `build-and-test` uses dummy values. It fails before uploading anything if any of the three secrets is empty.
- **No-JS form posts:** CloudFront answers `POST /contact` with a 403, which the error response turns into the 404 page. That is accepted for the tiny no-JS audience. The runbook includes the curl check, and the README records it.
- **Response headers:** the runbook offers attaching CloudFront's managed `SecurityHeadersPolicy` (HSTS, nosniff, frame options, referrer policy) as an optional step. A Content-Security-Policy is left out: Nuxt inlines scripts and styles, so a strict CSP would break the site, and a loose one adds little.
- **Launch prep items:**
  - **Built:** the shared sending state (it closes the duplicate-send edge, half of M4), and a Firefox and WebKit run of the hash-landing test (the "Safari and Firefox" launch check).
  - **Parked, with their notes:**
    - R1 (glide versus jump on Back/Forward within a page, cosmetic)
    - R3 (a reload on a hash URL lands at the hash)
    - M4's send timeout (a timeout plus a late success can duplicate an email)
  - **Accepted:** M5 stays accepted.
  - **Runbook:** the LinkedIn cache check moves into the runbook's post-launch steps.
- **Spec wording:** Verification 4 says `npx serve`. It is amended to name `scripts/serve-static.mjs`.
- **Lighthouse stays manual** (`npm run lighthouse` before a launch or a design change). It doesn't run in CI, because simulated scores vary run to run and a flaky gate gets ignored.
- **Already closed:** Playwright's `reuseExistingServer: !process.env.CI` (done in Phase 3).

## Review Focus

1. **Someone follows an old link.** For example `/about/`, `/projects/6/`, or `/projects/?utm_source=li`. They should reach the right page in one 301, with the query kept. (Task 1)
2. **A new kind of file appears in `.output/public`.** It would be uploaded with default headers, or not at all. The coverage test must fail on any file that is in no pass and not explicitly excluded. (Task 3)
3. **A deploy runs with a missing EmailJS secret.** It would ship a form that always fails. The deploy job must stop before uploading. (Task 4)
4. **Returning visitors after a deploy.** They must get fresh HTML and `_nuxt/builds/` metadata, with hashed assets cached for a year. HTML must upload last, so no page points at assets that aren't there yet. (Task 3)
5. **A visitor leaves Home mid-send and comes back.** They must see "Sending..." with Send guarded, not an enabled button over text that was already sent. (Task 6)

---

### Task 1: CloudFront viewer-request function

**Files:**
- Create: `infra/cloudfront/viewer-request.js`, `scripts/lib/cloudfront-function.mjs`, `tests/infra/viewer-request.test.ts`
- Modify: `vitest.config.ts` (add a plain-node project `infra` with `include: ['tests/infra/**/*.test.ts']`), `tsconfig.tooling.json` (include `tests/infra/**/*.ts`, `infra/**/*.js` if needed)

**Interfaces:**
- **Produces, in `infra/cloudfront/viewer-request.js`:** `function handler(event)`.
  - `event.request` has `{ method, uri, querystring: { [name]: { value, multiValue?: [{ value }] } }, headers }`.
  - **Rewrite:** returns the request with `uri` changed.
  - **Redirect:** returns `{ statusCode: 301, statusDescription: 'Moved Permanently', headers: { location: { value } } }`.
- **Produces, in `scripts/lib/cloudfront-function.mjs`:** `loadViewerRequest(file?: string): (event) => object`.
  - It loads the file with `node:vm` into a fresh context that provides `module = { exports: {} }`, and returns `module.exports.handler`.
  - The repo is `"type": "module"`, so this file can't be `require`d. Loading it this way also proves it has no `import` or `export`.

- [ ] **Step 1: Write the failing table test** `tests/infra/viewer-request.test.ts`. It uses `loadViewerRequest()`, with one `it.each` row per case:
  - **Rewrites** (expect the request back with this `uri`):
    - `/` gives `/index.html`
    - `/projects` gives `/projects/index.html`
    - `/contact` gives `/contact/index.html`
    - `/projects/open-door` gives `/projects/open-door/index.html`
    - `/nope` gives `/nope/index.html`
  - **Unchanged:**
    - `/index.html`, `/resume.pdf`, `/llms.txt`, `/projects/folio.md`, `/_nuxt/a1b2.js`
    - `/_ipx/f_avif&s_324x203/images/projects/x.png`
  - **301s** (expect `statusCode` 301 and exactly this `location`):
    - `/projects/` to `/projects`
    - `/projects/open-door/` to `/projects/open-door`
    - `/projects//` to `/projects`
    - `/about`, `/experience`, `/home`, `/portfolio` and `/work` to `/`
    - `/about/` to `/`
    - `/projects/6` and `/projects/6/` to `/projects/resumeiq`
    - `/projects/7` to `/projects/folio`
    - `/projects/12` to `/projects`
    - `/James_Littlefield_Senior_Full_Stack_Developer.pdf` to `/resume.pdf`
  - **Query kept:**
    - `/projects/` with `utm_source=li` gives `/projects?utm_source=li`
    - `/about` with `ref=x&y=1` gives `/?ref=x&y=1`
    - a `multiValue` query (`a=1&a=2`) gives `?a=1&a=2`
  - **Size:** `statSync('infra/cloudfront/viewer-request.js').size < 10240`.
- [ ] **Step 2: Run** `fnm exec --using=24 -- npx vitest run --project infra`. Expect FAIL (the file doesn't exist).
- [ ] **Step 3: Implement** the function in the spec's order, plus the loader.
  - Use only syntax `cloudfront-js-2.0` documents (`var`/`const`/`let`, functions, `String.prototype` basics, regex).
  - Add a header comment that names the runtime and points at the test.
  - Add the vitest project.
- [ ] **Step 4: Run** the infra project, `npm test`, `npm run lint` and `npm run typecheck`. Expect PASS.

### Task 2: The local server runs the function

**Files:**
- Modify: `scripts/serve-static.mjs`, `tests/e2e/smoke.spec.ts` (or a new `tests/e2e/routing.spec.ts`)

**Interfaces:**
- **Consumes:** `loadViewerRequest()` (Task 1).
- **Produces:** `scripts/serve-static.mjs` builds a CloudFront-shaped event from each request (method, path, query parsed into `querystring`) and calls the handler.
  - **Redirect:** it answers a 301 response with its `location`.
  - **Rewrite:** it serves the rewritten `uri` as a file. A missing file serves `404.html` with status 404, as the bucket's ErrorDocument does.
  - **Root check:** tightened to `file === root || file.startsWith(root + sep)`.

- [ ] **Step 1: Write failing e2e tests** with `request` (no browser):
  - `GET /projects/` is a 301 to `/projects` (`maxRedirects: 0`).
  - `GET /projects/6/` is a 301 to `/projects/resumeiq`.
  - `GET /about?ref=x` is a 301 to `/?ref=x`.
  - `GET /projects/open-door` is a 200 with the case study h1.
  - `GET /nope` is a 404 with the 404 page.
  - `GET /..%2fpackage.json` is a 404, not the file.
- [ ] **Step 2: Run** `fnm exec --using=24 -- npx playwright test routing`. Expect the 301 tests to FAIL.
- [ ] **Step 3: Implement** it in `serve-static.mjs`, keeping its compression and content types.
- [ ] **Step 4: Run** `npm run generate`, then the full `npm run test:e2e`. Expect PASS, and every existing navigation test still green.

### Task 3: Deploy sync passes

**Files:**
- Create: `infra/deploy/sync-passes.mjs`, `scripts/deploy-s3.mjs`, `tests/infra/sync-passes.test.ts`, `tests/output/sync-coverage.test.ts`
- Modify: `package.json` (script `"deploy:print": "node scripts/deploy-s3.mjs .output/public s3://jameslittlefield.net --print"`)

**Interfaces:**
- **Produces, in `infra/deploy/sync-passes.mjs`:**
  - `type Filter = ['exclude' | 'include', string]`.
  - `SYNC_PASSES: Array<{ name: string; filters: Filter[]; cacheControl: string; contentType?: string }>`, in upload order. Each pass's filters start with `['exclude', '*']`.
  - `EXCLUDED: string[]`: glob patterns never uploaded. Exactly `['200.html', '_og-static-fonts/*']`.
  - `matches(rel: string, filters: Filter[]): boolean`: the AWS CLI's rule. Every file starts included, filters apply in order, and the last filter that matches wins. In patterns, `*` matches any characters including `/`, and `?` matches one character. `rel` is the POSIX path relative to the source directory.
  - `syncCommands(src: string, bucket: string): string[][]`: one argv array per pass, `['s3', 'sync', src, bucket, ...filters as --exclude/--include, '--cache-control', value, ('--content-type', value)?]`. Then a final `['s3', 'sync', src, bucket, '--delete', ...EXCLUDED as --exclude]`.
- **Produces, in `scripts/deploy-s3.mjs`:** `node scripts/deploy-s3.mjs <src> <bucket> [--print]`.
  - With `--print`, it prints each command on one line, shell-quoted, and runs nothing.
  - Without it, it runs each command with `execFileSync('aws', argv, { stdio: 'inherit' })` and stops at the first failure.

- [ ] **Step 1: Write failing tests.**
  - **`tests/infra/sync-passes.test.ts`:**
    - `matches` semantics: a later include beats an earlier exclude, and `_nuxt/*` matches `_nuxt/fonts/a.woff2`.
    - No pass contains `--delete`, and the last command has `--delete` plus an `--exclude` for each `EXCLUDED` pattern.
    - The no-cache HTML pass comes after every asset pass.
    - The cache values are exactly the three Global Constraint values.
  - **`tests/output/sync-coverage.test.ts`** (on the real `.output/public`):
    - Every file matches exactly one pass, or matches `EXCLUDED`. The failure message lists unclaimed or double-claimed files.
    - `200.html` and `_og-static-fonts/*` are excluded.
    - Spot checks:
      - a `_nuxt/*.js` file is immutable
      - `_nuxt/builds/latest.json` is `no-cache`
      - an `_ipx/f_avif*` file gets `image/avif` and an `_ipx/f_webp*` file `image/webp`
      - `index.html`, `projects/folio/_payload.json`, `llms.txt`, `llms-full.txt`, `sitemap.xml` and `robots.txt` are `no-cache`
      - `projects/folio.md` is `no-cache` with `text/markdown; charset=utf-8`
      - `images/james.jpg`, `resume.pdf`, `favicon.svg` and an `_og/s/*.png` file are `max-age=86400`
- [ ] **Step 2: Run** them. Expect FAIL.
- [ ] **Step 3: Implement** the passes, in the spec's order:
  1. `_nuxt/` except `_nuxt/builds/`
  2. `_nuxt/builds/`
  3. `_ipx/`, one pass per format (`f_avif`, `f_webp`, `f_png`, `f_jpeg`), each with its explicit content type
  4. other assets (`images/`, `videos/` with `.vtt` as `text/vtt`, `_og/`, `resume.pdf`, `favicon.svg`, `__sitemap__/`)
  5. no-cache: Markdown with its type, then HTML, `_payload.json`, `__ai-ready/`, `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`

  Derive the `_ipx` formats from the real output, not from memory.
- [ ] **Step 4: Run** `npm test`, `npm run generate`, `npm run test:output` and `npm run deploy:print`. Expect PASS, and paste the printed commands into the report.

### Task 4: CI and deploy workflow

**Files:**
- Modify: `.github/workflows/deploy-aws.yml`, `package.json` (devDependency `yaml` at the installed version)
- Create: `tests/infra/workflow.test.ts`

**Interfaces:**
- **Consumes:** `scripts/deploy-s3.mjs` (Task 3).

- [ ] **Step 1: Write the failing test** `tests/infra/workflow.test.ts`. Parse the YAML with `yaml` and assert:
  - **Triggers:** `on` has `push`, `pull_request` and `workflow_dispatch`.
  - **Permissions:** top-level `permissions: { contents: read }`.
  - **`build-and-test`:**
    - `ubuntu-latest`
    - `actions/setup-node` with `node-version-file: .nvmrc` and npm cache
    - steps in this order: `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run generate`, `npm run test:output`, `npm run check-seo`, `npx playwright install --with-deps chromium firefox webkit`, then `npm run test:e2e`
    - env `NUXT_PUBLIC_EMAILJS_SERVICE_ID`, `NUXT_PUBLIC_EMAILJS_TEMPLATE_ID` and `NUXT_PUBLIC_EMAILJS_PUBLIC_KEY` set to non-empty dummy literals, never secrets
    - on failure it uploads `playwright-report/` as an artifact
  - **`deploy`:**
    - `needs: build-and-test`
    - `if` true only for a push to `refs/heads/main`
    - a `concurrency` group with `cancel-in-progress: false`
    - env maps `NUXT_PUBLIC_EMAILJS_SERVICE_ID: ${{ secrets.VITE_EMAILJS_SERVICE_ID }}`, and the same for the other two
    - a guard step fails if any of the three is empty, and it comes before `npm run generate`
    - then `npm run check-seo`
    - `aws-actions/configure-aws-credentials` with `us-east-1`
    - then `node scripts/deploy-s3.mjs .output/public s3://jameslittlefield.net`
    - then the CloudFront invalidation with `--paths "/*"` and `secrets.CLOUDFRONT_DISTRIBUTION_ID`
  - **Copy:** no step `run` contains an emoji or an em dash.
- [ ] **Step 2: Run** `npx vitest run --project infra workflow`. Expect FAIL.
- [ ] **Step 3: Rewrite the workflow** to match. Keep the existing action major versions (`checkout@v4`, `setup-node@v4`, `configure-aws-credentials@v4`) and the existing secret names.
- [ ] **Step 4: Run** `npm test` and `npm run lint`. Expect PASS. Report anything a careful read of the YAML suggests might fail on Linux (for example case-sensitive paths). The lockfile already has the Linux builds of sharp and takumi.

### Task 5: AWS runbook and README

**Files:**
- Create: `infra/cloudfront/README.md`
- Modify: `README.md` (full rewrite), `docs/superpowers/specs/2026-11-17-portfolio-rewrite-design.md` (Verification 4: `npx serve` becomes `scripts/serve-static.mjs`)

**Interfaces:**
- **Consumes:** the function (Task 1), `deploy:print` (Task 3), the workflow (Task 4).

- [ ] **Step 1: Write `infra/cloudfront/README.md`**, a runbook James can follow line by line, each step with its exact `aws` command or console path.
  - **Before:** save the current settings for rollback (`aws cloudfront get-distribution-config`, `aws s3api get-bucket-website`) to files outside the repo.
  - **Launch order (from the spec):**
    1. Merge, which deploys.
    2. Bucket ErrorDocument to `404.html`.
    3. Create the function.
    4. `aws cloudfront test-function`, with sample events for `/projects/`, `/about` and `/projects/open-door`.
    5. Publish the function, and associate it as viewer-request on the default behavior.
    6. Swap the error responses: 403/404 to `/404.html` with 404, and remove any mapping to `index.html`.
    7. Invalidate.
  - **Optional:** the managed `SecurityHeadersPolicy`. Explain what it adds, and why there's no CSP.
  - **Keep compression on.** Verified live. Without it, Open Door scores about 0.91 to 0.94.
  - **Post-launch curl checks:**
    - status for `/`, `/projects`, `/contact`, `/projects/open-door`, `/nope`, `/about`, `/projects/` and `/projects/6`
    - one `_ipx` AVIF URL with its content type
    - `content-encoding: br`
    - `curl -i -X POST https://jameslittlefield.net/contact`: the expected 403 or 404, which is accepted
  - **After launch:** Search Console and Bing sitemap submission, LinkedIn Post Inspector (and re-scraping after a hero change), Safari and Firefox spot checks.
  - **Rollback:** revert the merge on `main`, and restore the saved configs.
- [ ] **Step 2: Rewrite `README.md`** for the new site. Cover:
  - what it is
  - the stack
  - setup (Node 24, `.env` from `.env.example`)
  - `dev`, `generate`, `preview`
  - every test command, including `check-seo` and `lighthouse`
  - how deploys work (CI, and a link to the runbook)
  - how to enable a Video, Code or Live demo link (a data change in `app/data/projects.ts`, plus files in `public/videos/` for video)
  - how to replace `resume.pdf` (swap the file, and remove its `EMAIL_ALLOWED` entry if the new one has no address)
  - EmailJS: the dashboard domain allowlist and rate limit (James's action), and the 412 fix (Disconnect, Connect Account with "Send email on your behalf" checked, Update Service; seen 2026-11-18)
  - no-JS posts
- [ ] **Step 3: Verify.**
  - Every command in both files exists (`package.json` scripts, file paths).
  - `grep -nP "\x{2014}|\x{2192}| \x{00B7} |colour|behaviour|organis"` (em dash, arrow, middle dot, British spellings) on both is empty.
  - `npm run lint` passes.

### Task 6: Launch-prep fixes

**Files:**
- Modify: `app/components/ContactForm.vue`, `tests/nuxt/ContactForm.test.ts`, `tests/e2e/contact.spec.ts`, `playwright.config.ts`, `tests/e2e/case-nav.spec.ts` (tag only)

- [ ] **Step 1: Write failing tests.**
  - **Unit:** with `sending` held (an unresolved send), unmounting and remounting the form shows "Sending...". `aria-disabled` is `true`, and a submit doesn't call `send` again.
  - **e2e:**
    - Hold the intercepted EmailJS POST (the route never fulfills until the test releases it).
    - Submit, client-navigate to `/projects/folio`, then `goBack()`.
    - The button reads "Sending..." and a click sends nothing new (count the intercepted requests).
    - Release: the success copy shows, and the fields clear.
    - Keep the `beforeEach` abort, so nothing can reach EmailJS.
- [ ] **Step 2: Run** them. Expect FAIL.
- [ ] **Step 3: Implement.**
  - Move `sending` and `status` into `useState('contact-sending', …)` and `useState('contact-status', …)`.
  - `reset()` and the unit test cleanup (`clearNuxtState`) cover the new keys.
- [ ] **Step 4: Cross-browser landing.**
  - Tag the direct-landing hash test in `case-nav.spec.ts` with `@cross-browser`.
  - Add Playwright projects `firefox` and `webkit` with `grep: /@cross-browser/`.
  - Install the browsers locally with `fnm exec --using=24 -- npx playwright install firefox webkit`.
  - Run it. If WebKit or Firefox fails, that is a real finding: report it with the recorded scroll positions, and don't loosen the test.
- [ ] **Step 5: Verify.**
  - Run the full gate: lint, typecheck, `npm test`, generate, `test:output`, `check-seo` and `test:e2e` (all three projects).
  - Then `npx playwright test contact --repeat-each=10`, with zero failures.
- [ ] **Step 6: Update the carry-forward notes.**
  - Mark the Phase 6 items done and how.
  - In Launch prep, note that M4's duplicate-send edge is closed, and that only the timeout part stays.
  - Mark the Safari and Firefox check automated.
  - Keep R1, R3 and M5 as they are.

### Task 7: DESIGN.md

**Files:**
- Modify: `DESIGN.md` (full rewrite, replacing "Professional Navy")

- [ ] **Step 1: Write it from the code**, not from memory: `app/assets/css/tokens.css`, `base.css`, `ui.css` and the components. Cover:
  - **Direction:** the v11 Product Showcase in Sanzo Wada palette A.
  - **Tokens:** every color, with its role, and the type scale, spacing, radii and max width.
  - **Contrast table:** every text and background pair, plus field borders. Compute each ratio with a throwaway script (WCAG relative luminance). Report the script's output, and flag any pair under 4.5:1 (or 3:1 for borders and large text).
  - **Components:** a one-line purpose each.
  - **Responsive rules:** from the spec.
  - **Motion:** exactly two motions, the intro settle (the name starts visible, for LCP) and the Send spinner (with its 600ms minimum), both off under `prefers-reduced-motion`.
  - **Writing rules.**
- [ ] **Step 2: Verify.**
  - Every hex in DESIGN.md exists in `tokens.css`, by a grep loop.
  - The copy grep is empty.
  - No ratio was invented: each one matches the script output.

### Review stop (controller with James)

- **Show James:** the runbook, the `deploy:print` output, the workflow, and the README and DESIGN.md.
- **Ask:**
  - whether to attach the optional security headers policy at launch
  - for the go-ahead to start Phase 7 (push and PR into `dev`)

  Every Phase 7 step needs his explicit OK.
