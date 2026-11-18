# Portfolio

The source for jameslittlefield.net, my portfolio as an AI engineer. It has a home page and four case studies (Open Door, Packwright, Folio and ResumeIQ), each written up with the architecture, the decisions and the numbers.

## Stack

- Nuxt 4 in static generate mode, so every page ships as finished HTML with its own title, description, share image and structured data
- Vue 3 and TypeScript
- `@nuxtjs/seo` for the sitemap, robots, structured data and share images, `@nuxt/image` for responsive AVIF and WebP, `@nuxt/fonts` for the Onest and Fragment Mono fonts
- EmailJS for the contact form (called from the browser)
- Hosted on S3 behind CloudFront, deployed by GitHub Actions
- Tests: Vitest, Playwright and axe, plus a Lighthouse script

The visual language (colors, type, spacing, motion) is written down in [`DESIGN.md`](./DESIGN.md).

## Setup

The project needs Node 24 (`.nvmrc`). With fnm, `fnm use` picks it up.

```bash
fnm exec --using=24 -- npm install
fnm exec --using=24 -- npx playwright install chromium firefox webkit
cp .env.example .env
```

The Playwright browsers are what `test:e2e` and `lighthouse` run in.

Fill in `.env` with the three EmailJS values from the EmailJS dashboard (service ID, template ID and public key). They are read at build time and end up in the page, because EmailJS public keys are meant to be public. Without them the site builds and runs, but the contact form cannot send.

## Running it

```bash
npm run dev        # dev server with hot reload
npm run generate   # build the static site into .output/public
npm run preview    # serve .output/public on http://localhost:4173
```

`preview` serves the generated site with the same CloudFront Function that runs in production, so redirects and clean URLs behave the way they do live. Run `generate` first.

## Checks

```bash
npm run lint          # ESLint
npm run typecheck     # nuxt typecheck
npm test              # unit, component and infra tests (Vitest)
npm run test:output   # tests against the generated site
npm run check-seo     # SEO and privacy checks on the generated site
npm run test:e2e      # Playwright: Chromium runs every test, Firefox and WebKit run the @cross-browser test
npm run lighthouse    # mobile Lighthouse on Home and Open Door, fails under 0.95
npm run format        # Prettier
```

Notes on order:

- `typecheck` wipes `.output`. Run `npm run generate` after it and before `test:output`, `check-seo`, `test:e2e` or `lighthouse`, which all read `.output/public`.
- `test:e2e` starts its own static server and stubs every request to EmailJS, so no test sends an email.
- `lighthouse` uses Playwright's Chromium. If it is missing, run `npx playwright install chromium`. Reports go to `.lighthouse/`.

## How deploys work

The workflow in `.github/workflows/deploy-aws.yml` runs on every pull request and on pushes to `main` and `dev`. Its `build-and-test` job runs lint, typecheck, unit tests, `generate`, the output tests, `check-seo` and the Playwright suite. It uses dummy EmailJS values and does not deploy.

The `deploy` job runs only on a push to `main`, and only after `build-and-test` passes. It generates the site with the real EmailJS values from the repository secrets, and stops before uploading anything if any of the three is empty. Then it uploads `.output/public` to the S3 bucket and invalidates the CloudFront cache. Merging to `main` is the release.

The `workflow_dispatch` trigger runs `build-and-test` only and never deploys. To redeploy without a new merge (for example after rotating a secret), re-run the workflow run of the latest push to `main` from the Actions tab.

The upload is `scripts/deploy-s3.mjs`: a series of `aws s3 sync` passes, each with the right `Cache-Control` and, where S3 would guess wrong, a content type. Hashed files under `_nuxt/` are cached for a year, HTML and data files are `no-cache`, and other assets are cached for a day. A final pass deletes stale files. To see the exact commands without running them:

```bash
npm run deploy:print
```

The CloudFront side (the viewer-request function, error responses and bucket settings) is changed by hand. The steps, with the checks to run afterward and the rollback, are in [`infra/cloudfront/README.md`](./infra/cloudfront/README.md).

The repository secrets the workflow uses are `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `CLOUDFRONT_DISTRIBUTION_ID`, `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID` and `VITE_EMAILJS_PUBLIC_KEY`. The `VITE_` names are left over from the old Vite build, and the workflow maps them to the `NUXT_PUBLIC_EMAILJS_*` variables.

## Content changes

### Turn on a Video, Code or Live demo link

Each case study has three links in `app/data/projects.ts`, under `links`. They are all off and shown as disabled until the data says otherwise.

- Code: set `code.enabled` to `true`. The repository URL is already there.
- Live demo: set `demo.url` and `demo.enabled: true`.
- Video: set `video.enabled: true` plus `src` and `poster`. Add `captions` (a `.vtt` file) and `description` if you have them. Put the files in `public/videos/`, then reference them as `/videos/<name>`. To swap in a better version later, replace the file.

Then run `npm test` and `npm run test:e2e`. Some tests pin the current disabled state and will need updating along with the data.

### Replace the resume

Swap `public/resume.pdf` for the new file. The résumé contains an email address, and `check-seo` fails if the address appears anywhere in the generated output. `resume.pdf` is the one listed exception, in `EMAIL_ALLOWED` in `scripts/check-seo.ts`. If the new PDF has no email address, remove that entry so the check covers the PDF too.

## EmailJS

Two settings live in the EmailJS dashboard, not in this repository, and need doing by hand:

- Turn on the domain allowlist and add the production domain. Add `localhost` only if you want to send from a local build.
- Set a rate limit.

If sending fails with HTTP 412, the Gmail permission has expired, even when the dashboard still says "Connected as". It happened on 2026-11-18. The fix: Email Services, the Gmail service, Disconnect, then Connect Account with "Send email on your behalf" checked, then Update Service.

## Forms without JavaScript

Before the JavaScript loads, or with it turned off, the contact form is a plain `POST /contact`. Static hosting cannot take it: CloudFront allows only GET and HEAD, so it answers 403, which the error response maps to the 404 page. The message is lost. That is accepted for the very small group of visitors it affects, and the page also has a direct email link. The preview server ignores the request method, so it does not show this.
