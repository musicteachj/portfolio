# Phase 4: Contact Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:**
- Make the Home contact form send through EmailJS, with v11's validation, states and copy.
- Switch both Email links to `mailto:` in the browser only.
- Close the Phase 4 items in the carry-forward notes.

**Architecture:**
- **Pure logic** lives in `app/utils/contact-form.ts`: field validation, plus the one function that calls EmailJS. That function imports `@emailjs/browser` lazily, so the SDK stays out of the initial bundle.
- **`ContactForm.vue`** owns the form state and is extracted from `ContactSection.vue`.
- **`useEmailHref()`** builds the `mailto:` link in `onMounted` from two parts in `site.ts`, so the full address is never written out in any file.

**Tech Stack:** Nuxt 4.6 static generate, `@emailjs/browser` 5, Vitest 5 + @nuxt/test-utils 4 (`mockNuxtImport`), Playwright + @axe-core/playwright, plain CSS.

**Spec:** `docs/superpowers/specs/2026-11-17-portfolio-rewrite-design.md`. Phase 4 is in "Phased development plan". Also read "Contact form", "Email address exposure" and Verification items 1, 3 and 4.

**Carry-forward:** `docs/superpowers/plans/2026-11-17-phase-1-carry-forward.md`. Its "Facts learned" sections and both "Phase 4" items are requirements for this plan.

**Visual and copy source (read-only):** `.superpowers/brainstorm/18672-1794933570/content/v11-product-showcase.html`.
- Form markup: lines 554-587.
- Form CSS: already ported to `ContactSection.vue`.
- Form behavior and copy: the script at lines 1017-1069. The `fail` subject trick is a mockup device and is not ported.

## Global Constraints

- **Node:** run every `node`/`npm`/`npx` command as `fnm exec --using=24 -- <command>`.
- **Git:** never `git commit`, `git push`, `git add`, `git stash`, `git checkout` or `git restore`, and never open a PR. The controller stages approved work. The phase ends with one proposed commit that needs James's explicit OK.
- **Secrets:** `.env` is untracked and holds James's EmailJS values. Never print its values: to inspect it, use `sed 's/=.*/=<redacted>/' .env`.
- **No real sends from tests:** every Playwright test that can submit the form must route `https://api.emailjs.com/**` first. Unit tests mock the send.
- **EmailJS template params:** exactly `{ name, email, subject, message }`. The existing template depends on these names. Never add the honeypot or anything else.
- **EmailJS options:** don't set `blockHeadless` (it returns 451 in Playwright).
- **Email address:**
  - The address never appears in any file under `.output/public`.
  - `mailto:` never appears in HTML, JSON, Markdown, XML or TXT output.
  - JS bundles contain the two parts and the `mailto:` prefix separately, and that is expected.
  - The server always renders `href="/contact"` for both Email links.
- **Copy:** use v11's strings verbatim:
  - Required errors:
    - Name: "Enter your name"
    - Email: "Enter your email address"
    - Subject: "Enter a subject"
    - Message: "Enter a message"
  - Bad email: "Enter a valid email address, like name@example.com"
  - Button: "Send message", and "Sending..." while sending.
  - Success: "Message sent. I'll reply to your email."
  - Failure: "Your message didn't send. Check your connection and try again, or email me directly."
  - Writing rules: American English, no em dashes anywhere (comments included), sentence case.
- **Design:** keep the existing v11 form CSS and tokens, with `<style scoped>` in every component and no new colors or sizes.
- **Markup stays:**
  - Ids `cform`, `f-name`, `f-email`, `f-subject`, `f-message`, `f-<key>-err`, `f-submit` and `f-status`.
  - Each field's `aria-describedby="f-<key>-err"`, and `role="status" aria-live="polite"` on `#f-status`.
  - `tests/output/home.test.ts` already pins these and must stay green.

## Decisions this plan makes (from the spec and carry-forward)

