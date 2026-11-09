# Content model and integrity

## The `Chain` shape (`content/types.ts`)

```ts
Chain {
  id, name, ticker, category            // category: l1 | l2 | payment | privacy
  exposure: { tier, where, scale }      // footprint tier: mainstream | emerging | niche | restricted
  residual: { note, sources }           // what remains after the seven factors; required
  facts: { consensus, model, launched, steward }
  summary                               // 1–2 sentence headline synthesis
  deployment                            // "considerations for deployment" note
  stats: Stat[]                         // the financial-crime data readout
  ratings: Record<DimensionId, Rating>  // the seven dimensions
  asAt                                  // ISO yyyy-mm-dd review date
  reviewed?                             // when this chain's ratings were last examined
}
Rating { level, rationale, sources, basis? }  // level: clear | caution | elevated
                                              // basis: observed (default) | no-record
Stat { label, value, level?, source? }  // a fincrime data point on the readout
Source { name, url?, kind? }            // kind: primary | secondary
```

The store holds **54 chains**. `Stat`s mix hard sourced figures (money
stolen, frozen value, blacklisted addresses) with structured facts that also feed
the ratings (analytics coverage, privacy tech, native controls, Travel Rule);
`covStat` / `privStat` / `ctrlStat` / `trStat` builders at the top of `chains.ts`
keep the structural ones consistent. `level` optionally tints a value.

The **band is never stored**. It is derived from `ratings` by `deriveBand()`
(`lib/rating.ts`), so the scannable headline can never drift from the rosette.

## The rating scale

Normalised so **green always means lower financial-crime concern**, even for
illicit exposure where less is better:

- **clear** (emerald): low concern
- **caution** (amber): manageable gaps
- **elevated** (rose): material concern

Each dimension is judged independently ("as if the others were green"), the
L2BEAT rosette principle.

## Integrity rules (hard)

- Every **hard fact** carries a real source `url`: analytics coverage, sanctions,
  illicit data, freeze / seize precedents, native controls. Shared sources live in
  the `S` map at the top of `chains.ts` and are referenced by many chains.
- A rating that is a **judgement call** has `sources: []`. The UI labels it
  "Our judgement, no source". That honesty is the point, don't invent a source to hide a
  judgement.
- **Never fabricate** an enforcement action, a figure, a freeze, or a URL. Only
  cite sources that exist.
- Summarise and link; never republish paywalled intelligence wholesale.

## Seeding / editing

All data is in `content/chains.ts`. To re-rate a chain, edit its `ratings` and
bump `asAt`. To add a chain, append one object (see `docs/ARCHITECTURE.md`). Run
`tsc -b --noEmit` and `npm run gates` from `web/` (lint, test, prose, source:check, check:api, build
and design:check) and re-check the Overview spread and the
chain's rosette before shipping.

