# scripts

## Overview

This directory holds the build and quality scripts of the ChainGauge site. One script generates the public ratings feed before each build, and four scripts check the copy, the citations, the links and the rendered design. They are run through the `npm` scripts in `web/package.json`.

## Interface

- `gen-ratings.ts` writes `web/public/ratings.json`. It runs as `npm run gen:ratings` and automatically before every build through the `prebuild` script.
- `prose-check.mjs` reads the copy strings in `web/src` and reports habits such as em-dashes, "X, not Y" antithesis, consulting filler and slogan sentences. It runs as `npm run prose` and exits non-zero on any finding because the npm script passes `--fail`.
- `source-check.mjs` checks that each citation in `../src/content/chains.ts` names its publisher honestly. It runs as `npm run source:check`.
- `link-check.mjs` requests every cited URL, retries failures in a browser and reports links that cannot be followed. It runs as `npm run link:check` and is not part of `npm run gates`.
- `design-check.mjs` serves `web/dist` and audits ten routes in both themes at desktop and mobile widths. It runs as `npm run design:check`.

## Invariants

- `ratings.json` must come from the same `CHAINS` data and the same `scoreChain` call as the interface, so the feed cannot drift from the site. The file states the reference profile `DEFAULT_PROFILE` together with its weights.
- `schemaVersion` in `gen-ratings.ts` changes when the shape of the feed changes. It is 2 since the adverse media factor joined.
- `source-check.mjs` and `link-check.mjs` parse the block of `chains.ts` between `const S = {` and `// Small builders`. Each stops with an error if it parses fewer than 20 citations, which signals that the file shape has changed.
- `link-check.mjs` stays out of the gates because it depends on third-party sites. A citation marked `gated: true` is real but is available only through a form.
- `design-check.mjs` requires `web/dist` and exits with a message when it is missing. Its `PAGES` list pairs each route with marker text, and a route that lacks its marker fails. Any new route needs an entry in that list.
- `design-check.mjs` fails on a font family outside its allowed list, on interface text below 11px, on horizontal overflow, on marks outside their plot area, on console errors and on text that spills or is clipped.

## Side Effects

- `gen-ratings.ts` writes `public/ratings.json` with `writeFileSync` and logs the path.
- `link-check.mjs` makes HTTP requests to every cited URL and launches a Playwright Chromium browser for the retry stage.
- `design-check.mjs` starts an HTTP server on port 4187, launches Chromium and sets the `cg-theme` key in the browser `localStorage`.
- `prose-check.mjs` and `source-check.mjs` only read files.

## Verification

- Run in `web/`: `npm run gates`, which runs lint, test, prose, source:check, check:api, build and design:check in order.
- Run in `web/`: `npm run gen:ratings` to regenerate the feed alone.
