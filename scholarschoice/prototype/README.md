# Scholar's Choice — web portal

Static front-end build of the Scholar's Choice portal. No framework, no build step: open `index.html` in a browser and it runs.

```
index.html                  Homepage
scholars-experience.html    Article page (Scholars' Experience)
inner-page-template.html    Inner page template — copy this to start a new page
contact-us.html             Contact us, built on the inner page template
css/main.css                Whole design system + all page styles
js/main.js                  Nav, carousel, reveal, reading progress, contact form
```

All four pages share an identical `#site-header` and `#site-footer` block, marked in the HTML as `partials/header` and `partials/footer` — extract those two first when moving to a templating layer.

---

## Palette

All brand colour lives in one block at the top of `css/main.css`. Changing these five values re-skins the site; nothing else hard-codes a brand colour.

| Token | Value | Role |
|---|---|---|
| `--sc-lime` | `#C8F04A` | Primary signal — buttons, accents, active states, dark-ground headings |
| `--sc-lime-dark` | `#0E5C54` | Deep teal, the dark brand counterpart — hero and search grounds, links on paper |
| `--sc-accent` | `#A8563A` | Terracotta — eyebrows, deadlines, one banner variant |
| `--sc-paper` | `#FCFAF6` | Page background |
| `--sc-ink` | `#0F1F1C` | Body text, darkest sections (video band, footer top) |

Derived scales sit underneath: `--sc-lime-50…700`, `--sc-teal-50…800`, `--sc-accent-50…600`, plus neutrals (`--sc-ink-80/60/40`, `--sc-line`, `--sc-paper-warm`, `--sc-paper-sunk`). Semantic aliases (`--sc-bg`, `--sc-text`, `--sc-text-on-dark`) point at the raw tokens, so components reference roles rather than colours.

**Contrast.** Every text/background pairing in the build was checked against WCAG 2.1 AA. All pass at normal-text size (4.5:1); the lowest are muted meta on the warm background at 4.57:1 and `--sc-accent` eyebrows on warm at 4.59:1. `--sc-lime-700` was darkened from a natural `#6B8F14` to `#54720E` so that small lime tag text clears AA on the pale lime grounds. Lime is treated strictly as a light colour — dark text on lime, never white.

## Type

| Role | Family | Notes |
|---|---|---|
| Hero, headers, card titles | **Bebas Neue** | Uppercase-only; always set large with `line-height: 0.92–1.0`. Classes: `.sc-display`, `.sc-h1`–`.sc-h4` |
| Standfirst | **DM Sans** 400 | `.sc-standfirst`, capped at `60ch` |
| Body, UI, meta | **DM Sans** 300–800 | `.sc-title` is the sans headline for card titles that need lowercase |

Fluid scale: `--sc-step--2` through `--sc-step-7`, all `clamp()`-based, so there are no font-size media queries anywhere. Fonts load from Google Fonts with `display=swap` and a narrow-sans / system-sans fallback stack.

## Naming

BEM-ish, block-prefixed, one block per page section. Sections carry the `id`, components carry the `class`, so a section can move without its styles following it.

- **Shared:** `sc-` prefix for the design system (`.sc-container`, `.sc-section`, `.sc-btn`, `.sc-tag`, `.sc-frame`, `.sc-grid`, `.sc-rail`, `.sc-eyebrow`, `.sc-standfirst`)
- **State:** `is-` prefix only (`.is-active`, `.is-open`, `.is-stuck`, `.is-visible`, `.is-nav-open`)
- **Modifiers:** double dash (`.sc-btn--ghost`, `.pathway-row--lead`, `.scholarship-card--feature`, `.story-card--stacked`, `.scholar-portrait--duotone`)

### Section map

**Homepage**

| `id` | Component classes |
|---|---|
| `#site-header` | `.site-header__inner`, `.site-logo`, `.site-nav__list`, `.site-nav__link`, `.site-nav__toggle` |
| `#anchor-banner` | `.anchor-banner__slide` (a link wrapping `__picture`), `__nav`, `__dots`, `__dot` |
| `#scholarship-search` | `.search-panel`, `.search-form`, `.search-form__row`, `.search-form__submit` |
| `#pathways` | `.pathways__list`, `.pathway-row` (+`--lead`), `__index`, `__title`, `__tag`, `__text`, `__art` |
| `#providers` | `.provider-card`, `.scholarship-card`, `__specs`, `__foot` |
| `#stories` | `.story-lead`, `.story-card` |
| `#videos` | `.video-reel`, `__scrim`, `__play`, `__duration`, `__body` |
| `#site-footer` | `.site-footer__top`, `.newsletter`, `.site-footer__links`, `.site-footer__legal` |

