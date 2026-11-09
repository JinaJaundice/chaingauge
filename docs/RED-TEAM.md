# The red-team pass

A single adversarial review, run once instead of daily, after the week-long
MLRO trial ended on 2 August 2026.

The daily trial worked: five runs, six findings, none of which any build gate or
human pass had caught. But by the end it was converging on the same surfaces,
because it was doing the same kind of thing each time. This is the other half:
one deliberate attempt to break the site, aimed at what the week showed is
actually weak.

## What the week found, and the pattern in it

| Day | Finding | Shape |
|---|---|---|
| 1 | Nav links silently dead on a cold load | Works when settled, fails mid-transition |
| 2 | `Clear` on a four-month-old chain meant "nobody has measured it" | Surface overstates the evidence |
| 3 | A citation named Chainalysis and linked to a blog | Claim and evidence disagree |
| 3 | Unsourced judgement at the same weight as sourced fact | Weak evidence dressed as strong |
| 4 | No answer for "a customer's funds came from here" | Answers a different question than the one asked |
| 5 | A chain's whole lead rested on its only unsourced factor | Absence of evidence pays |

Four of those six are one thesis, and it is the thesis to attack:

> **The confident surface overstates what is underneath it.**

A grade, a green badge and a citation all look equally solid whether they rest on
fifteen years of measured data or on nobody having looked. Each time the trial
found an instance it was fixed by making the difference visible instead of by
changing the judgement. The red team's job is to find where it is still true.

## Attack surfaces, in priority order

**A. Does the cited source actually support the claim?** The largest untested
hole. `source:check` verifies that a citation's title does not misattribute its
publisher. Nothing verifies that the source *says what the rationale claims*.
There are 58 citations (the count `source:check` reports on 8 November 2026) and one reviewer has opened one of them. Open all of them.
A rationale asserting a figure the source does not contain is the most damaging
defect the site can carry, and it would survive every gate in the build.

**A2. Where is an unsourced factor doing the deciding?** The last day of the
trial sharpened this question. It found the leader in a three-way comparison
ahead on a single factor, the only unsourced one on its page. The chains it
beat cited a source and were rated worse. The site now surfaces this, so the
attack is on whether the surfacing is complete: find a comparison, a profile or a
chain page where an unevidenced clear is carrying the result and nothing says so.
Check the exports and the feed as well as the screen.

**B. Profile shopping.** A chain's grade moves with a dropdown. Someone who wants
a chain approved can pick the deployment profile that flatters it and quote the
grade without the profile. Establish whether the grade can be separated from its
profile anywhere it leaves the site: the print view, the JSON and CSV exports, a
copied URL, a screenshot, `/ratings.json`. If a grade can travel without the
profile that produced it, the defect is in the design and not in how it was used.

**C. Read every page as the chain's own counsel.** This is a public site making
risk claims about named companies, and nobody has yet read it from the other
side. Look for anything unsupportable, overstated, or stated as fact where it is
inference: "the preferred rail for illicit stablecoin activity", "no regulated
operator", "a history of regulatory friction". For each, ask whether the cited
source carries the weight of the sentence. Flag anything that would be hard to
defend in a letter, separately from anything merely uncomfortable, since a
watchdog that says nothing uncomfortable is useless.

**D. Staleness.** Every rating carries an `asAt`. Some claims age faster than
others: "four months old", "reached mainnet in March", "pre-mainnet", value-locked
figures, anything about an ongoing regulatory process. Find the claims that have
already moved and the ones that will be wrong within a quarter but read as
permanent.

**E. Attack the submission pipeline properly.** The injection boundary was tested
once, by the person who built it, with one payload. Try harder: a submission
crafted to read as a maintainer note, instructions split across the body and the
source URL, unicode look-alikes and direction marks, an oversized body, a body
that closes its own fence, and the rate limit. The boundary that must hold is
that submitted text is quoted evidence and is never executed as instruction.

**F. Hostile client conditions.** The nav bug appeared only during load, which is
the lesson: the site is tested settled and used unsettled. Cold cache, slow
connection, keyboard only, a screen reader, print to PDF, 320px, reduced motion,
forced colours.

**G. Has the advice boundary drifted?** The site now states source-of-funds
consequences, and it must not cross into telling a firm what to do. There is a
test asserting the generated lines never do. Check the hand-written copy as well:
the Method page, the appetite ladder, the chain deployment notes.

## Rules of engagement

The site is the maintainer's own, so this is authorised. Even so:

- **Do not hammer the endpoint.** The submission tests check payload shape and
  ignore volume. A handful of requests at most. Stop at the first 429 and
  record it as the finding.
- **File nothing spurious.** The public form is a real queue. Use it only for
  findings a maintainer would act on, and no more than three; everything else
  goes in the report.
- **Nothing against GitHub, Vercel or any third party.** The target is the
  published site and its own API. No credential testing, no attempts on the
  hosting, nothing against a chain's own site beyond reading a cited page.
- **Verify before asserting.** A red-team report that cries wolf is worse than
  none. Every finding states what was tried, what happened, and how to reproduce.

## Output

One prioritised report, worst first, in the note back. For each finding: what was
tried, what happened, why it matters, and how to reproduce. Separate **defects**
(the site is wrong or misleading) from **hardening** (it is right but fragile)
from **won't fix** (raised, considered, deliberately left).

Say plainly which of the eight surfaces came up clean. A surface that survived a
real attempt is worth as much as one that did not, and it is the only way to know
the pass was more than a walk-through.
