# Design system

## The measurement that changed it (28 Jul 2026)

The identity was "terminal / instrument panel": everything in JetBrains Mono at
13px with a lot of 11px, no iconography. The note it got was that it looked
uninspiring. Instead of argue about taste, the reference products were measured
in a headless browser.

| | L2BEAT | rwa.xyz | Token Terminal | ChainGauge (before) |
|---|---|---|---|---|
| Dominant body size | 14px (×151) | 14px (×699) | 14px (×187) | 13px, plus a lot of 11px |
| Dominant weight | 500 | 400 | 400 | 600–700 |
| Interface family | Roboto | Lausanne | Geist | JetBrains Mono |
| Icons per table row | 5.5 | 1.1 |: | 0 |
| Corner radius | 4px | 4px | 4 / 8px | 6px |

Every one of them runs a proportional sans for the interface and reserves mono
for figures. Setting the whole interface in monospace is what made this read as
a terminal toy instead of a reference source.

**What changed.** Instrument Sans takes the interface and the prose; JetBrains
Mono is demoted to figures, tickers, grades and dates. Body is 14px. Both
families are self-hosted in `public/fonts/`, which also removed the Google Fonts
CDN and with it a request that sent every visitor's IP to Google before a word
rendered. Chain marks appear in the ratings table, generated at build time by
`tools/gen-icons.mjs` into `src/content/chainIcons.ts`; they are monochrome and
take `currentColor`, because pulling in 41 brand palettes would wreck a scheme
whose only rule is that colour means risk.

`.sans` is now a no-op kept so the existing usages still compile. Do not add new
ones; add `.mono` where something is a number.


**Terminal / instrument panel**, dark-native with a light "daylight" variant.
ChainGauge is an
instrument panel where the risk colours are the only chroma.

## Identity

- **Base (dark):** near-black canvas (`--bg #08090c`) with a faint schematic grid
  (the instrument-panel texture), off-white ink, 1px hairlines. Light variant is
  a paper `--bg #f5f6f8` with dark ink. Set via a `data-theme` attribute.
- **Type:** Instrument Sans for the interface and prose (summaries, rationales, About,
  Methodology); JetBrains Mono for figures, tickers, grades and dates (the `.mono` class).
- **Chrome accent:** a restrained **cyan signal** (`--accent`, cyan-400 dark /
  cyan-700 light) for the logo, active nav, links and the LIVE dot. Swappable in
  one place (`index.css`).
- **Risk semantics carry the colour:** emerald = Clear, amber = Caution,
  rose = Elevated, the traffic-light convention every risk professional reads
  instantly (and L2BEAT uses). A deliberate, scoped departure from the calm-system
  "pass = blue" rule.
- **Shell:** a slim sticky **top nav** with the theme toggle and a LIVE
  timestamp. Lucide icons, no emoji. **Monogram chips** (the ticker in a bordered
  mono box) instead of external logos.

## Theming: CSS variables, not `dark:` variants

Colour lives in CSS custom properties in `index.css` (`--bg`, `--panel`,
`--line`, `--ink`, `--muted`, `--faint`, `--accent`, and the risk vars `--clear`
/ `--caution` / `--elevated`), redefined under `:root[data-theme="light"]`. Both
themes therefore share one set of component classes. Because the risk colours are
variables, the **SVG rosette and gauge fill with `var(--clear)` etc. and adapt to
the theme automatically**. `lib/uiTokens.ts` exposes `RISK_VAR`, `chipStyle`,
`dotStyle`, `bandChipStyle` as inline-style helpers driving off those vars.
Theme state lives in `lib/theme.ts` (`useTheme`), seeded before first paint by
the inline script in `index.html` (localStorage `cg-theme`, else OS preference).

## The rosette and the gauge

`components/RiskRosette.tsx`. Seven donut wedges, clockwise from the top in
`DIMENSIONS` order, each filled by that dimension's level colour via
`RISK_VAR[level]` (a CSS variable, so it tracks the theme). Small (≈34px) in table
rows, large (150px) with a labelled legend on the detail. Geometry comes from
`rosetteWedges()` in `lib/rating.ts` (unit-tested). The same file's
`ConcernGauge` draws a semicircular 0–100 dial with a needle (the literal
"gauge"), shown on the detail page next to the rosette.

## Charts (components/charts.tsx and components/ChainGrid.tsx)

The per-chain charts in `components/charts.tsx` (`ProfileSensitivity` and `ContributionBars`) are
SVG drawn by our own React code on a fixed `viewBox`, with no chart framework, because a
framework would fight the CSS-variable theming. The all-chain view, `components/ChainGrid.tsx`,
is HTML, because every defect in the earlier scatter charts was an SVG layout defect. Those
charts used d3-force and d3-scale, which are no longer dependencies (see `ROADMAP.md`, v0.8).
Rules that keep them right:

- **Containment by clamp.** Every mark is clamped inside the plot area. Nothing may render
  outside the axes. That was a real shipped bug, and `design:check` now fails a chart mark drawn
  outside its own plot area.
- **Encoding is consistent everywhere:** colour = grade level (status palette) and is always
  paired with a label, never carried alone.
- Charts scale via `viewBox` + `w-full` (no fixed min-width), so mobile shrinks
  instead of overflowing.

## Colour rule

Colour is theme-driven CSS variables, referenced through inline-style helpers in
`lib/uiTokens.ts` (`RISK_VAR`, `chipStyle`, `dotStyle`, `bandChipStyle`) or the
`.text-ink` / `.text-muted` / `.text-faint` / `.panel` / `.hairline` utility
classes in `index.css`. Structural Tailwind classes (`dark:` etc.) are avoided
for colour; only layout, spacing and type use Tailwind directly. This keeps both
themes on one code path.

## Responsive

Mobile-first checks: no horizontal **body** overflow at 375px (the top nav shows
the icon only below `sm`; the risk matrix scrolls inside its own
`overflow-x-auto` container; the stats readout is a `gap-px` grid). The Overview
surfaces the posture band on mobile where the dedicated column is hidden.
