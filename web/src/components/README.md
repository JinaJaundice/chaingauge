# components

## Overview

This directory holds the React components shared by the views of the ChainGauge site: the top navigation, quick search, the deployment profile control, the rosette and gauge graphics, the chain grid and the small display primitives. The components read the data in `../content` and compute scores through `../lib/model.ts`. They keep no data of their own.

## Interface

- `ChainGrid.tsx` exports `ChainGrid`, which takes `chains`, `profile` and `onSelect` and shows the chains in one column per grade A to E. It replaced two scatter charts, and the header of the file gives the reason.
- `QuickSearch.tsx` exports `QuickSearch`, which takes `chains`, `profile` and `onSelect` and opens on `/`, on Ctrl or Cmd with `K`, or on the `cg:search` window event.
- `TopNav.tsx` exports `TopNav` (props `page`, `chainOpen`, `setPage`, `onHome`, `asAt`) and `openSearch`, which dispatches the `cg:search` event.
- `Segmentation.tsx` exports `Segmentation`, the product and customer profile control, with the props `profile`, `setProfile` and `compact`.
- `RiskRosette.tsx` exports `RiskRosette`, `ConcernGauge` and `RosetteWithLegend`. The wedge geometry comes from `rosetteWedges` in `../lib/rating.ts`.
- `charts.tsx` exports `ProfileSensitivity`, which shows the score of one chain under the six product profiles, and `ContributionBars`, which shows the contribution of each factor to a `ChainScore`.
- `primitives.tsx` exports `RiskDot`, `BandChip`, `GradeChip`, `LevelChip`, `CategoryTag`, `TierTag`, `Monogram`, `sourceHost`, `Citation`, `EvidenceChip`, `Panel` and `SectionLabel`.

## Invariants

- Colour comes from the CSS variables in `RISK_VAR` (`../lib/uiTokens.ts`), so every graphic follows the active theme. Colour is always paired with a label.
- Marks in the SVG graphics must sit inside their own `viewBox`. `../../scripts/design-check.mjs` measures them and fails the design gate if a mark is outside its `viewBox` or its plot area. `ConcernGauge` clamps its value to 0 to 100.
- `Citation` derives the publisher chip from the link host with `sourceHost`, and never from the citation name.
- `EvidenceChip` renders only for a rating with no source, and states that the rating is the judgement of the site.
- Interface text stays at 11px or above, and only the fonts allowed in `design-check.mjs` are used.
- `TopNav` gives no tab to `matrix` or `compare`, which belong under the Ratings tab (`TAB_OF`).
- Scores always come from `scoreChain` with the profile passed in. A component must not weight factors itself.

## Side Effects

- `QuickSearch.tsx` adds and removes `keydown` and `cg:search` listeners on `window`.
- `TopNav.tsx` `openSearch` dispatches the `cg:search` custom event on `window`, and the component calls `useTheme` from `../lib/theme.ts`, which writes the `cg-theme` key to `localStorage`.
- None found in the other files in this directory.

## Verification

- Run in `web/`: `npm run lint`.
- Run in `web/`: `npm run build`, then `npm run design:check`. The design check serves `web/dist` and drives it with Playwright in both themes at desktop and mobile widths.