- **No-JS:** the form gets `method="post"` and no `action`, so field values never land in a URL. There is no `<noscript>` note, because Vue hydration of noscript content risks mismatch warnings, which the smoke test fails on, and the audience is tiny.
- **Email links before hydration:** they stay `/contact`, as the spec says. The carry-forward risk (a pre-hydration click on `/contact` reloads and clears a half-typed form) needs typing faster than hydration. So the plan only pins that the links are `mailto:` after hydration.
- **The EmailJS config is baked in at generate time:**
  - It comes from `NUXT_PUBLIC_EMAILJS_SERVICE_ID`, `NUXT_PUBLIC_EMAILJS_TEMPLATE_ID` and `NUXT_PUBLIC_EMAILJS_PUBLIC_KEY`. These values are public by design: they ship to every browser.
  - The e2e suite needs non-empty values at generate time: real ones locally from `.env`, and any non-empty ones in CI, since every request is intercepted.

## Review Focus

1. **Double submit:** a double click or Enter pressed twice while a send is in flight. Exactly one request goes out, and the button reads "Sending..." until it settles. (Task 3 unit, Task 4 e2e)
2. **Whitespace-only fields:** they count as empty, and the values are sent trimmed. (Task 2 unit)
3. **EmailJS rejects or the network fails:**
   - Both an HTTP 400 and a network failure show the failure message.
   - Every field keeps its text.
   - The button returns to "Send message".
   (Task 4 e2e)
4. **A build without EmailJS config:** a submit shows the failure message, makes no request and throws nothing uncaught. (Task 2 unit)
5. **A filled honeypot:**
   - No request goes out.
   - The normal success message shows and the form resets.
   - Tab and screen readers never reach the field.
   (Task 3 unit, Task 4 e2e)

---

### Task 1: Email links built in the browser

**Files:**
- Modify: `app/data/site.ts` (add `emailUser`, `emailDomain`)
- Create: `app/composables/useEmailHref.ts`
- Modify: `app/components/IntroHero.vue:16`, `app/components/ContactSection.vue:12`
- Test: `tests/output/privacy.test.ts` (new), `tests/e2e/contact.spec.ts` (new; Task 4 adds to it)

**Interfaces:**
- Produces:
  - `site.emailUser: 'jameslittlefield3'`
  - `site.emailDomain: 'gmail.com'` (the address the old site published)
  - `useEmailHref(): Readonly<Ref<string>>`: `'/contact'` during SSR and hydration, then `` `mailto:${site.emailUser}@${site.emailDomain}` `` after `onMounted`.

- [ ] **Step 1: Write the failing output test** `tests/output/privacy.test.ts`:
  - Walk every file under `.output/public` recursively.
  - `no output file contains the email address`: no file (read as a Buffer, so binary files count too) contains `site.emailUser + '@'`. Import `site` from `../../app/data/site`.
  - `no HTML, JSON, Markdown, XML or TXT file contains mailto:`: check every `.html`, `.json`, `.md`, `.xml` and `.txt` file.
  - Both tests fail with the offending relative path in the message.
- [ ] **Step 2: Write the failing e2e test** in `tests/e2e/contact.spec.ts`: `after hydration both Email links are mailto links`.
  - `goto('/contact')`, then `waitForHydration`.
  - The hero `.actions` Email link and the `.direct` Email link both have `href` equal to `` `mailto:${site.emailUser}@${site.emailDomain}` ``.
- [ ] **Step 3: Run both and confirm the e2e one fails.** First `fnm exec --using=24 -- npm run generate`, then:
  - `fnm exec --using=24 -- npm run test:output -- privacy`: expect PASS. These tests pin today's state, so they guard this task's change.
  - `fnm exec --using=24 -- npx playwright test contact -g mailto`: expect FAIL, because the href is `/contact`.
- [ ] **Step 4: Implement** the `site.ts` fields (add them to the `satisfies` type too) and `useEmailHref()`. Use it in `IntroHero.vue` and `ContactSection.vue` (`:href="emailHref"`).
- [ ] **Step 5: Run the checks.** Run `npm run generate`, `npm run test:output`, `npx playwright test contact home`. Expect all of them to PASS, including the existing `intro content and buttons` (`['Email', '/contact']`) and `no mailto and no mockup hint in the HTML`.

