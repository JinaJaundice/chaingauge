# ChainGauge roadmap

## After v0.8: shipped (2026-08-01 to 2026-11-02): evidence, a seventh factor and the weekly refresh

- **A seventh factor, adverse media (2026-08-18).** Every chain carries an adverse media
  rating, weighted at about a tenth of the balanced grade, and the feed moves to
  `schemaVersion: 2` (`web/scripts/gen-ratings.ts`). Cronos and Robinhood Chain joined the
  ratings on the same date, which brings the store to 53 chains.
- **Evidence strength (2026-08-01).** `web/src/lib/evidence.ts` publishes the share of a grade's
  weight that rests on a cited source, and the compare view says when a gap between chains rests
  on an unsourced factor.
- **The weekly evidence refresh.** Two cloud routines re-check sources every Monday, open one
  pull request and merge it after an automated review. The brief and the review standard are in
  `docs/WEEKLY-REFRESH.md`, and the commits are named `weekly refresh: <date>`.
- **Dependencies.** `d3-force` and `d3-scale` are removed, because no file imports them since
  `ChainGrid.tsx` replaced the two scatter charts in v0.8.

## v0.8: shipped (2026-07-28): the first review round

Three public submissions came through the live form and drove the whole release.
Each is in the changelog with its reason and the "from a submission" mark.

- **Overview is a tab, Changelog is a tab.** The landing page sat outside the
  navigation and read as a splash screen. Six tabs do not fit 375px, so the tab
  strip scrolls instead of the page.
- **One chart instead of two.** Visibility and control are each the mean of two
  three-level factors: 25 possible positions, 9 occupied, one holding sixteen
  chains. A scatter cannot work on that, which is what the force layout was
  fighting and where the clipping came from. `ChainGrid.tsx` is HTML, tiles are
  tickers, and it shows which chains change grade by product, which the table
  cannot.
- **No chain reads as flawless.** Nine rollups move to caution on asset controls
  (their controls run on contracts the operator can still upgrade; sourced to
  L2BEAT), and `residual` is a required field on every chain, surfaced on the
  chain page, compare, the grid, the table, the feed and both exports. The scale
  now says clear means no material gap on that one factor.
- **QA found four more:** the stats grid drew its container colour as a grey slab
  on a short last row, the sensitivity line chart put every point in the top
  eighth of an empty plot (now bars), six product labels truncated mid-word, and
  the instrument panel stretched to its neighbour.

## v0.7: shipped (2026-07-28): public launch

The release that opens the site to the public and makes it arguable.

- **Coverage review.** Nine chains added that carry real settlement volume or
  that firms are now being asked about: Tempo, Plasma, Hyperliquid, Unichain,
  World Chain, Celo, Gnosis Chain, Monad, Berachain. 51 rated.
- **Footprint tiers.** Every chain states where a regulated firm meets it and the
  evidence for it (mainstream / emerging / niche / restricted). Deliberately off
  the risk palette: relevance is not risk, and a restricted chain is highly
  relevant precisely because it is being excluded.
- **`NOT_RATED`.** Canton Network, Arc and the announced stablecoin chains are
  named with the reason instead of being quietly absent. Canton is excluded
  because the model assumes a third party can observe and screen activity, and on
  a permissioned network that assumption does not hold.
- **Grade cohorts instead of a rank.** Fourteen chains share grade A. The table groups
  by grade and orders by footprint inside each grade.
- **Contribute.** A public intake with no account needed, a private queue, an
  injection-safe prompt generator (`tools/inbox.mjs`), and a public changelog.
  See `docs/CONTRIBUTIONS.md`.
- **A landing page.** The old overview was a hero bolted onto a table; a first
  time reader now gets what it is, who it is for, a real worked example, and
  three things to do next.
- **Four tabs, down from five.** Matrix became a view inside Ratings and Compare
  is reached from the table, so Contribute cost no navigation. (v0.8 later added
  Overview and Changelog as tabs, which makes six.)
- **`design:check`.** An enforced Playwright audit across both themes at desktop
  and mobile. Its first run found 161 elements below the 11px type floor on the
  ratings page alone.

## v0.4: shipped (2026-07-16)

- **Shareable URLs**: a hash router puts every tab, chain page, compare set and
  the deployment profile in the URL; the back button works.
- **Quick search**: "/" or Ctrl+K opens a chain finder (grades shown, Enter opens).
- **Compare view**: 2–4 chains side by side under the same profile (grades,
  rosettes, six factors with rationales, structural stats, deployment notes).
- **Assessment export**: JSON/CSV of the full index under the chosen profile;
  per-chain JSON + a print-clean one-pager (browser print → PDF).
