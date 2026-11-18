# Design system

The visual rules for this portfolio. Every value here comes from `app/assets/css/tokens.css`, `base.css` and `ui.css`. If this file and the CSS disagree, the CSS wins, and this file needs fixing.

## Direction

A product showcase: each project gets a large screenshot in a browser frame, set on a soft blue panel, next to a short write-up. The page is quiet and light, with one dark blue accent. The palette is Sanzo Wada palette A: a warm off-white paper, near-black ink, deep navy and a pale blue-gray.

Nothing is decorative unless it carries information. The accent is used for links, the primary button and the small markers that start a section.

## Colors

Use the CSS variables. Do not write hex values in components.

### Surfaces and lines

| Token | Value | Role |
|---|---|---|
| `--paper` | `#f7f7f4` | Page background, contact form panel |
| `--surface` | `#ffffff` | Cards, form fields, buttons |
| `--sunken` | `#efefeb` | Quiet fills, such as the address label in a browser frame |
| `--line` | `#e2e2dc` | Hairline dividers and card borders |
| `--line-strong` | `#c9c9c1` | Heavier decorative borders (architecture steps) |
| `--field-border` | `#8a8f88` | Borders of inputs and buttons |

### Text

| Token | Value | Role |
|---|---|---|
| `--ink` | `#141614` | Headings and body text |
| `--ink-2` | `#464b47` | Supporting paragraphs |
| `--ink-3` | `#5f655f` | Captions, labels, table headers |

### Accent (palette A)

| Token | Value | Role |
|---|---|---|
| `--accent` | `#12354e` | Links, primary button, focus ring |
| `--accent-hover` | `#0b2436` | Hover state of the accent |
| `--on-accent` | `#ffffff` | Text on the accent |
| `--soft` | `#a5c8d1` | Media stage panel, form top edge, wordmark squares |
| `--tint` | `#e6eff2` | Hover fill on proof links, main node in the request flow |
| `--mark` | `#12354e` | Small section markers and rules above stats and lists |

### Status

| Token | Value | Role |
|---|---|---|
| `--pass` | `#3d6650` | Success text, the status dot |
| `--pass-soft` | `#e7eee9` | Success background |
| `--miss` | `#9a5800` | A missed result in a results table |
| `--miss-soft` | `#f8eedc` | Background for a miss |
| `--error` | `#a32b22` | Error text and invalid field borders |
| `--error-soft` | `#fbecea` | Error background |

Status is never shown by color alone. Errors also get a 3px bar on the left edge and a message, and misses get a bar on the row.

The dark browser frame variant uses a few fixed near-black values that live in `BrowserFrame.vue`. They are not tokens, and no text pair in the table below depends on them.

## Contrast

Ratios use the WCAG relative luminance formula, computed by a throwaway script from the values in `tokens.css`. The bar is 4.5:1 for text and 3:1 for the borders of controls.

| Foreground | Background | Ratio | Used for |
|---|---|---|---|
| `--ink` | `--paper` | 16.95 | Body text |
| `--ink` | `--surface` | 18.19 | Text in fields |
| `--ink` | `--sunken` | 15.78 | Text on quiet fills |
| `--ink` | `--soft` | 10.20 | Text on the media stage |
| `--ink-2` | `--paper` | 8.30 | Supporting text |
| `--ink-2` | `--surface` | 8.91 | Supporting text on cards |
| `--ink-2` | `--sunken` | 7.73 | Supporting text on quiet fills |
| `--ink-3` | `--paper` | 5.57 | Captions |
| `--ink-3` | `--surface` | 5.98 | Captions on cards |
| `--ink-3` | `--sunken` | 5.18 | Address label in a browser frame |
| `--accent` | `--paper` | 11.89 | Links |
| `--accent` | `--surface` | 12.77 | Links on cards |
| `--accent` | `--tint` | 10.94 | Hovered proof links |
| `--accent-hover` | `--paper` | 14.82 | Hovered links |
| `--accent-hover` | `--tint` | 13.63 | Hovered links on tint |
| `--on-accent` | `--accent` | 12.77 | Primary button |
| `--on-accent` | `--accent-hover` | 15.91 | Primary button, hovered |
| `--pass` | `--pass-soft` | 5.54 | Success message |
| `--pass` | `--paper` | 6.09 | Success text on the page |
| `--miss` | `--paper` | 5.19 | Missed result |
| `--miss` | `--surface` | 5.57 | Missed result on a card |
| `--miss` | `--miss-soft` | 4.84 | Miss on its soft background |
| `--error` | `--paper` | 6.69 | Inline field error |
| `--error` | `--surface` | 7.18 | Error text on a card |
| `--error` | `--error-soft` | 6.25 | Error message |

Every text pair passes 4.5:1. The lowest is `--miss` on `--miss-soft` at 4.84.

Borders of controls:

| Border | Against | Ratio | Result |
|---|---|---|---|
| `--field-border` | `--surface` | 3.30 | Passes 3:1. This is the field's own background, which is what sits next to the border inside the box. |
| `--field-border` | `--paper` | 3.07 | Passes 3:1. This is the outside edge of the field, on the form panel. |