### Task 2: Validation and the EmailJS call

**Files:**
- Create: `app/utils/contact-form.ts`
- Modify: `nuxt.config.ts` (`runtimeConfig.public.emailjs`), `package.json` (add `@emailjs/browser@^5`), `.env` (rename keys), and create `.env.example`
- Test: `tests/nuxt/contact-form.test.ts`

**Interfaces:**
- Produces, all auto-imported from `app/utils/contact-form.ts`:
  - `type ContactFieldKey = 'name' | 'email' | 'subject' | 'message'`
  - `type ContactFields = Record<ContactFieldKey, string>`
  - `interface EmailJsConfig { serviceId: string; templateId: string; publicKey: string }`
  - `CONTACT_FIELD_KEYS: readonly ContactFieldKey[]` = `['name', 'email', 'subject', 'message']` (also the order for focusing the first invalid field)
  - `fieldError(key: ContactFieldKey, value: string): string`: the error copy, or `''` when valid. It trims first. Email uses `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` (v11).
  - `sendContactMessage(fields: ContactFields, config: EmailJsConfig): Promise<void>`:
    - Rejects with `Error('EmailJS config missing')` before loading the SDK if any config value is empty.
    - Otherwise does `const { send } = await import('@emailjs/browser')` and calls `send(config.serviceId, config.templateId, { name, email, subject, message }, { publicKey: config.publicKey })` with every value trimmed.
    - Rejects with whatever `send` rejects with.

- [ ] **Step 1: Write the failing unit tests** `tests/nuxt/contact-form.test.ts`. Mock the SDK with `vi.mock('@emailjs/browser', () => ({ send: sendMock }))` (`sendMock` from `vi.hoisted`).
  - `fieldError returns v11 copy`:
    - `('name','')` gives "Enter your name", and `('name','   ')` gives the same.
    - `('email','')` gives "Enter your email address", and `('email','a@b')` gives "Enter a valid email address, like name@example.com".
    - `('email',' a@b.co ')` gives `''`.
    - `('subject','')` gives "Enter a subject" and `('message','')` gives "Enter a message".
    - `('message','Hi')` gives `''`.
  - `sendContactMessage sends exactly the four template params, trimmed`: `sendMock` is called once with `('svc', 'tpl', { name: 'Ada', email: 'ada@example.com', subject: 'Hi', message: 'Hello' }, { publicKey: 'pk' })`, from inputs padded with spaces. The params object has exactly 4 keys (`Object.keys(...).sort()` equals `['email','message','name','subject']`).
  - `sendContactMessage rejects without loading the SDK when config is missing`: for each of the three keys set to `''`, it rejects with "EmailJS config missing" and `sendMock` is not called.
  - `sendContactMessage passes an SDK rejection through`: `sendMock.mockRejectedValueOnce({ status: 400, text: 'bad' })`, and the call rejects with that object.
- [ ] **Step 2: Run** `fnm exec --using=24 -- npx vitest run tests/nuxt/contact-form.test.ts`. Expect FAIL (module missing).
- [ ] **Step 3: Implement.**
  - Install `@emailjs/browser@^5` and write `contact-form.ts`.
  - In `nuxt.config.ts`, add `runtimeConfig.public.emailjs: { serviceId: '', templateId: '', publicKey: '' }` next to `buildYear`, with a one-line comment naming the three `NUXT_PUBLIC_EMAILJS_*` variables.
  - Rename the `.env` keys in place with `sed -i '' 's/^VITE_EMAILJS_/NUXT_PUBLIC_EMAILJS_/' .env`, then verify with the redacting `sed`.
  - Create `.env.example` with the three `NUXT_PUBLIC_EMAILJS_*=` lines, empty.
- [ ] **Step 4: Run** the unit test (PASS), `npm run lint` and `npm run typecheck` (both clean).

### Task 3: ContactForm component

