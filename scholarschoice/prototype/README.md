# Scholar's Choice — web portal

Static front-end build of the Scholar's Choice portal. No framework, no build step: open `index.html` in a browser and it runs.

```
index.html                  Homepage
scholars-experience.html    Article page (Scholars' Experience)
inner-page-template.html    Inner page template — copy this to start a new page
contact-us.html             Contact us, built on the inner page template
provider-template.html      Provider page template — copy per scholarship provider
scholarship-template.html   Scholarship detail template — copy per scholarship
scholarships.html           Scholarship listing — search, filters, lazy-loaded card grid
search-results.html         Site-wide search results — opened from the header search overlay
css/main.css                Whole design system + all page styles
js/main.js                  Nav, carousel, reveal, reading progress, contact form, listing, search
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

**Provider page** (`provider-template.html`) — the inner page chrome plus four sections. Cards are the homepage's own `.scholarship-card` and `.story-card`, unchanged; provider-only styles are `css/main.css` section 21.

**Scholarship page** (`scholarship-template.html`) — the inner page hero (name + short description), a `#scholarship-bar` with the provider logo/name and the article's `.article-share` buttons, then `#page-body` with three tabs (Requirements / Value / Courses) built on the article's `.article-tabs` / `.article-part` and driven by the same `articleTabs()`, beside an "At a glance" `.sidebar-card`. Scholarship-only styles are `css/main.css` section 22. Picking a tab (here or on the article page) writes its panel's anchor to the URL — `#requirements`, `#value`, `#courses` — with `history.replaceState`, and opening a URL with one of those anchors opens that tab. 

**Scholarship listing** (`scholarships.html`) — the inner page hero with the homepage's `.search-form` in place of the title (the `<h1>` is visually hidden), then a full-width `#listing-body`: the homepage's `.scholarship-card` in a grid on the left, a filter sidebar on the right. Listing-only styles are `css/main.css` section 23; behaviour is `scholarshipListing()` in `js/main.js`.

| `id` | Component classes |
|---|---|
| `#page-hero` (+`.listing-hero`) | `.search-form`, `.search-form__row--query` |
| `#listing-body` | `.listing-layout`, `.listing-results`, `.listing-grid`, `.listing-empty`, `.listing-status`, `.listing-sentinel` |
| `#listing-filters` | `.listing-filters__panel`, `__head`, `__handle`, `__foot`, `.listing-selected`, `.listing-chip`, `.filter-group`, `.multi-select`, `.sc-check`, `.step-slider` |

**Share widget** — one markup on every page: `.article-share` with Instagram, WhatsApp, Telegram, LinkedIn, Email and Copy link, in that order. `shareLinks()` in `js/main.js` fills the WhatsApp / Telegram / LinkedIn / Email hrefs; Instagram (which has no web share URL) and Copy link copy the page URL and show a "Copied" tooltip. On touch devices with a native share sheet, Instagram opens that instead.

| `id` | Component classes |
|---|---|
| `#page-hero` (+`.provider-hero`) | `.provider-hero__grid`, `__logo` |
| `#page-body` | `.page-layout`, `.page-aside-card`, `.provider-facts`, `__actions`, `.provider-share` (wraps the article's `.article-share`) |
| `#provider-video` | `.article-video__player` — **optional section, delete when there is no video** |
| `#provider-scholarships` | `.sc-grid--3`, `.provider-scholarships__grid`, `.scholarship-card` |
| `#provider-stories` | `.story-list`, `.provider-stories__list`, `.story-card` |
| `#provider-cta` | `.provider-cta`, `__text`, `__actions` |

## Things to know before refactoring

**Starting a new inner page.** Copy `inner-page-template.html`, then change four things: the `<title>` and meta description, the `<h1>`, the breadcrumb trail, and the `is-active` / `aria-current="page"` pair on the matching primary nav item — the template ships with none set, because no top-level nav item matches a generic inner page. The breadcrumb mirrors the URL path, one `<li>` per level, Home first, and the last item is plain text with `aria-current="page"`, never a link. The aside is optional: delete `<aside class="page-layout__aside">` and add `.page-layout--single` to `.page-layout` for a single-column page.

**The contact form sends nothing.** `<form id="contact-form">` has no `action` and no `method`. `contactForm()` in `js/main.js` validates the four required fields on blur and on submit (re-validating a field only once it has already been flagged, so the first pass through the form is never interrupted mid-typing), then hides the form and reveals `#contact-success`. The block to replace is marked in the source. Point it at a real endpoint, and add server-side validation and spam protection, before the page goes live. `novalidate` is set so the browser's own bubbles don't compete with the inline `.sc-field__error` messages — which means validation is entirely JS-dependent today.

**The scholarship listing.** Cards are rendered from the JSON in `<script id="scholarship-data">` at the foot of `#listing-body`, 12 at a time; when `#listing-sentinel` scrolls into view the next 12 load. `fetchPage()` in `scholarshipListing()` is the one function that reads that JSON — replace its body with an API call that returns `{ items, total }` and the rest keeps working. Filters are AND across groups and OR within one; Sponsorship is a minimum (Any / 25 / 50 / 100%), Bond a maximum (0–6 years, 6 = any). Every change is written to the query string (`?provider=psc,dsta&bond=4`), and the page reads it back on load, accepting option labels as well as values — so pointing the homepage `#search-form` at `scholarships.html` would carry its `q` and `level` straight across. Filter checkbox values must match the keys in the JSON (listed in the comment above it). Grid: 4 per row above 1440px, 3 from 1025px to 1440px, 2 from 768px, 1 below; cards under 280px wide stack their specs to one column via a container query. Under 900px the sidebar becomes a right-hand drawer with a vertical "Filter" handle showing the active filter count.

**The optional video section.** Delete the whole `<section id="article-video">` for stories with no video. Nothing else on the page references it, and the reading-progress bar measures `#article-body` only.

**The stylised portrait.** `.scholar-portrait--duotone` applies a grayscale + lime `soft-light` blend so mixed-quality headshots read as a consistent treatment. Drop the modifier to show the photo untreated.

**Placeholder links.** Every unbuilt destination is `href="#"`. `js/main.js` → `placeholderLinks()` intercepts those clicks so nothing jumps to the top of the page during reviews. Delete that function once real routes exist. Live links today: `index.html`, `scholars-experience.html` and `scholarships.html` (nav, footer, the scholarship breadcrumb and the homepage "View all scholarships" CTA).

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
- Every scholarship on `scholarships.html` (in `#scholarship-data`) — names, values, bonds, deadlines and eligibility are dummy data, and twelve providers (A\*STAR, MOE, NUS, NTU, GovTech, MAS, LTA, IMDA, SPF, SCDF, ICA, Temasek Foundation) show lettered tiles until logo files exist
- On `contact-us.html`: the three-working-day reply promise, the email address, the phone number and the office hours in the aside

Provider names (A\*STAR, PSC, MOE, DSTA, NUS, Temasek Foundation) are real organisations used as realistic examples — confirm any commercial or editorial relationship before these appear publicly, and replace the logo placeholder tiles (`.provider-card__logo`, currently two- or three-letter monograms) with licensed marks.

## Verification performed

- HTML tag balance and unique `id`s on both pages — clean
- Every class used in the HTML resolves to a CSS rule, and no `var(--sc-…)` reference is undefined
- CSS brace balance — clean
- 22 text/background contrast pairings computed against WCAG AA — all pass

A visual render check was not possible in this environment (no browser could reach the local files), so **open both pages in a real browser and eyeball them** — particularly the carousel timing, the Bebas Neue fallback before the webfont lands, and the article hero at tablet width.
