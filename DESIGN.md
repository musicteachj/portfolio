# Design System — James Littlefield Portfolio

Source of truth for the portfolio's visual language. Direction: **"Professional Navy"** — light-first, developer-authentic, confident minimalism with a single saturated accent. Targets employers and engineering peers.

## Brand Identity

A senior fullstack engineer (Vue, React, TypeScript, Node, AWS, IBM background) who has taste and precision. The site should read as *engineered* — disciplined, high-contrast, nothing decorative that doesn't earn its place — while staying warm and human. Restraint signals seniority.

## Color Palette

Tokens live in `src/main.ts` as Vuetify `ThemeDefinition`s. Never hardcode hex in components — use `rgb(var(--v-theme-<token>))` or Vuetify color props.

| Token | Light | Dark | Usage |
|---|---|---|---|
| `primary` | `#0F172A` | `#F8FAFC` | Headings, primary text, footer bg (light) |
| `secondary` | `#334155` | `#94A3B8` | Secondary text, supporting UI |
| `accent` | `#2563EB` | `#3B82F6` | **Primary CTA + active states ONLY** |
| `background` | `#F8FAFC` | `#0F172A` | Page background |
| `surface` | `#FFFFFF` | `#1E293B` | Cards, raised surfaces |
| `surface-variant` | `#F1F5F9` | `#273549` | Alternating section tints |
| `success` | `#059669` | `#10B981` | Completed status |
| `error` | `#DC2626` | `#EF4444` | Errors, destructive |
| border (variable) | `#E2E8F0` | `#334155` | Card/divider borders |
| muted text (variable) | `#64748B` | `#94A3B8` | Captions, meta |

**Rule:** Accent blue is precious. One primary CTA per page/section. Everything else is monochrome slate.

## Typography

```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
```

- **Display / headings / code / tech chips:** JetBrains Mono (`--font-display`, `--font-mono`)
- **Body / UI / labels:** IBM Plex Sans (`--font-body`)

| Role | Font | Weight | Size |
|---|---|---|---|
| Hero name | JetBrains Mono | 700 | `clamp(3rem, 7vw, 5.5rem)` |
| Section heading | JetBrains Mono | 600 | `clamp(1.75rem, 3vw, 2.5rem)` |
| Subheading | IBM Plex Sans | 600 | `1.25rem` |
| Body | IBM Plex Sans | 400 | `1rem` / 1.65 |
| Tech chip | JetBrains Mono | 400 | `0.7rem` |
| Eyebrow/label | IBM Plex Sans / Mono | 500 | `0.8rem` uppercase, `0.15em` tracking |

Headings get `letter-spacing: -0.02em`. Use the `.eyebrow` utility for section labels.

## Spacing & Layout

- Section padding: `80px` desktop / `48px` mobile (`--section-py`)
- Card padding: `24px`
- Spacing rhythm: 4px base (8 / 16 / 24 / 32 / 48 / 80)
- Max content width: ~1200px
- Breakpoints: 375 / 768 / 960 (Vuetify md) / 1280

## Component Defaults

Set globally in `createVuetify({ defaults })`:

```
VCard:      rounded lg, elevation 0  (use borders, not Material shadow)
VBtn:       rounded lg
VChip:      rounded sm, variant tonal
VTextField: outlined, rounded lg
VTextarea:  outlined, rounded lg
VAppBar:    elevation 0
VTimelineItem: dotColor primary
```

Cards use `1px solid` border + bespoke `--shadow-*` tokens, never Vuetify `elevation`.

## Motion Principles

- Entrance: `fadeInUp`, 0.6–0.7s, `--ease-out` (`cubic-bezier(0.16,1,0.3,1)`)
- Scroll reveal: `.reveal` → `.is-visible` via IntersectionObserver, stagger 80–100ms
- Hover: `translateY(-6px)` or scale 1.03–1.08, 0.18–0.3s
- High-impact moments over scattered micro-interactions: one orchestrated hero load
- Always honor `prefers-reduced-motion` (handled globally in `main.css`)

## Signature Details

- Nav: transparent over hero → frosted glass (`backdrop-filter: blur(16px)`) on scroll
- Brand mark: `<JL/>` in JetBrains Mono 700, accent-blue brackets
- Section headers: `.eyebrow` label + heading + animated `.accent-rule`
- Decorative `.section-number` (01, 02…) at 4% opacity behind section headers
- Hero: gradient mesh + SVG noise texture, floating tech badges
- Tech chips read as code artifacts (JetBrains Mono, tonal)

## Anti-Patterns (Forbidden)

- ❌ Purple gradients (especially `#667eea → #764ba2`)
- ❌ Generic Material blue `#1976D2`
- ❌ Inter, Roboto, Arial, system-default font stacks for display
- ❌ Hardcoded hex inside components (use tokens)
- ❌ Vuetify `elevation` on cards (use borders + bespoke shadows)
- ❌ Accent blue used decoratively / everywhere (CTA + active only)
- ❌ Emoji as icons (use MDI)
- ❌ Looking like an unmodified Vuetify demo