**Files:**
- Create: `app/components/ContactForm.vue` (the form markup and its CSS rules move here from `ContactSection.vue`: `.cform`, `.f-row`, `.field*`, `.f-err`, `.f-foot`, `.f-status*`, plus the new `.hp`)
- Modify: `app/components/ContactSection.vue` (renders `<ContactForm />` where the form was)
- Test: `tests/nuxt/ContactForm.test.ts`, `tests/output/privacy.test.ts` (add one test)

**Interfaces:**
- Consumes: `CONTACT_FIELD_KEYS`, `fieldError`, `sendContactMessage`, `EmailJsConfig` (Task 2), and `useRuntimeConfig().public.emailjs`, read once in setup.
- Produces: `<ContactForm />` with no props.

**Behavior (v11 script, ported):**
- **Validation:**
  - Each field validates on blur only if the form was submitted before or the field isn't empty.
  - A field that's already invalid revalidates on every input.
  - An error sets `aria-invalid="true"` and fills `#f-<key>-err`. A valid field removes `aria-invalid` and empties the message.
- **Submit:**
  - The form is `<form id="cform" class="cform" method="post" novalidate @submit.prevent="onSubmit">`.
  - If a send is in flight, do nothing.
  - Otherwise clear the status, validate all four fields, and focus the first invalid one in `CONTACT_FIELD_KEYS` order.
  - If all are valid: the button text becomes "Sending..." with `aria-disabled="true"` (it stays a focusable `type="submit"`), then `await sendContactMessage({ ...fields }, config)`.
  - Pass a plain copy, not the reactive state: the success path clears the state, and a shared reference would also clear what the send (or a test mock) received.
  - **Success:** clear all fields and errors, reset "submitted before", and show the status with class `ok` and the success copy.
  - **Rejection:** keep every field, show class `bad` with the failure copy, and `console.warn` the error.
  - Either way, restore "Send message" and remove `aria-disabled`.
- **Honeypot:**
  - It sits after the message field: `<div class="hp" aria-hidden="true">`, holding `<label for="f-hp">Leave this field empty</label>` and `<input id="f-hp" name="hp" type="text" tabindex="-1" autocomplete="off">`. The name is a neutral token on purpose: a name like `website` can match a password manager's identity profile, and a filled honeypot would silently drop a real message.
  - `.hp` is visually hidden off-screen (`position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden`). Not `display: none`.
  - If it holds any text after validation passes: skip the send, then reset and show success exactly as a real success does.

- [ ] **Step 1: Write the failing unit tests** `tests/nuxt/ContactForm.test.ts`. Use `mockNuxtImport('sendContactMessage', () => sendMock)` with `sendMock` from `vi.hoisted`, and mount with `mountSuspended(ContactForm)`.
  - `blur on an untouched empty field shows no error`.
  - `submitting empty shows all four errors and focuses Name`: the four required messages, `aria-invalid="true"` on all four, `document.activeElement.id === 'f-name'` (mount with `attachTo: document.body`), and `sendMock` not called.
  - `fixing a field clears its error as you type`.
  - `a valid submit sends the fields and shows success, then clears the form`:
    - `sendMock` is called with `({ name, email, subject, message }, expect.anything())`, with no `hp` key.
    - `#f-status` has class `ok` and the success copy.
    - All four inputs are `''`.
  - `a rejected send keeps the fields and shows the failure copy`: `#f-status.bad` and the inputs unchanged.
  - `a second submit while sending does nothing`: `sendMock` returns a pending promise. Submit twice. Expect one call, the button text "Sending..." and `aria-disabled="true"`. After resolving, the text is "Send message" and `aria-disabled` is gone.
  - `a filled honeypot skips the send but shows success`: `sendMock` not called, `.ok` status, and the fields cleared.
- [ ] **Step 2: Run** `fnm exec --using=24 -- npx vitest run tests/nuxt/ContactForm.test.ts`. Expect FAIL (component missing).
- [ ] **Step 3: Implement** `ContactForm.vue` and slim `ContactSection.vue`.
- [ ] **Step 4: Add the output test** `the EmailJS SDK is lazy-loaded` to `privacy.test.ts`. Some `_nuxt/*.js` file contains `api.emailjs.com` (the SDK chunk exists), and no `link[rel="modulepreload"]` in `index.html` points at a file that contains it.
- [ ] **Step 5: Run** `npm test`, `npm run lint`, `npm run typecheck`, `npm run generate` and `npm run test:output`. Expect all PASS, including `contact form fields are labeled and described` and the lazy-load test.

