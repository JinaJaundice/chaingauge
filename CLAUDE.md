# CLAUDE.md: entry point for ChainGauge

**Small, stable, and made of pointers.** The table of contents a new
session reads first; detail lives in `docs/`. The discipline: give the agent a
**map, with the detail left in the files it points at**.

---

## What this is

**ChainGauge**: an L2BEAT-style watchdog that rates public blockchains on
**financial-crime safety** so a compliance team knows which chain is safe before
a product team deploys. Public since July 2026, with an open submission route so
the ratings can be argued with. React 19 + Vite + Tailwind v4. Dev server on
`localhost:5177`.

## The thesis (drives every decision)

The belief that banks cannot see what happens on public chains is mostly wrong.
Transparent public ledgers are highly traceable and well covered by analytics.
ChainGauge makes the real, more specific variation between chains legible for a
compliance audience: it rates each chain on seven independent dimensions and derives
a headline posture band from them.

---

## Three rules every change honours

### 1. One content model, many views: non-negotiable

Every tracked thing is one `Chain` (`web/src/content/types.ts`) with seven sourced
ratings. Each tab is a **filtered / reshaped view** over the single store
(`web/src/content/chains.ts`). Adding a chain = one entry, **never** new plumbing.
The posture band is **never stored**. It is derived by `deriveBand`
(`web/src/lib/rating.ts`), so the headline can never drift from the rosette.
Reuse the shared primitives; don't add bespoke surfaces.

### 2. Design identity: terminal / instrument panel, dark-native

A terminal-style instrument panel: near-black canvas with
a faint schematic grid, Instrument Sans for the interface and prose with JetBrains Mono
for figures, tickers and grades, 1px hairlines, a cyan signal accent, and the **risk colours (emerald / amber / rose)**
as the only chroma. Dark-native with a light "daylight" variant, toggled in the
nav. Colour is CSS-variable driven (not `dark:` classes) so both themes share one
set of component classes and the SVG rosette + concern gauge adapt automatically.
See [`docs/DESIGN.md`](docs/DESIGN.md). Lucide icons, no emoji, monogram chips.

### 3. Content integrity

Every **hard fact** (analytics coverage, sanctions, illicit data, freeze
precedents, native controls) carries a **real source URL**. A judgement
call with no source is labelled "Our judgement, no source" in the interface. Never fabricate an enforcement action, a figure or
a source. Ratings are curated and dated, in the spirit of L2BEAT's hand-reviewed
risk cells, with no automated score behind them.

---

## Where to look: the map

| Working on… | Read |
|---|---|
| Architecture, the one-model-many-views design, file map, adding a chain or a view | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| Design system: dark and light tokens with a cyan accent, the rosette, components, changing the accent | [`docs/DESIGN.md`](docs/DESIGN.md) |
| The `Chain` schema, the rating scale, integrity rules, seeding | [`docs/CONTENT.md`](docs/CONTENT.md) |
| The framework: the seven dimensions, the level scale, band-derivation rules | [`docs/METHODOLOGY.md`](docs/METHODOLOGY.md) |
| Running it: ports, gates, the preview/screenshot gotcha, deploy | [`docs/RUNBOOK.md`](docs/RUNBOOK.md) |
| Public submissions: the form, the API, the private queue, the changelog | [`docs/CONTRIBUTIONS.md`](docs/CONTRIBUTIONS.md) |
| What a week of adversarial review found, and the standing red-team brief | [`docs/RED-TEAM.md`](docs/RED-TEAM.md) |
| Phase status + deferred items | [`ROADMAP.md`](ROADMAP.md) |
| The weekly evidence refresh: the two cloud routines and their review standard | [`docs/WEEKLY-REFRESH.md`](docs/WEEKLY-REFRESH.md) |
| The serverless intake (`api/`) and the helper scripts (`tools/`) | [`api/README.md`](api/README.md), [`tools/README.md`](tools/README.md), then [`docs/CONTRIBUTIONS.md`](docs/CONTRIBUTIONS.md) |
| Public overview | [`README.md`](README.md) |
| The private working repository, the public copy and the export | [`docs/RUNBOOK.md`](docs/RUNBOOK.md), section "Public copy" |