Not held to 3:1, because they are decoration and not the only cue for a control: `--line` on `--paper` is 1.21, and `--line-strong` on `--paper` is 1.55. `--soft` on `--paper` is 1.66, which is why the media stage is always read together with the frame and screenshot on it.

## Typography

Onest for headings and body text. Fragment Mono for small labels, code and addresses. Headings are weight 600 with tight tracking (-0.02em) and balanced wrapping. Body line height is 1.6.

| Token | Value | Use |
|---|---|---|
| `--t-display` | `clamp(2.375rem, 1.6rem + 3.2vw, 3.75rem)` | The name on the home page |
| `--t-h2` | `clamp(1.75rem, 1.4rem + 1.4vw, 2.375rem)` | Section headings |
| `--t-lede` | `clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)` | Intro paragraphs |
| `--t-small` | `0.875rem` | Labels and secondary text |
| `--t-mono` | `0.8125rem` | Mono text |
| `--t-stat` | `clamp(1.5rem, 1.3rem + 0.8vw, 2rem)` | Stat numbers |

Body copy has a line length cap (about 60 to 68 characters) so long paragraphs stay readable.

## Spacing, shape and layout

| Token | Value |
|---|---|
| `--s-1` to `--s-9` | 4, 8, 12, 16, 24, 32, 48, 72, 112 px |
| `--r-ctl` | 6px, buttons and fields |
| `--r-frame` | 10px, browser frames |
| `--r-stage` | 14px, the soft media panel and the form |
| `--shadow-frame` | A thin top highlight and a long soft drop shadow under frames |
| `--wrap` | 1180px, the content max width |
| `--gutter` | `clamp(16px, 4vw, 32px)`, side padding |
| `--tap` | 44px, minimum height of buttons and fields |

## Components

Page chrome and Home:

- `SiteHeader`: wordmark and primary navigation.
- `SiteFooter`: a single line with my name and the build year.
- `IntroHero`: the name, a one-line pitch, the actions and the portrait.
- `SectionLink`: a link to Home, Projects or Contact that scrolls to that section when you are already on the page.
- `ProjectBlock`: one project on Home, with its write-up beside a screenshot. Sides alternate, and the media sticks while you read from 900px up.
- `BrowserFrame`: a screenshot inside a light or dark browser bar with an address label.
- `MediaStage`: the soft blue panel behind a frame.
- `ProofLinks`: the links that prove a project (live site, source, case study).
- `StackList`: the tools a project used, as a labeled list.
- `StatRow`: three numbers with captions.
- `CapabilitiesStrip`: a band listing my capabilities.
- `ContactSection`: the contact area, with direct links beside the form.
- `ContactForm`: the contact form, with inline errors and a status message.

Case study pages (`app/components/case/`):

- `CaseHeader`: the project header and its page navigation.
- `ProjectTabs`: switches between a project's pages.
- `CaseIntro`: the opening block with the lede and a media frame.
- `CaseSection`: a titled section with readable paragraphs.
- `SectionToc`: a table of contents, sticky beside the text from 1100px.
- `ArchitectureSteps`: a numbered row of steps, a column on phones.
- `RequestFlow`: a diagram of how a request moves through the system.
- `DecisionList`: the choices I made and why.
- `FeatureList`: what the project does, as a short list.
- `ResultsTable`: measured results, in a keyboard-focusable region that scrolls sideways when it is too wide.
- `MediaSection`: a section built around a screenshot or video.
- `ScreenshotGallery`: screenshots at the sizes each screen needs.
- `VideoPlayer`: a video with controls and a poster image, loaded only when played.
- `InlineText`: renders text with backtick segments as inline code.
- `PrevNext`: links to the neighboring projects.

Shared styles in `ui.css`: `.btn` and `.btn--primary` (buttons), `.actions` (a row of buttons) and `.status` (a green dot with a label).

## Responsive rules

- No horizontal scroll from 360px to 1440px.
- Touch targets are at least 44px.
- Nav wraps under the wordmark on narrow phones.
- Proof links sit two by two, or four across where the container is wide enough.
- On tablets, stacks run in two columns and stats stay at three.
- A project's screenshot sits beside its text from 900px, and stays in view as you scroll.
- Under 700px the hero changes: the portrait goes small and above the name.
- The contact form puts name and email side by side from 560px, and stacks them below that.

## Motion

There are two animations, both small.

1. **Intro settle.** On load, the intro blocks and the portrait fade in and rise 8px over 650ms, staggered by 50ms steps. The name (`h1#hero-name`) is the exception. It starts at full opacity and only rises, so the largest paint is never invisible and the page's LCP is not delayed.
2. **Send spinner.** While the contact form sends, the Send button shows a small spinning ring. The sending state lasts at least 600ms, so a fast reply does not flash.

Both are off under `prefers-reduced-motion: reduce`, and `base.css` also removes all transitions then.

Smooth scrolling is not an animation, but it follows the same preference. In-page links (section links, the table of contents, the skip link) glide once the app has hydrated, which adds `html.smooth-scroll`. Before that, and without JavaScript, they jump. With reduced motion they always jump.

## Writing rules

- American English.
- No em dashes. Use a comma, a colon, parentheses or two sentences.
- No arrows and no middle-dot separators in copy.
- Sentence case for headings, buttons and labels.
- Plain and specific. Say what was built and what happened. Skip hype and filler words.
