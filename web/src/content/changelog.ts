// ---------------------------------------------------------------
// The public record of what changed and why.
//
// The submission queue itself is private, because a challenge often names a
// firm or a customer before it has been checked. What is public is every action
// taken: what changed, on what date, on what evidence, and whether a submission
// prompted it. A rating you cannot audit the history of is not worth much.
//
// Adding an entry is one object. Newest first; the views do not sort.
// ---------------------------------------------------------------

export type ActionKind =
  | "rating" // a factor level moved
  | "coverage" // a chain added, or deliberately not rated
  | "method" // the model or the framework changed
  | "correction" // something was wrong and is now right
  | "site"; // the site itself

export interface ChangeEntry {
  date: string; // ISO yyyy-mm-dd
  kind: ActionKind;
  /** What changed, in one line. */
  title: string;
  /** Why, in the plainest terms available. */
  detail: string;
  /** Chain ids this touched, for the per-chain history. */
  chains?: string[];
  /** Set when a public submission prompted this. Free text, no submitter name. */
  prompted?: string;
}

export const ACTION_LABEL: Record<ActionKind, string> = {
  rating: "Rating action",
  coverage: "Coverage",
  method: "Method",
  correction: "Correction",
  site: "Site",
};

export const CHANGELOG: ChangeEntry[] = [
  {
    date: "2026-11-09",
    kind: "coverage",
    title: "Arc added: Circle's public mainnet opened in September, and this site had it as announced-only",
    detail:
      "Arc was tracked in NOT_RATED from the review that found it at private mainnet, with public mainnet set for 16 September 2026. That date has passed, Arc has been live for about two months, and it carries roughly $1.3bn in stablecoin supply and a founding validator cohort of named institutions including BlackRock, DTCC, Visa, Mastercard and Standard Chartered, so it now has observable behaviour to rate. Arc is added as a full entry with grade B (Established) on the balanced profile. The grade reflects mainly thin analytics coverage and early Travel Rule tooling. Arc carries no illicit or accountability finding. Arc's documentation states that the USDC blocklist is enforced at runtime and that a value transfer to or from a blocklisted address reverts.",
    chains: ["arc"],
  },
  {
    date: "2026-11-09",
    kind: "correction",
    title: "Hyperliquid's adverse media and accountability rationales were missing a September 2026 congressional inquiry",
    detail:
      "The House Oversight Committee wrote to Hyperliquid Labs co-founder Jeff Yan on 29 September 2026, as part of a wider prediction-market insider-trading inquiry that also reached Kalshi and Polymarket. The letter, read directly, asks for KYC, surveillance and compliance records tied to a $1.1bn short position, taken on margin, opened about 30 hours before an October 2025 tariff announcement and closed for more than $150m in profit, with a reply due 13 October 2026. This is a separate, additional line of scrutiny alongside the CME and ICE complaint to the CFTC already cited. Both the accountability and adverse media rationales are updated to name it; neither level moves, since both were already at the top of the scale (elevated and caution) before this check.",
    chains: ["hyperliquid"],
  },
  {
    date: "2026-11-09",
    kind: "rating",
    title: "Gnosis's no-record illicit rating no longer holds; a June 2026 Gnosis Pay exploit was missing",
    detail:
      "A vulnerability in the Zodiac Delay and Roles modules used by the Gnosis Pay card safes was exploited on 1 June 2026. Gnosis Pay's post-mortem reports that the attacker took about $1.5m and left about $300k inaccessible across 5,281 wallets. It states that Gnosis absorbed the losses and restored all funds to users and that the impact was isolated to the card safe modules. The controls rating is unchanged because the freeze capability of the e-money issuer was not in question. The illicit rating moves from clear (no-record) to caution because a measured event now exists.",
    chains: ["gnosis"],
  },
  {
    date: "2026-11-09",
    kind: "rating",
    title: "Berachain's no-record illicit rating no longer holds; a November 2025 exploit and rollback were missing",
    detail:
      "A check of each clear, no-record rating against this week's news found one that this site had missed. On 3 November 2025 the Balancer V2 exploit reached Berachain's BEX exchange and put about $12m of user deposits at risk. Berachain's validators halted the chain and rolled back the affected transactions to recover user funds. The Block reports that the exploit drained more than $128m across chains. The illicit rating moves from clear (no-record) to caution because a measured event now exists, although the sum is small against the chain's volumes at the time. The controls rationale now records that the rollback recovered funds without a regulated freeze process. The accountability rationale quotes a Berachain executive who said that the halt and rollback 'could be seen as a contentious decision'. Both levels were already at caution before this check and do not move.",
    chains: ["berachain"],
  },
  {
    date: "2026-11-09",
    kind: "rating",
    title: "Ronin's May 2026 move to an OP Stack rollup was not reflected in its facts or its controls rating",
    detail:
      "Ronin's facts still read 'Delegated proof of stake' and 'EVM sidechain'. ETHBEAT, formerly L2BEAT, records that the chain moved from an independent sidechain to an OP Stack Ethereum layer 2 in May 2026. ETHBEAT classes Ronin as an Optimium that posts its data to EigenDA. It reports that only permissioned fraud-proof games are allowed and that the contracts are instantly upgradable. Ronin's facts now describe the migration. The controls rating moves from clear to caution to match. No other factor changed. The 2022 bridge hack remains the basis for the illicit, accountability and adverse media ratings.",
    chains: ["ronin"],
  },
  {
    date: "2026-11-09",
    kind: "correction",
    title: "L2BEAT has rebranded to ETHBEAT; thirteen citations renamed",
    detail:
      "L2BEAT's domain now redirects to ethbeat.org and its own site says the rebrand covers the same organisation and the same Stage framework ('formerly L2BEAT'). The URLs this site cites still resolve through the redirect, so nothing was broken, but the citation names on Base, Arbitrum One, OP Mainnet, Linea, zkSync Era, Starknet, Scroll, Blast, Mantle, Unichain, World Chain, Celo and Ronin are renamed to 'ETHBEAT (formerly L2BEAT)' so a reader checking the name against the live site finds a match. No rating or fact changed.",
    chains: ["base", "arbitrum", "optimism", "linea", "zksync", "starknet", "scroll", "blast", "mantle", "unichain", "worldchain", "celo", "ronin"],
  },
  {
    date: "2026-11-09",
    kind: "correction",
    title: "The Notabene registry grew to 304 networks and 3,629 assets, and the TON coverage figures are corrected",
    detail:
      "The registry's live totals were checked again: 304 networks and 3,629 assets, up from 303 and 3,623 a week earlier. TON's mapped assets held at 14. Of these, 11 carry the placeholder value in the elliptic_blockchain field and 3 leave it empty. The coverage rationale for TON is corrected to these figures from its earlier statement that every row carried the placeholder. The Travel Rule rationale for TON did not change in substance. Firo still has no native network entry; its only match is the Binance-Peg wrapped version listed under BNB Chain. Firo's own Travel Rule rationale cited the registry's network count directly and read '300 networks', already a week stale; it is corrected to 304. The Chainalysis and Elliptic field fill rates (98% and 74%) and the 99% placeholder share within the filled Elliptic field were re-measured and are unchanged. No rating level moved.",
    chains: ["ton", "firo"],
  },
  {
    date: "2026-11-02",
    kind: "correction",
    title: "The Elliptic field behind every 'N Elliptic asset identifiers' figure turns out to be mostly a placeholder",
    detail:
      "Counting the Notabene registry's elliptic_blockchain field directly, rather than trusting its 74% fill rate as this site's Method page did, found that about 99% of the filled values repeat one identical placeholder rather than naming anything specific to Elliptic. Checked for TON: all fourteen of its mapped assets carry that same value or none, so the figure this site quoted for TON's Elliptic coverage, 10 asset identifiers, was a count of placeholder entries rather than of anything Elliptic-specific. TON's rationale is corrected to say so. The same field feeds the per-chain Elliptic counts quoted on most other chain pages, and this run did not re-derive every one of them: that is a methodology decision for the maintainer rather than a one-week patch. No rating level moved. The Method page's caution paragraph is rewritten to say the field does not carry the information it was credited with.",
    chains: ["ton"],
  },
  {
    date: "2026-11-02",
    kind: "correction",
    title: "The Notabene registry grew to 303 networks; TON's mapped assets moved from 13 to 14",
    detail:
      "The registry's live totals were checked again: 303 networks and 3,623 assets, up from 300 and more than 3,400. TON now has 14 assets mapped, up from 13; the new one carries no distinct Elliptic value either, so it does not change TON's coverage or Travel Rule rating. Firo was checked again and still has no native network entry; its only match in the registry is a Binance-Peg wrapped version listed under BNB Chain, which is not evidence about Firo's own chain. Neither rating moved.",
    chains: ["ton", "firo"],
  },
  {
    date: "2026-11-02",
    kind: "correction",
    title: "Four stablecoin supply figures re-read against DefiLlama's live feed",
    detail:
      "Tron, Solana, BNB Chain and Hyperliquid's stablecoin-supply figures were checked again against DefiLlama's live circulating-supply data. Tron has edged from about $93bn to about $94bn, now roughly 32% of all stablecoins. Solana has moved from about $16bn to about $15bn. BNB Chain has moved from about $14bn to about $13bn, reversing the move recorded here on 31 August; the figure appears to be oscillating week to week rather than trending in one direction. Hyperliquid has moved from about $6.9bn to about $6.7bn, still ahead of Base and Arbitrum. No rating level moved.",
    chains: ["tron", "solana", "bnb", "hyperliquid"],
  },
  {
    date: "2026-08-31",
    kind: "correction",
    title: "Secret Network's primary developer withdraws support",
    detail:
      "SCRT Labs, the company that has developed Secret Network, announced it would end its development and support role from 1 September 2026, regardless of how a governance vote went. Backers passed Proposal 365 anyway, executing an emergency 75% supply dilution on 21 August 2026 to fund a community-run continuance plan, and Binance announced it would delist the token the same month. Neither level moved: both accountability and adverse media were already caution, and the visibility cap already floors this chain at grade E for its encrypted contract state. The rationale for both now names the specific event rather than the general pattern.",
    chains: ["secret"],
  },
  {
    date: "2026-08-31",
    kind: "rating",
    title: "Monad's illicit exposure moves from a no-record clear to caution",
    detail:
      "Monad carried a hollow, no-record clear on illicit exposure because the chain was too young for anyone to have measured it. That absence of evidence ended in May 2026: a compromised admin key let an attacker mint unauthorised eBTC in an exploit of the Echo Protocol, and about $816,000 of the proceeds were bridged off Monad and laundered through Tornado Cash before the protocol recovered its keys and burned the rest. It is a single incident on a young chain rather than a measured concentration, so the level moves only one step, to caution, but the no-record marker is dropped because there is now a record.",
    chains: ["monad"],
  },
  {
    date: "2026-08-31",
    kind: "correction",
    title: "BNB Chain's stablecoin supply edges from about $13bn to about $14bn",
    detail:
      "Tron, Solana, Hyperliquid and BNB Chain's stablecoin-supply figures were re-read against DefiLlama's live circulating-supply data. Tron holds at about $93bn, roughly 31% of all stablecoins; Solana holds at about $16bn; Hyperliquid holds at about $6.9bn, still ahead of Base and Arbitrum. BNB Chain has moved from about $13bn to about $14bn. No rating level moved.",
    chains: ["bnb"],
  },
  {
    date: "2026-08-24",
    kind: "correction",
    title: "Three stablecoin supply figures re-read against DefiLlama's live feed",
    detail:
      "Tron, Solana, Hyperliquid and BNB Chain's stablecoin-supply figures were checked again against DefiLlama's live circulating-supply data. Tron has edged from about $92bn to about $93bn, holding at roughly 31% of all stablecoins. Solana has moved from about $15bn to about $16bn, and Hyperliquid from about $6.2bn to about $6.9bn, still ahead of Base and Arbitrum, which is the point that figure makes. BNB Chain was checked at the same time and still reads about $13bn, unchanged. The figures continue to cite DefiLlama's live feed, and no rating level moved.",
    chains: ["tron", "solana", "hyperliquid", "bnb"],
  },
  {
    date: "2026-08-24",
    kind: "coverage",
    title: "Arc's not-rated note updated as it nears public mainnet",
    detail:
      "Circle's Arc chain, one of the networks the site lists as left unrated, has reached private mainnet and set public mainnet for 16 September 2026, with a founding validator cohort that includes BlackRock, Visa, Mastercard, ICE and DTCC. The not-rated note now records that status and cites Circle's own announcement in place of the earlier Tempo-launch reference. Arc stays unrated until its public network is live and its behaviour can be observed, and it is tracked for rating at the review after launch.",
  },
  {
    date: "2026-08-18",
    kind: "method",
    title: "A seventh factor: adverse media",
    detail:
      "Every chain now carries an adverse media rating alongside the original six factors. The factor asks what sustained, credible reporting says about the network and the organisations and people behind it, which is a different question from illicit exposure, which measures activity on the chain, and from accountability, which asks whether an operator can be reached. It carries a modest weight, about a tenth of the grade under the balanced profile, chosen so it informs a grade without outweighing the visibility and control factors a screening decision turns on. The visible movements: Tron falls from C to D, because sustained reporting about its founder alongside its existing illicit-exposure rating now trips the model's two-elevated-factors cap; Litecoin, Bitcoin Cash and Unichain each rise from C to B, because they sat at the old grade boundary and a clear seventh factor dilutes their weighted score slightly. The notable ratings under the new factor: Tron and Monero elevated; BNB Chain, TON, World Chain, Hyperliquid, Dash, Zcash, Firo, Secret and Ronin caution, each with its reasoning and, where it rests on a hard fact, a source. The feed's schema version moves to 2.",
    chains: ["tron", "monero", "bnb", "ton", "worldchain", "hyperliquid", "dash", "zcash", "firo", "secret", "ronin", "litecoin", "bitcoincash", "unichain"],
    prompted: "A user of the site pointed out that sustained adverse coverage of a network's founders was reflected nowhere in the grade.",
  },
  {
    date: "2026-08-18",
    kind: "coverage",
    title: "Cronos and Robinhood Chain join the ratings",
    detail:
      "Two additions, both surfaced by this week's evidence refresh, which found Chainalysis publishing transaction monitoring support for Cronos and TRM publishing coverage of Robinhood Chain. Cronos enters at B on the balanced profile: transparent, covered by two of the three majors, with a named operator inside a regulated exchange group, and with the narrowness of its Travel Rule tooling and its single-group concentration as the named gaps. Robinhood Chain, on mainnet since July 2026, also enters at B: unusually strong accountability and issuer-controlled stock tokens from day one, with early analytics coverage, an unmeasured activity record, and the operator's 2022 NYDFS anti-money laundering penalty carried as adverse media. Both entries publish their sources, and the ratings that rest on no track record carry the marker that says so.",
    chains: ["cronos", "robinhood"],
  },
  {
    date: "2026-08-18",
    kind: "site",
    title: "Ethereum replaces Tron as the worked example on the front page",
    detail:
      "The Overview page walks a first-time reader through one real rating, and that example is now Ethereum, the chain most readers already know; the About page's model diagram follows it. Tron remains fully rated and its history is unchanged. The change is presentational: the front page should introduce the framework on a familiar case, with the harder ones a click away in the table.",
    prompted: "The same reader feedback that prompted the adverse media factor.",
  },
  {
    date: "2026-08-18",
    kind: "correction",
    title: "TON entered the Travel Rule registry this site said it did not appear in",
    detail:
      "The Method page and TON's own ratings said TON was one of two chains, with Firo, absent from the Notabene registry entirely. It is not, or is no longer: TON now has its own network entry there with 13 mapped assets, including native Toncoin, and ten of them carry an Elliptic asset identifier. TON's analytics-coverage and Travel Rule rationales are corrected to cite that instead of the absence, and the Method page now names Firo as the only chain rated here still missing from the registry. Neither rating moved: both were already caution, and what is now mapped for TON sits at the same scale as the other chains held at caution on these two factors.",
    chains: ["ton"],
  },
  {
    date: "2026-08-18",
    kind: "correction",
    title: "Three stablecoin supply figures re-read against DefiLlama's live feed",
    detail:
      "Tron, Hyperliquid, BNB Chain and Solana's stablecoin-supply figures were checked against DefiLlama's live circulating-supply data. Tron has moved further from about $90bn and 28% of all stablecoins to about $92bn and 31%, continuing the direction the 14 August correction already found. Hyperliquid moved from about $5.5bn to about $6.2bn, still ahead of Base and Arbitrum, which is the point that stat makes. BNB Chain moved from about $14bn to about $13bn, the first of these four to drift down rather than up. Solana was checked at the same time and still reads about $15bn, unchanged. coinlaw.io, the site's usual citation for these four figures, would not load this week under either a plain fetch or a real browser, so the refreshed figures and their citation now point at DefiLlama's own live feed, the primary data coinlaw compiles from.",
    chains: ["tron", "hyperliquid", "bnb", "solana"],
  },
  {
    date: "2026-08-14",
    kind: "correction",
    title: "Two stablecoin supply figures re-read against the tracker they cite",
    detail:
      "Tron was quoted at about $87bn and roughly 29% of all stablecoins, and Hyperliquid at about $5.9bn. The page both cite has since been updated from DefiLlama and now puts Tron at $89.79bn and 28.48%, and Hyperliquid at $5.51bn. Neither figure was false when it was written and both had started to read high, so they now say about $90bn and roughly 28%, and about $5.5bn. Hyperliquid still holds more stablecoin value than Base or Arbitrum, which is the point that stat is making. Solana at about $15bn and BNB Chain at about $14bn were checked at the same time and both still match.",
    chains: ["tron", "hyperliquid"],
  },
  {
    date: "2026-08-14",
    kind: "correction",
    title: "One of the three analytics providers now publishes what it covers, and this site said otherwise",
    detail:
      "The Method page said no major analytics provider would tell you which chains it covers, and named TRM Labs as publishing no public list. TRM now publishes a browsable index with a page for each chain it covers, 189 of them, against a headline claim of 185 or more. The web archive holds no copy of that section and it was not there on 4 August when the claim here was written, so it is recent, and the panel now says so. The other two are unchanged: Chainalysis names no chains and gives two counts that disagree, 29 on one marketing page and 27 or more on another, and Elliptic's enumerated list of 62 networks went behind a customer login at some point between 10 and 16 June 2026. What survives is the narrower point, which is also the more useful one. None of the three counts carries a date or a version, so a firm cannot show months later which chains its vendor covered on the day a control ran. Found while checking the claim before publishing a piece that leaned on it, which is the only reason it was caught in ten days.",
  },
  {
    date: "2026-08-04",
    kind: "method",
    title: "Analytics coverage and Travel Rule are now sourced per chain, and what could not be sourced is published",
    detail:
      "Ninety-eight of the three hundred and six ratings rested on two pages that mention no chain by name: a Travel Rule glossary and a general comparison of analytics providers. Both are now retired. Going looking for real evidence turned up something worth publishing on its own: no major analytics provider will tell you what it covers. Chainalysis gives counts that disagree with each other and names no chains, TRM publishes nothing beyond a different product's twelve-chain list, and Elliptic moved its list behind a customer login in June 2026. That is on the Method page now, because a firm relying on vendor coverage in a control should know it cannot verify that coverage from public sources. Both dimensions instead cite the Notabene Travel Rule registry, a live map of three hundred networks and more than three thousand four hundred assets that also carries each asset's identifier in other providers' namespaces. Two rated chains, TON and Firo, do not appear in it at all. No rating level changed: the evidence agreed with all fifty-one existing judgements.",
    prompted: "An adversarial review found the two dimensions were citing sources with no chain-level content, so the published share of sourced ratings was more than double the real one.",
  },
  {
    date: "2026-08-03",
    kind: "correction",
    title: "Two dead citations replaced, three stale figures repointed at live trackers",
    detail:
      "Two cited pages had gone: one article returns a server error and the other is no longer served at all. Anything resting on them now cites a source a reader can open. While checking, three value-locked figures turned out to have drifted a long way from what they described: Plasma was quoted at about $2bn and is nearer $0.7bn, Monad at more than $350m and is nearer $0.9bn, and Berachain at about $988m and is nearer $50m. All three were correctly dated, so they were not false, but they read as current. They now point at the live tracker for each chain instead of a dated write-up, so the figure cannot go quietly stale again. A new link checker verifies every citation still resolves.",
    chains: ["tempo", "plasma", "monad", "berachain"],
    prompted: "An adversarial review found four citations it could not open.",
  },
  {
    date: "2026-08-03",
    kind: "correction",
    title: "Tron's accountability rating was stale as well as uncited, and both adverse claims now cite the regulator",
    detail:
      "Two ratings made adverse claims about named companies with no citation at all, which is indefensible here. Checking them found the Tron one was also out of date: it referred to a history of regulatory friction, and the SEC case behind that was resolved in March 2026 with all claims against the founder and both foundations dismissed with prejudice and a $10m penalty against one company on a single wash-trading claim. The rating now says exactly that and cites the SEC's own charge and resolution notices. The BNB Chain rating now cites the Department of Justice case record and the Treasury settlement announcement for the 2023 guilty plea and the $4.3bn paid. Both were caught by opening sources; no check in the build found them.",
    chains: ["tron", "bnb"],
    prompted: "An adversarial review read every page as the rated chain's own counsel would.",
  },
  {
    date: "2026-08-03",
    kind: "correction",
    title: "A figure was cited to a page that does not contain it",
    detail:
      "Tron's illicit rationale claimed roughly 5.3 times more blacklisted addresses than Ethereum and cited a page that says about two to one. The figure itself is right and comes from a different source already in use elsewhere on the site: 3,506 Tron addresses against 657 on Ethereum across 2025. The claim now cites that source and states the counts and the period, with no bare multiple. A correct number pointing at a page where it cannot be found is worse than a wrong one here, because anyone checking it concludes the figure was invented.",
    chains: ["tron"],
    prompted: "An adversarial review opened every cited source and checked it against the claim it supports.",
  },
  {
    date: "2026-08-03",
    kind: "site",
    title: "Risk levels no longer rely on colour alone, and each chain shows its own review date",
    detail:
      "Under Windows High Contrast every risk marker rendered in one colour, which made the rosette and the risk matrix unreadable because colour is the only channel carrying the level in both. The level is now also carried by border weight, so it survives when the palette is replaced. Separately, the machine-readable feed now states the deployment profile that produced its grades, along with the weights, because a grade travelling without its profile can be enforced by a consumer that has no idea it is profile-specific. And each chain now shows when its six factor ratings were last examined, each with its own date; one site-wide date had let entries rated once and never revisited claim the freshness of ones looked at last week.",
  },
  {
    date: "2026-08-02",
    kind: "site",
    title: "The site says who wrote it",
    detail:
      "The About page said 'an independent practitioner' and gave no name, which meant nobody could cite the site in a risk paper: you cannot write 'source: ChainGauge' if you cannot say who made the judgement or what qualifies them. It is now named, with the relevant background and no employer, since this is a personal project and no employer is involved in or has reviewed it. The same section now also says plainly that 'we' is one person and there is no research team, because anyone weighing this as a source should know how much resource sits behind a rating before they rely on it.",
    prompted:
      "A reviewer arriving cold said the anonymous attribution was the one thing that stopped them, and that they could not answer 'who is behind this' if a supervisor asked.",
  },
  {
    date: "2026-08-01",
    kind: "method",
    title: "A grade now says how much of itself rests on evidence, and a comparison says when the gap does not",
    detail:
      "An unsourced clear costs a chain nothing in the score, so a chain nobody has published data about can outrank one where somebody measured a problem and said so. Comparing Stellar, Ethereum and Avalanche for a tokenised fund, Stellar led on a single factor, illicit exposure, and that was the one factor on its page with no source while the two it beat both cited Chainalysis and were rated worse on it. Each chain page now shows what share of its grade rests on factors with a published source, names any factor rated clear without one, and the compare view says outright when the gap between two chains turns on a factor the leader has not evidenced. The score itself is unchanged: mixing how risky a chain is with how well we know it would spoil the one thing the model does well.",
    chains: ["stellar"],
    prompted:
      "A reviewer choosing a settlement rail for a tokenised money market fund found the leader's whole advantage rested on its only unsourced factor, and said it was not a number they could put in a paper.",
  },
  {
    date: "2026-08-01",
    kind: "site",
    title: "The compare view had no way in",
    detail:
      "Compare lost its place in the navigation when the tabs were restructured, on the understanding it would be reached from the ratings table, and the button was never added. It has been reachable only by typing the URL since. There is a Compare button on the ratings toolbar now.",
    prompted: "A reviewer compared three chains by opening three pages by hand and reported the feature as missing, which it effectively was.",
  },
  {
    date: "2026-07-31",
    kind: "method",
    title: "Every chain page now also answers the question you get after the money has moved",
    detail:
      "The site was built for one question, whether to build on a chain, and a relationship manager asking whether a client could be banked whose funds came from Hyperliquid is a different one. Each chain page now closes with the same six factors restated for a source-of-funds enquiry, ordered worst first, so the constraint that limits the enquiry leads. Nothing new is rated: every line is a published factor read for the case where the chain was somebody else's choice. What it will not do is say what to ask a customer for, when to escalate or when to file. Those are regulated judgements that turn on facts this site cannot see.",
    prompted:
      "A reviewer said the whole site was built for deployment decisions and they had to translate the factors into an enhanced due diligence question themselves.",
  },
  {
    date: "2026-07-30",
    kind: "correction",
    title: "Citations now show the host behind the link, and six were relabelled",
    detail:
      "One citation named Chainalysis and linked to a third-party blog. Pasted into a paper, it would have credited the wrong publisher. Every citation on the site now carries the host behind its link, derived from the URL, never read off the title, so the rendered page cannot misattribute even if a title is careless. Six titles were relabelled to say 'via' where they report someone else's work, the worst being an EU AMLR restriction that read as a citation to the Regulation and pointed at a blog explaining it. A build check now fails on any citation that names an organisation the link does not come from, and on anything marked as a primary source that is not on that organisation's own site.",
    prompted:
      "A reviewer writing the settlement-chain section of a customer risk assessment spotted the mismatch and said copying it straight into the paper would have misattributed the source.",
  },
  {
    date: "2026-07-30",
    kind: "site",
    title: "Sourced facts and this site's own judgement no longer look the same",
    detail:
      "Half the factors on a chain page are a judgement with no published source, and they sat at the same visual weight as the sourced ones, so working out what was defensible to a supervisor meant reading every line. Each chain page now states how many of the six factors carry a published source before you read any of them, and an unsourced factor says 'our judgement, no source', dropping the quieter 'assessed'.",
    prompted:
      "The same reviewer said they had to read every line slowly to separate what they could defend from what was this site's opinion.",
  },
  {
    date: "2026-07-29",
    kind: "method",
    title: "A clear rating now says whether it was measured or simply not yet measurable",
    detail:
      "Six factor ratings were Clear because the chain is too new or too small for anyone to have measured that factor, and they rendered identically to a factor with fifteen years of data behind it. Absence of evidence should not read as evidence of absence. Those ratings now carry a hollow marker and the words 'no track record yet', on the chain page, in the rosette, in the risk matrix and in the machine-readable feed as a `basis` field, so an automated consumer can refuse to treat one as the other.",
    chains: ["tempo", "monad", "berachain", "worldchain", "celo", "gnosis"],
    prompted:
      "A reviewer reading the site as an MLRO, asked whether Tempo was fine because Visa backs it, noticed the Clear on illicit exposure meant 'no data yet' only in the small print.",
  },
  {
    date: "2026-07-29",
    kind: "site",
    title: "Navigation links that did nothing on the first click",
    detail:
      "A reviewer cold-loaded the site and found that clicking Method or Contribute did nothing at all: no error, no response. Measured on the live site with the fonts held back, every navigation item moves when the typeface lands, compounding to 24 pixels by the last one, so a click aimed a moment earlier landed in the gap between two buttons. The fonts no longer swap in after the page has drawn. Also fixed from the same review: the risk matrix had no way back to the ratings, and the ratings table header sat over the wrong columns because the header and the rows were separate grids sizing one column independently.",
    prompted: "A reviewer nearly abandoned the site before seeing a single rating, because two navigation links appeared to be dead.",
  },
  {
    date: "2026-07-28",
    kind: "rating",
    title: "Nine rollups moved from clear to caution on asset controls, and every chain now states what remains",
    detail:
      "Fourteen chains were showing a clean sweep of the six factors, and four had no caution anywhere, which reads as a safe chain, when it means no gap found on six questions. Two things changed. The rollups run their controls on contracts the operator can still upgrade, with Base at stage 0 and Arbitrum's security council able to upgrade immediately, so the availability of an on-chain control there is an operator dependency; that is now a caution on asset controls for Base, Arbitrum, OP Mainnet, Linea, zkSync Era, Scroll, Unichain, World Chain and Celo. Separately, every chain now carries a published residual risk, including the one chain still clear on all six, and the scale states that clear means no material gap on that one factor.",
    chains: ["base", "arbitrum", "optimism", "linea", "zksync", "scroll", "unichain", "worldchain", "celo"],
    prompted: "A reviewer pointed out that a clean sweep across all six factors gives a false sense of security.",
  },
  {
    date: "2026-07-28",
    kind: "site",
    title: "Two charts on the ratings page replaced with one",
    detail:
      "The landscape scatter and the score beeswarm plotted the same six factors, and the data cannot carry a scatter: the two axes were each the mean of two three-level factors, giving 25 possible positions of which only 9 were occupied and one held sixteen chains. The clumping is what the force layout was fighting, and it is where the overlapping and clipping came from. One grid replaces both, laid out in HTML so nothing can escape a viewBox, labelled with chain tickers so a reader can find the chain they came for, and marked to show which chains change grade depending on the product.",
    prompted: "A reviewer said the two charts looked bad, told them nothing, and clipped badly.",
  },
  {
    date: "2026-07-28",
    kind: "site",
    title: "The landing page became a tab, and the changelog got its own",
    detail:
      "The landing page sat outside the navigation, so nothing highlighted while you were on it and moving into the ratings read as a jump between two products. It is now the Overview tab. The changelog moved out from under the contribution form onto its own tab, because the proof that submissions get acted on should not be buried beneath the form asking for them.",
    prompted: "A reviewer said the splash page was jarring and did not lead into the rest of the site.",
  },
  {
    date: "2026-07-28",
    kind: "coverage",
    title: "Nine chains added after a coverage review, and three named as not rated by decision",
    detail:
      "The first coverage pass missed rails that carry real settlement volume. Added Tempo, Plasma, Hyperliquid, Unichain, World Chain, Celo, Gnosis Chain, Monad and Berachain. Arc and the announced stablecoin chains are named on the Method page as not rated, with the reason; nothing is quietly absent.",
    chains: [
      "tempo",
      "plasma",
      "hyperliquid",
      "unichain",
      "worldchain",
      "celo",
      "gnosis",
      "monad",
      "berachain",
    ],
  },
  {
    date: "2026-07-28",
    kind: "method",
    title: "Every chain now states where a firm meets it",
    detail:
      "A rating is only useful if it covers the rails people are asked about. Each chain now carries a footprint tier (mainstream, emerging, niche, restricted) with the evidence for it, and the ratings table groups by grade and orders by footprint inside each grade.",
  },
  {
    date: "2026-07-28",
    kind: "method",
    title: "The table groups by grade instead of ranking chains against each other",
    detail:
      "Fourteen chains shared grade A on the balanced profile at the time, since reduced by the rating action above. Sorting them one to fifty-one by score implied a precision the model does not have, so grades are now shown as cohorts, which is how rating scales are normally read.",
  },
  {
    date: "2026-07-28",
    kind: "site",
    title: "Public submissions opened",
    detail:
      "Anyone can now challenge a factor, propose a chain or report a defect without needing an account anywhere. Every submission is read by a person before anything changes, and the outcome lands here.",
  },
];

/** Open items: what has been submitted and is being worked on. Curated, so only
 *  what has been triaged and is safe to publish appears. */
export interface ReviewItem {
  opened: string;
  kind: ActionKind;
  title: string;
  status: "triaging" | "researching" | "change drafted";
  chains?: string[];
}

export const UNDER_REVIEW: ReviewItem[] = [];

export const CHANGELOG_META = {
  /** Stated turnaround, so a submitter knows what to expect. */
  responseTarget: "10 working days",
};