**`npm --prefix web run link:check`** is deliberately NOT in `gates`. Gates must
be fast and deterministic; a check that depends on fifty third-party sites is
neither, and a flaky gate gets ignored. Run it before a release. It probes with
`fetch`, then re-checks failures in a real browser, because DefiLlama, The Block
and Yahoo all refuse a scripted fetch while serving a reader perfectly. It spaces
requests per host and retries once: the first version reported three DefiLlama
pages dead by rate-limiting itself.

**View naming, because it has bitten once:** `views/Overview.tsx` is the landing
tab and `views/Ratings.tsx` is the table. They were `Home.tsx` and `Overview.tsx`,
and after the landing page became a tab both files exported `Overview`.

---

## Verification discipline (every change)

1. `web/node_modules/.bin/tsc -b --noEmit` clean.
2. `npm --prefix web run lint` (0 errors) + `npm --prefix web test` (Vitest) green.
3. `npm --prefix web run prose` clean: the plain-language check ported from the
   engine; it reads user-visible strings and fails on em-dashes, "X, not Y"
   antithesis, filler and intensifiers. Part of `npm run gates`.
4. `npm --prefix web run source:check` clean: every citation's publisher matches its URL host.
5. `npm --prefix web run check:api` clean: the types of `api/`.
6. `npm --prefix web run build` clean. `npm --prefix web run gates` runs steps 2 to 7 in order (lint, test, prose, source:check, check:api, build, design:check).
7. **`npm --prefix web run design:check`**: the enforced audit, and the answer
   to "why does the same kind of visual defect keep reaching the user". Each
   time one got through, a rule went in so that class cannot return: text that
   does not fit its box, a mark drawn outside its own viewBox, a page that did
   not render what its route names, interface text under the 11px floor. Add a
   rule instead of fixing an instance. Runs the built
   site in Playwright across both themes at desktop and mobile and fails on an
   off-system font, interface text below the 11px floor, horizontal overflow, a
   chart mark drawn outside its own plot area, or a console error. It is not
   optional: the first run of it found 161 elements at 10px on one page.
8. **Look at it.** The Browser pane cannot screenshot on this machine (it times
   out because the pane is not compositing), so write a throwaway Playwright
   script that writes PNGs and read those. Accessibility-tree snapshots and
   `get_page_text` work and are useful for copy, but they do not catch layout.


**Run checks against `dist`; never against the live site.** The red-team pass ran its link,
layout and endpoint checks against the live site and tripped Vercel's Attack
Challenge Mode, which 403'd every visitor for about a day. `design:check` already
serves `dist` locally and is the pattern to copy. Only `link:check` should touch
the network, and only third-party hosts.

## Deploy (standing rule)

"Done" includes deployed, and **verify by content, never by asset hash**. Grepping
the served HTML for a bundle hash reported success once when the push had failed
with a 503 and the old build was still live. Curl the deployed page or feed and
look for the words you changed. Commit **and** push to `main`; Vercel builds `web/` via
`vercel.json`. The local git author must be the linked GitHub account
(`JinaJaundice`), or Vercel blocks the build. See [`docs/RUNBOOK.md`](docs/RUNBOOK.md).

**Two repositories (9 November 2026).** This working repository is `JinaJaundice/chaingauge-private`, and Vercel,
the submission queue and both weekly routines use it. The public repository `JinaJaundice/chaingauge` is a copy that
`tools/public-export.mjs` writes, as `docs/RUNBOOK.md` ("Public copy") describes. After each push to `main` the
workflow `.github/workflows/public-copy.yml` of this working repository refreshes that copy. `docs/RUNBOOK.md`
("Public copy") gives its key, the steps after a failure and the manual fallback. Never push this history to the
public repository and never add it as a remote here.