**Article page**

| `id` | Component classes |
|---|---|
| `#reading-progress` | — |
| `#article-hero` | `.article-hero__name`, `.scholar-profile__meta`, `.article-hero__quote`, `.scholar-portrait` |
| `#article-byline` | `.article-byline__who`, `.article-share` |
| `#article-video` | `.article-video__player`, `__play`, `__caption` — **optional section, see below** |
| `#article-body` | `.article-part` → `#the-story`, `#the-work`, `#ama`; `.article-prose`, `.article-pullquote`, `.article-callout`, `.ama-item` |
| `#scholarship-sidebar` | `.sidebar-card`, `.sidebar-specs`, `.sidebar-story` |
| `#related-stories` | `.story-card--stacked` |

**Inner page template** (`inner-page-template.html`, and every page built from it)

| `id` | Component classes |
|---|---|
| `#page-hero` | `.sc-breadcrumb`, `.page-hero__head`, `__title`, `__standfirst` |
| `#page-body` | `.page-layout` (+`--single`), `__main`, `__aside`, `.page-aside-card`, `.page-figure` |

**Contact page** (`contact-us.html`) — the same two sections, with the main column replaced by `.contact-form`: `__grid`, `__foot`, `__note`, `__submit`, `__success`, built on the shared `.sc-field` / `.sc-input` / `.sc-select` / `.sc-textarea` controls.

## Things to know before refactoring

**Starting a new inner page.** Copy `inner-page-template.html`, then change four things: the `<title>` and meta description, the `<h1>`, the breadcrumb trail, and the `is-active` / `aria-current="page"` pair on the matching primary nav item — the template ships with none set, because no top-level nav item matches a generic inner page. The breadcrumb mirrors the URL path, one `<li>` per level, Home first, and the last item is plain text with `aria-current="page"`, never a link. The aside is optional: delete `<aside class="page-layout__aside">` and add `.page-layout--single` to `.page-layout` for a single-column page.

**The contact form sends nothing.** `<form id="contact-form">` has no `action` and no `method`. `contactForm()` in `js/main.js` validates the four required fields on blur and on submit (re-validating a field only once it has already been flagged, so the first pass through the form is never interrupted mid-typing), then hides the form and reveals `#contact-success`. The block to replace is marked in the source. Point it at a real endpoint, and add server-side validation and spam protection, before the page goes live. `novalidate` is set so the browser's own bubbles don't compete with the inline `.sc-field__error` messages — which means validation is entirely JS-dependent today.

**The optional video section.** Delete the whole `<section id="article-video">` for stories with no video. Nothing else on the page references it, and the reading-progress bar measures `#article-body` only.

**The stylised portrait.** `.scholar-portrait--duotone` applies a grayscale + lime `soft-light` blend so mixed-quality headshots read as a consistent treatment. Drop the modifier to show the photo untreated.

**Placeholder links.** Every unbuilt destination is `href="#"`. `js/main.js` → `placeholderLinks()` intercepts those clicks so nothing jumps to the top of the page during reviews. Delete that function once real routes exist. Live links today: `index.html` and `scholars-experience.html` only.

**The search panel straddles two sections.** `#scholarship-search` has no background or padding of its own — `.search-panel` is the teal box, and it pulls itself into the sections above and below with `margin-block: calc(var(--search-overlap) * -1)`. Everything that has to clear it derives from the same `--search-overlap` value: the panel sits at `z-index: calc(var(--sc-z-banner) + 1)`, the carousel dots get it added to their `bottom` offset, and `#pathways` adds it to its top padding. Change the overlap and all three need to move together.