### Task 4: End-to-end contact checks and phase gate

**Files:**
- Modify: `tests/e2e/contact.spec.ts`, `docs/superpowers/plans/2026-11-17-phase-1-carry-forward.md`

**Interfaces:**
- Consumes: Tasks 1-3, `waitForHydration`, `expectNoSeriousAxe`.

- [ ] **Step 1: Write the e2e tests** in `contact.spec.ts`.
  - **Setup:** a `beforeEach` routes `https://api.emailjs.com/**` to `route.abort()`. Tests that need a response register their own route afterwards; Playwright prefers the later route. Then `goto('/contact')` and `waitForHydration`. Read requests with `route.request().postDataJSON()`. EmailJS posts JSON with `service_id`, `template_id`, `user_id` and `template_params`.
  - `the build carries the EmailJS config`: `window.useNuxtApp().$config.public.emailjs` has three non-empty strings. Assert lengths, never print values. On failure, the message says "set NUXT_PUBLIC_EMAILJS_* in .env, then generate".
  - `empty submit shows every error and focuses Name`, with no request.
  - `a successful send posts exactly the four params and announces success`:
    - Fulfill `200` with body `OK`.
    - `template_params` equals the trimmed values. Also check `service_id` and `template_id` against `$config`.
    - `#f-status` reads the success copy and the fields are empty.
    - `expectNoSeriousAxe(page)` passes in this state.
  - `an HTTP error keeps the fields and explains`: fulfill `400` with body `The Public Key is invalid`. Expect the failure copy, fields kept and the button back to "Send message".
  - `a network failure keeps the fields and explains`: abort. Same expectations.
  - `while sending, a second click or Enter sends nothing`:
    - Hold the route open on a promise.
    - Click Send, click again, press Enter in Subject.
    - Exactly one request is seen. The button reads "Sending..." with `aria-disabled="true"`.
    - Release the route. The button reads "Send message".
  - `the honeypot is out of the Tab order and the accessibility tree`:
    - From `#f-message`, Tab focuses `#f-submit`.
    - `page.getByRole('textbox')` count is 4.
    - Fill `#f-hp` with `{ force: true }` plus valid fields and submit. No request goes out, and the success copy shows.
  - `error state passes axe`: after an empty submit, `expectNoSeriousAxe(page)`.
- [ ] **Step 2: Run** `fnm exec --using=24 -- npx playwright test contact`. Expect PASS.
- [ ] **Step 3: Gate, twice.** Run lint, typecheck, `npm test`, `npm run generate` (0 link-checker errors), `npm run test:output` and `npx playwright test`. All PASS on both runs. Then run `npx playwright test contact section-nav --repeat-each=10`, with zero failures.
- [ ] **Step 4: Update the carry-forward notes.**
  - Mark both Phase 4 items done.
  - Under Phase 5, change the email-scan item: the email address is scanned in every file and `mailto:` in non-JS text output (`tests/output/privacy.test.ts` already does both), so `check-seo` can reuse that.
  - Under Phase 6, add: the CI `build-and-test` job needs non-empty `NUXT_PUBLIC_EMAILJS_*` at generate time (dummy values are fine, since every request is intercepted), and the deploy job maps the real secrets.
  - Under Phase 6 docs, add: James turns on the EmailJS domain allowlist (and adds `localhost` only if he wants local sends) and rate limit in the EmailJS dashboard.

### Review stop (controller with James)

- James runs `fnm exec --using=24 -- npm run generate && fnm exec --using=24 -- npm run preview`, opens http://localhost:4173/contact, and sends one real message from the form.
- **Done when** that message reaches his inbox and he confirms. If EmailJS's domain allowlist blocks localhost, he adds it for the test or the check waits for launch.
