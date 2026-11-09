# lib

## Overview

This directory holds the pure logic of the ChainGauge site: the weighted scoring model, the evidence measures, the export builders, the hash router and the visual tokens. Most files take a `Chain` from `../content/types.ts` and a deployment `Profile` and return plain data, so they run under vitest in a node environment. The files `theme.ts` and the download helper in `exportData.ts` are the only ones that touch the browser.

## Interface

- `model.ts` exports `scoreChain`, `resolveWeights`, `gradeMeta`, `bandFromGrade`, `pillarSeverity`, the constants `SEVERITY`, `PILLARS`, `PRODUCT_WEIGHTS`, `CUSTOMER_MULT`, `PRODUCT_META`, `CUSTOMER_META` and `DEFAULT_PROFILE`, and the types `Grade`, `ProductProfile`, `CustomerProfile`, `Profile`, `FactorScore`, `Cap` and `ChainScore`.
- `rating.ts` exports `levelsOf`, `deriveBand`, `concernIndex`, `byRisk` and `rosetteWedges` (the SVG sector geometry for the rosette), with the `Wedge` type.
- `evidence.ts` exports `evidenceFor` and `decidingFactor`, with the `Evidence` and `Caveat` types. They report how much of a score rests on sourced factors and whether the deciding factor between two chains has a source.
- `sourceOfFunds.ts` exports `sourceOfFundsView` and `bindingConstraint`, with the `Consequence` type. They restate the seven factor levels for a case where funds have already moved.
- `exportData.ts` exports `buildAssessment`, `buildExportJSON`, `buildExportCSV`, `downloadFile` and `exportStamp`, with the `ChainAssessment` type.
- `router.ts` exports `parseHash`, `formatHash`, `DEFAULT_ROUTE` and the `Route` and `RoutePage` types.
- `uiTokens.ts` exports the level, band, category and exposure tier labels and styles, such as `RISK_VAR`, `RISK_LABEL`, `chipStyle`, `dotStyle`, `textStyle`, `bandChipStyle`, `BAND_LEVEL`, `BAND_LABEL`, `RELEVANCE_LABEL`, `RELEVANCE_ORDER`, `RELEVANCE_BLURB`, `relevanceStyle`, `CATEGORY_LABEL` and `CATEGORY_LONG`.
- `theme.ts` exports the `useTheme` hook and the `Theme` type.
- `cn.ts` exports `cn`, which merges Tailwind class names through `clsx` and `tailwind-merge`.
- The tests are `evidence.test.ts`, `exportData.test.ts`, `rating.test.ts`, `router.test.ts`, `sourceOfFunds.test.ts` and `submission.test.ts`. The last one covers `api/_lib/submission.ts` through the `@shared` alias.

## Invariants

- The score is a transparent sum of severity times weight. `SEVERITY` in `model.ts` maps `clear`, `caution` and `elevated` to 0, 50 and 100, and `resolveWeights` renormalises the product weights after the customer modifier so that the weights sum to 1.
- A hard cap applies in `scoreChain`. A rating of `elevated` on `traceability` or `coverage` sets a floor of 66, and two or more elevated factors set a floor of 46. The grade thresholds in `gradeFromScore` are below 12 for A, 26 for B, 44 for C and 62 for D.
- The band is never stored. `deriveBand` and `bandFromGrade` compute it from the grade, as `../content/types.ts` states.
- The order of `DIMENSIONS` fixes the order of the rosette wedges, so `rosetteWedges` must keep iterating over `DIMENSIONS`.
- Evidence strength is published beside the score and is never blended into it. `evidenceFor` must not change the value that `scoreChain` returns.
- `sourceOfFunds.ts` states consequences and gives no instructions. The text in `ANSWER` must not tell a firm what to ask a customer for, when to escalate or when to file. `sourceOfFunds.test.ts` guards this boundary.
- `parseHash` accepts only chain ids in `knownChainIds`, caps the compare set at four chains and falls back to the overview for an unknown page. `formatHash` omits the `p` and `c` parameters when they equal `DEFAULT_PROFILE`.
- Any change to the weights, the thresholds or the caps changes the grades published in `/ratings.json`, because `../../scripts/gen-ratings.ts` calls `scoreChain`.

## Side Effects

- `theme.ts` reads the `data-theme` attribute of the document element, sets it, and writes the `cg-theme` key to `localStorage`. A storage failure is caught and ignored.
- `exportData.ts` `downloadFile` creates a blob URL and clicks a temporary anchor element. `buildExportJSON` and `exportStamp` read the current date.
- None found in the other files in this directory.

## Verification

- Run in `web/`: `npm test` (vitest, which includes `src/**/*.test.ts` through `web/vitest.config.ts`).
- Run in `web/`: `npm run lint`.