**The pathway rows are full-bleed too.** `#pathways` keeps its section head inside `.sc-container`, then breaks out: `.pathway-row` is a three-column grid (index panel / copy / doodle) that runs edge to edge so the lead row's teal index panel can touch the viewport edge. Row tints alternate off `:nth-child`, starting on teal so the last row reads against the warm-paper `#providers` section below — add or remove a row and the tints re-flow, but check that seam. Sticker colours are also `:nth-child`-bound. The illustrations live inside `.pathway-row__body`, not beside it, so one DOM order serves both layouts: the body is a grid that puts the art in a second column on desktop and, under 900px, collapses to one column and reorders it to sit directly below the title (`order: 2`). They are decorative (`aria-hidden`, empty `alt`) and load from `images/pathway-*.svg`.

**The header is full-bleed.** `.site-header__inner` deliberately does *not* use `.sc-container` — it spans the viewport and takes only `--sc-gutter` as side padding, so the logo and actions sit at the screen edges while page content below stays on the `1280px` grid. Nav link sizes are set in px on purpose (18px desktop, 16px in the drawer) rather than on the fluid `--sc-step` scale. `--sc-header-h` is `88px` to carry the logo; the drawer top, `scroll-padding-top` and the sticky article sidebar all derive from that token, so changing it once is enough.

**Anchor banner creatives.** Each slide is image-only — the whole slide is one `<a>`, with no headline, body copy or CTA. Every banner ships two creatives via `<picture>`: **1920 x 640 (3:1)** for desktop/tablet on the `<img>`, and **1080 x 1350 (4:5)** for mobile on a `<source media="(max-width: 860px)">`. `.anchor-banner__viewport` carries the matching `aspect-ratio` at each breakpoint, so the section height follows the creative and nothing shifts on load.

**Images.** Every `<img>` carries a `data-img-slot="…"` attribute naming its slot (`banner-1-desktop`, `banner-1-mobile`, `story-lead`, `scholar-portrait`, `video-1`…). `src` values point at `picsum.photos` placeholders — grep for `data-img-slot` to find all 22 and swap them. `.sc-frame` holds the aspect ratio and shows a teal gradient block while an image loads or if one fails, so no layout shift either way.

**Video players.** The reels and the article player are posters, not players. `videoPlaceholders()` in `js/main.js` marks the hook — replace its body with your embed. Wrappers already hold 9:16 and 16:9.

**Responsive.** Breakpoints are `1024px`, `1000px` (sidebar drops under the article), `980px` (nav becomes a drawer), `960px`, `900px`, `860px`, `600px`, `520px`, `420px`. No fixed widths; the only horizontal scrolling is inside `.sc-rail` containers, by design.

**Accessibility.** Skip link, `aria-current` on the active nav item, `aria-expanded` on the nav toggle, labelled form fields, carousel with `aria-roledescription` and arrow-key support, `prefers-reduced-motion` honoured (carousel autoplay stops, reveals resolve immediately), and a `@media print` block that strips chrome.

## Placeholder content — replace before publication

Everything editorial here was written to exercise the layout and is **not verified**:

- The scholar (Nurul Aisyah Rahman), her quotes, employer, and all five #AMA answers
- Story headlines, bylines, read times, and view counts
- Scholarship values, bond lengths, coverage, deadlines and application windows
- The "1,284 scholarships / 96 providers" counts in the #providers CTAs
- Every word and image in `inner-page-template.html` — it is a layout harness, not copy
- On `contact-us.html`: the three-working-day reply promise, the email address, the phone number and the office hours in the aside

Provider names (A\*STAR, PSC, MOE, DSTA, NUS, Temasek Foundation) are real organisations used as realistic examples — confirm any commercial or editorial relationship before these appear publicly, and replace the logo placeholder tiles (`.provider-card__logo`, currently two- or three-letter monograms) with licensed marks.

## Verification performed

- HTML tag balance and unique `id`s on both pages — clean
- Every class used in the HTML resolves to a CSS rule, and no `var(--sc-…)` reference is undefined
- CSS brace balance — clean
- 22 text/background contrast pairings computed against WCAG AA — all pass

A visual render check was not possible in this environment (no browser could reach the local files), so **open both pages in a real browser and eyeball them** — particularly the carousel timing, the Bebas Neue fallback before the webfont lands, and the article hero at tablet width.