- **Polish**: keyboard-accessible chart dots, SVG favicon, OG/Twitter meta with a
  rendered social card, mobile nav fits five tabs.

## v0.3.1: shipped (2026-07-16)

- **Interactive charts on d3-force**: hover tooltips (chain, grade, score) and
  click-to-open on every chart mark; collision layout with in-plot clamping
  (fixes dots/labels escaping the chart boundary).
- **Beeswarm** of all chains by score × category replaces the grade bar chart;
  new per-chain **product-sensitivity chart** (the same chain scored under all
  six product profiles, spread called out).

## v0.3: shipped (2026-07-15)

- **Quantitative, product-aware risk model** (`lib/model.ts`): six factor
  severities × profile-driven weights (6 products × 3 customer types) → a 0–100
  score with two hard caps → a letter grade A, E. Pure and unit-tested; `rating.ts`
  delegates to it.
- **Segmentation control**: changing the product/customer profile re-weights,
  re-scores and re-ranks every chain live, on the Overview and the chain page.
- **The calculation shown**: per-factor severity × weight = contribution
  (visualised as bars), weighted score, cap, final score, grade and the drivers behind it.
- **Model-driven charts** (native SVG, theme-adaptive): visibility-vs-control
  landscape scatter and a grade distribution.
- **Method page** documents the model; **Method + About** redesigned to full
  width (deadspace fix).

## v0.2: shipped (2026-07-15)

- **Terminal / instrument-panel redesign**, dark-native with a light "daylight"
  variant and a nav theme toggle (CSS-variable theming; the rosette and a new
  radial concern gauge adapt automatically).
- **Per-chain financial-crime data readout**: sourced stats (analytics coverage,
  privacy tech, native controls, Travel Rule, plus hard figures like Tron's
  blacklisted-address multiple and frozen USDT, Ethereum's Bybit hack, Ronin's
  bridge hack) that feed the ratings.
- **Expanded 17 → 42 chains** (new L1s, L2s, privacy chains): 9 Established,
  28 Conditional, 5 High-risk.
- **About page**; Overview columns renamed (Rating / Risk profile / Top concern /
  Score). Live on Vercel; GitHub push auto-deploys.

## v0.1: shipped (2026-07-15)

- One `Chain` content model, many views (Overview, Risk matrix, Methodology,
  chain detail).
- Six-dimension financial-crime framework with a Clear / Caution / Elevated scale
  and a derived Established / Conditional / High-risk posture band.
- The risk rosette (six SVG wedges), the L2BEAT-style risk matrix, and a
  sortable, filterable overview table with a concern index.
- 17 public chains rated and sourced: Bitcoin, Ethereum, Base, Arbitrum One,
  OP Mainnet, Polygon PoS, Avalanche C-Chain, XRP Ledger, Stellar, Tron, Solana,
  BNB Chain, Litecoin, Hedera, Cardano, Zcash, Monero.
- Light / indigo identity. Mobile-responsive.
- Gates green: `tsc`, ESLint, Vitest (band logic), `vite build`.

## Next / deferred

- **Extend the model beyond chains**: bridges, cryptoassets and VASPs on the same
  seven-factor framework. The chain layer is the one people ask about first, but a
  bridge is where a lot of the tracing difficulty actually sits.
- **Regulatory overlay**: a per-chain regulatory treatment field (MiCA/AMLR
  status, the 2027 anonymity-asset restriction, jurisdiction flags), shown on the
  chain page and filterable. Offered and parked on 2026-07-16; data work across
  all 53 chains.
- **More chains**: extend the store (adding a chain is one entry): more L2s,
  more non-EVM L1s, additional privacy chains. Purely data.
- **Periodic review**: refresh ratings and the `asAt` date as the analytics
  landscape, sanctions and regulation move (the FATF Travel Rule numbers, the EU
  AMLR anonymity-enhancing-asset restriction, new freeze precedents).
- **Voting on open submissions.** Deliberately not built for the first public
  release: without accounts a vote count is trivially gamed, and a gamed count is
  worse than none. Revisit if submission volume makes triage order a real problem.
- **A short "how we rate" data note** per source, if the sourcing needs to be
  more granular than one link per rating.

## Out of scope (on purpose)

- **Live on-chain data pull.** Ratings are a curated, dated, assessed view, in the
  spirit of L2BEAT's hand-reviewed risk cells, with no automated feed behind them.
- **Permissioned networks.** Public chains only; permissioned ledgers are a
  different question.
- **Address / transaction screening.** ChainGauge rates chains and says nothing about wallets;
  wallet screening is what Chainalysis / TRM / Elliptic / Scorechain do.
