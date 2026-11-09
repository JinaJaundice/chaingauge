<div align="center" id="hero-image">
  <picture>
    <source srcset="docs/assets/overview-dark.png" media="(prefers-color-scheme: dark)">
    <img src="docs/assets/overview-light.png" alt="The ChainGauge overview page, with the spread of financial crime grades across 53 public blockchains" width="720">
  </picture>
</div>

<h1 align="center">ChainGauge</h1>

<p align="center">Financial crime ratings for 53 public blockchains, so a compliance team can assess a chain before a product team deploys on it.</p>

<p align="center">
  <a href="https://chaingauge.app">Live site</a> |
  <a href="https://chaingauge.app/ratings.json">Ratings feed</a> |
  <a href="https://chaingauge.app/#/method">Method</a> |
  <a href="LICENSE">Licence</a>
</p>

ChainGauge rates 53 public blockchains on 7 financial crime factors. It is written for compliance teams who must assess a chain before a product team deploys on it. Each rating shows its reasoning and its sources, so a reader can check it and argue with it.

ChainGauge is a personal project of Sooraj Muhammed, who works in financial crime and digital assets consulting and was previously a senior policy adviser on cryptoassets at the Financial Conduct Authority. No employer is involved in it, none has reviewed it, and nothing here is the view of any organisation. It is not affiliated with any chain, analytics provider or vendor, and no one pays to be listed or rated.

## What you can do

- See the grade of each chain for a product and a customer type that you choose.
- Open a chain page to read its 7 factors, its rationale and its sources.
- Put 2 to 4 chains side by side on the compare page.
- Read the risk matrix for all chains.
- Download a chain as JSON, or print it.
- Read the ratings feed in your own tools.
- Challenge a rating that you think is wrong.

## How it works

Each chain is rated on 7 factors:

- Traceability
- Analytics coverage
- Illicit exposure
- Asset controls
- Travel Rule and identity
- Accountability
- Adverse media

Each factor has one of three levels, Clear, Caution or Elevated. Green always means lower financial crime concern.

The 7 levels feed a weighted risk score from 0 to 100, where 0 is best. The weights depend on a deployment profile, which is a choice of 1 of 6 products and 1 of 3 customer types. The score maps to a letter grade from A to E. The grade then sets the posture band, Use it, Use it carefully or Think hard, by fixed rules. The headline therefore cannot differ from the detail behind it.

Each rating also states its basis. A basis of observed means the point was measured. A basis of no record means there is too little history to say, so a Clear level then reads as an absence of evidence. Each grade also shows the share of its weight that rests on a cited source.

<p align="center">
  <img alt="The page of one chain, Tron, with its grade, its 7 factors and their sources" src="docs/assets/chain-tron.png" width="720">
</p>

The risk matrix lists every chain against every factor, so a reader can scan for gaps across the whole set.

<p align="center">
  <img alt="The risk matrix, with one row for each chain and one column for each of the 7 factors" src="docs/assets/matrix.png" width="720">
</p>

## Comparing chains

Choose 2 to 4 chains on the compare page to see their factors, grades and sources next to each other. The page also warns when one chain leads another only on a factor that has no published source.

<p align="center">
  <img alt="The compare page, with Bitcoin, Tron and Monero side by side" src="docs/assets/compare.png" width="720">
</p>

The ratings page groups all 53 chains by grade for the profile you choose. Each chain opens its own page from there.

<p align="center">
  <img alt="The ratings page, with every chain grouped by grade from A to E" src="docs/assets/ratings.png" width="720">
</p>

## Using the ratings in your own work

- The feed at `/ratings.json` carries schema version 2. It holds the raw factor levels, the reference profile, the weights and the review dates. It is regenerated on every build and is served with open CORS, so a browser page can read it.
- Each chain page has a JSON button and a Print / PDF button.
- The compare link carries its selection in the URL, so you can share a comparison by sending the link.

## Challenge a rating

Some ratings will be wrong. The Contribute page lets you challenge a factor, propose a missing chain or report a defect. It needs no account.

A submission goes to a private queue, because it may name a firm or an incident that has yet to be checked. A person opens the cited source before any rating moves. Every change is published with its date and reason in the changelog. The steps are set out in `docs/CONTRIBUTIONS.md`.

<p align="center">
  <img alt="The Contribute page, with the form for challenging a rating" src="docs/assets/contribute.png" width="560">
</p>

## How the evidence is kept current

Each Monday a scheduled coding agent checks the evidence and proposes its changes as a pull request in the working repository. A second agent then checks each claim against its source, and it merges the change only when every claim passes. The merge deploys the site, and the maintainer can revert or close any change. The routines and their review standard are set out in `docs/WEEKLY-REFRESH.md`.

This repository is a public copy of the working repository and is refreshed from it. The live site and the feed carry the current ratings.

## Build from source

You need Node 22.12 or later and a copy of this repository. To run the site on your own computer, run these commands from the repository root:

```
cd web
npm install --legacy-peer-deps
npm run dev
```

The site then opens at `http://localhost:5177`. To run the checks, run these commands from the `web` folder:

```
npm test
npm run gates
```

The command `npm run gates` runs lint, tests, the prose check, the source check, the API type check, the build and the design check.

## Repository layout

- `web/` holds the site.
- `api/` holds the function that receives submissions.
- `tools/` holds the helper scripts.
- `docs/` holds the reference documents `ARCHITECTURE.md`, `CONTENT.md`, `CONTRIBUTIONS.md`, `DESIGN.md`, `METHODOLOGY.md`, `RED-TEAM.md`, `RUNBOOK.md` and `WEEKLY-REFRESH.md`.

## Scope and disclaimer

ChainGauge covers public chains only. The ratings are a curated and dated view of public information, and nothing updates live. They are a starting point for enhanced due diligence. They are not legal, regulatory or investment advice, and they do not replace transaction screening.

## Licence and acknowledgements

ChainGauge is licensed under the Apache License, Version 2.0 (see `LICENSE`). The two fonts in `web/public/fonts`, Instrument Sans and JetBrains Mono, are under the SIL Open Font License 1.1. The network glyphs in `web/src/content/chainIcons.ts` are generated from the package `@web3icons/core`, which is under the MIT License. The names and logos of the networks are the marks of their owners, and the site uses them only to identify each network. Further details are in `NOTICE` and `THIRD_PARTY_NOTICES.md`. As the licence says, the software is provided 'as is', without warranties or conditions of any kind.

## Reporting a problem

Send a challenge to a rating through the Contribute page. Raise a bug in the code as an issue in this repository. Report a security problem privately, as `SECURITY.md` describes.
