import { BANDS, DIMENSIONS, LEVELS } from "../content/methodology";
import { CHAINS, FEED_META, NOT_RATED } from "../content/chains";
import type { Relevance } from "../content/types";
import {
  gradeMeta,
  PILLARS,
  PRODUCT_META,
  PRODUCT_WEIGHTS,
  type Grade,
  type ProductProfile,
} from "../lib/model";
import { BAND_LEVEL, RELEVANCE_BLURB, RELEVANCE_LABEL, RISK_VAR } from "../lib/uiTokens";
import { RiskDot, SectionLabel, TierTag } from "../components/primitives";

const GRADES: Grade[] = ["A", "B", "C", "D", "E"];

export function Methodology() {
  return (
    <div className="rise">
      {/* Intro + model summary side by side (fills the width) */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-2 text-[11px] uppercase tracking-widest text-faint">Methodology</div>
          <h1 className="text-xl font-bold tracking-tight text-ink">How the ratings are built</h1>
          <p className="sans mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            Public blockchains are often treated as if they were all equally opaque and equally
            risky. In practice, transparent public ledgers are highly traceable and well covered by
            blockchain analytics, and the real differences between chains are more specific than
            the label suggests. This framework exists to make those differences legible for a
            compliance audience.
          </p>
          <p className="sans mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            Each chain is rated on seven independent factors, with each factor judged as if the
            others were green. A transparent, product-aware model turns those ratings into a 0–100
            score and a letter grade, and every step of the calculation is shown on the chain's
            page.
          </p>
        </div>
        <div className="panel h-fit rounded-md p-4">
          <SectionLabel>The model</SectionLabel>
          <p className="sans mt-2 text-sm text-ink">
            Score = Σ (factor severity × factor weight), capped for critical failures, mapped to a
            grade A–E.
          </p>
          <div className="mt-3 grid grid-cols-5 gap-1">
            {GRADES.map((g) => {
              const m = gradeMeta(g);
              return (
                <div key={g} className="rounded border px-1 py-1.5 text-center" style={{ borderColor: `color-mix(in oklab, ${RISK_VAR[m.level]} 35%, transparent)` }}>
                  <div className="text-sm font-bold" style={{ color: RISK_VAR[m.level] }}>{g}</div>
                  <div className="truncate text-[11px] uppercase text-faint">{m.label}</div>
                </div>
              );
            })}
          </div>
          <p className="sans mt-3 text-[11px] leading-relaxed text-faint">
            0 = lowest financial-crime risk. Weights change with the deployment profile, so a chain's
            grade depends on what you are building.
          </p>
        </div>
      </div>

      {/* The thesis: chain risk as a risk-assessment vector */}
      <div className="mt-10">
        <SectionLabel>Why the chain belongs in your risk assessment</SectionLabel>
        <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="sans max-w-2xl space-y-3 text-sm leading-relaxed text-muted">
            <p>
              A standard customer risk assessment weighs four things: customer risk, product and
              service risk, geographic risk, and delivery-channel risk. Regulators publish guidance in
              exactly those terms, and country risk tables have made the geographic vector routine.
            </p>
            <p>
              Digital-asset products add an input those frameworks do not yet name: the settlement
              infrastructure. Two otherwise identical products carry different financial-crime
              exposure if one settles on a chain you can trace, screen and freeze and the other on a
              chain you cannot. The chain sits outside the product's design and outside geography, so today it falls
              through the assessment.
            </p>
            <p>
              The proposal is to treat the chain the way the assessment already treats a country: an
              inherent risk rating, maintained in a table, that feeds the overall assessment and
              drives the controls. That takes three parts. The <span className="text-ink">risk</span>{" "}
              is the seven factors on this page, scored per chain. The{" "}
              <span className="text-ink">control</span> is a risk appetite expressed against the
              grade, like the illustrative mapping on the right. The{" "}
              <span className="text-ink">implementation</span> is a policy engine consuming the grades
              directly, so the appetite is applied on every transaction rather than remembered from
              a policy document.
            </p>
            <p>
              For the implementation, ChainGauge publishes its ratings as a machine-readable feed at{" "}
              <a href="/ratings.json" target="_blank" rel="noreferrer noopener" className="text-accent hover:underline">
                /ratings.json
              </a>
              : per-chain factor levels plus the reference score, grade and band, regenerated from the
              same data and model as this site on every release.
            </p>
          </div>
          <div className="panel h-fit rounded-md p-4">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-faint">
              Illustrative risk appetite by grade
            </div>
            <ul className="mt-2 space-y-1.5">
              {(
                [
                  ["A", "Standard controls"],
                  ["B", "Standard controls"],
                  ["C", "Enhanced due diligence, tighter limits"],
                  ["D", "Restricted: named approval, low limits"],
                  ["E", "Prohibited"],
                ] as [Grade, string][]
              ).map(([g, note]) => {
                const m = gradeMeta(g);
                return (
                  <li key={g} className="flex items-center gap-2.5 text-xs">
                    <span
                      className="inline-flex size-5 shrink-0 items-center justify-center rounded border font-bold"
                      style={{
                        color: RISK_VAR[m.level],
                        borderColor: `color-mix(in oklab, ${RISK_VAR[m.level]} 40%, transparent)`,
                      }}
                    >
                      {g}
                    </span>
                    <span className="sans text-muted">{note}</span>
                  </li>
                );
              })}
            </ul>
            <p className="sans mt-3 text-[11px] leading-relaxed text-faint">
              An example only: each institution sets its own appetite. The point is that the
              appetite is expressed against the grade and enforced in code.
            </p>
          </div>
        </div>
      </div>

      {/* Two questions */}
      <div className="mt-8">
        <SectionLabel>The two questions this answers</SectionLabel>
        <div className="mt-3 grid gap-2 lg:grid-cols-2">
          <div className="panel rounded-md px-4 py-3">
            <div className="text-sm font-semibold text-ink">Should we build on this chain?</div>
            <p className="sans mt-1.5 text-sm leading-relaxed text-muted">
              The grade, weighted for the product you are deploying. This is what the ratings table
              and the deployment profile are for, and it is the question the site was built around.
            </p>
          </div>
          <div className="panel rounded-md px-4 py-3">
            <div className="text-sm font-semibold text-ink">
              A customer's funds came from this chain. Now what?
            </div>
            <p className="sans mt-1.5 text-sm leading-relaxed text-muted">
              The same seven factors read for a source-of-funds enquiry, at the foot of every chain
              page. The money has already moved and the chain was somebody else's choice, so the
              useful question is what you can and cannot establish about it.
            </p>
          </div>
        </div>
        <p className="sans mt-3 max-w-3xl text-sm leading-relaxed text-faint">
          Neither answer extends to what a firm should then do. Whether to ask a customer for more,
          whether to escalate and whether to file are regulated judgements that turn on facts this
          site cannot see, and they belong to the firm and its MLRO.
        </p>
      </div>

      {/* What we could not source, said out loud. */}
      <div className="mt-8">
        <SectionLabel>What the analytics vendors publish about their coverage</SectionLabel>
        <p className="sans mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          One of the seven factors asks whether the major analytics providers cover a chain. Going
          looking for that evidence turned up a finding about the market itself, and the position has
          already moved once since we first published it.
        </p>
        <div className="mt-3 grid gap-2 lg:grid-cols-3">
          {[
            ["Chainalysis", "No list of chains anywhere on the public site. Two of its own marketing pages give counts that disagree, 29 on one and 27 or more on another, and neither names a chain. The documentation sits behind a customer login."],
            ["TRM Labs", "Publishes a browsable index with a page for every chain it covers, 189 of them as at 14 August 2026, against a headline claim of 185 or more. This entry is a correction: when we looked on 4 August we found no public list and said so here."],
            ["Elliptic", "Listed 62 networks publicly until a date between 10 and 16 June 2026, then moved the list behind a customer login. The last public version survives only in web archive snapshots."],
          ].map(([who, what]) => (
            <div key={who} className="panel rounded-md px-4 py-3">
              <div className="text-sm font-semibold text-ink">{who}</div>
              <p className="sans mt-1 text-[13px] leading-relaxed text-muted">{what}</p>
            </div>
          ))}
        </div>
        <p className="sans mt-3 max-w-3xl text-sm leading-relaxed text-muted">
          So one of the three will now tell you which chains it covers and two will not, and none of
          the counts carries a date or a version. A firm relying on vendor coverage inside a control
          cannot show, months later, which chains that vendor covered on the day the control ran.
          What is public is the{" "}
          <a href="https://api.notabene.id/v1/assets/assets" target="_blank" rel="noreferrer noopener" className="text-accent hover:underline">
            Notabene registry
          </a>
          , a live Travel Rule map of 304 networks and more than 3,600 assets that also carries each
          asset's identifier in other providers' namespaces. Both the analytics-coverage and Travel
          Rule ratings are now sourced from it. TON's mapped assets moved from 13 to 14 since our
          last check. Firo, the other chain rated here, still does not appear in it at all; its only
          near match is a Binance-Peg wrapped version listed under BNB Chain.
        </p>
        <p className="sans mt-2 max-w-3xl text-xs leading-relaxed text-faint">
          One further caution about that registry, found this week by counting its values rather
          than trusting the fill rate alone. Its Chainalysis field is filled in for 98% of assets, so
          it says nothing about what Chainalysis covers and is not used here. Its Elliptic field
          looked more promising at a 74% fill rate, which is why the coverage ratings on this site
          cite the asset counts it gives per chain. A direct count of that field's values found that
          about 99% of the filled ones, checked across chains including Bitcoin, Ethereum, Tron and
          TON, repeat one identical placeholder value rather than naming anything specific to
          Elliptic. It gives no chain-specific signal, so it cannot separate a thinly covered chain
          from a deeply covered one. The per-chain "N Elliptic asset identifiers" figures quoted
          elsewhere on this site should be read as unverified until each one is checked against a
          metric that varies by chain.
        </p>
      </div>

      {/* The scale */}
      <div className="mt-8">
        <SectionLabel>The scale</SectionLabel>
        <div className="panel mt-3 rounded-md px-4 py-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <RiskDot level="clear" basis="no-record" />
            <span className="text-sm font-medium text-ink">A hollow marker means no track record</span>
          </div>
          <p className="sans mt-1.5 max-w-3xl text-sm leading-relaxed text-muted">
            A level records our view of the factor, and a hollow marker records the basis for that
            view: the chain is too new, or too small, for anyone to have measured the factor, so
            the level reflects an absence of evidence rather than a clean measurement. A
            four-month-old chain and a fifteen-year-old chain can both show Clear on illicit
            exposure for different reasons, and the marker is what tells them apart. A solid
            marker means the factor has been measured.
          </p>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {LEVELS.map((l) => (
            <div key={l.id} className="panel rounded-md px-4 py-3">
              <div className="flex items-center gap-2">
                <RiskDot level={l.id} />
                <span className="text-sm font-medium text-ink">{l.label}</span>
                <span className="mono ml-auto text-[11px] tabular-nums text-faint">
                  severity {l.id === "clear" ? 0 : l.id === "caution" ? 50 : 100}
                </span>
              </div>
              <p className="sans mt-1 text-xs text-muted">{l.meaning}</p>
            </div>
          ))}
        </div>
      </div>

      {/* The seven factors, grouped by pillar, 2-col to fill width */}
      <div className="mt-8">
        <SectionLabel>The seven factors, grouped</SectionLabel>
        <div className="mt-3 grid gap-2 lg:grid-cols-2">
          {DIMENSIONS.map((d, i) => {
            const pillar = PILLARS.find((p) => p.factors.includes(d.id));
            return (
              <div key={d.id} className="panel rounded-md px-4 py-4">
                <div className="flex items-baseline gap-2">
                  <span className="mono text-xs font-semibold tabular-nums text-faint">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-semibold text-ink">{d.label}</h3>
                  <span className="ml-auto rounded border px-1.5 py-0.5 text-[11px] uppercase tracking-wide text-faint">
                    {pillar?.label}
                  </span>
                </div>
                <p className="sans mt-1 text-sm text-muted">{d.question}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded border px-3 py-2" style={{ borderColor: `color-mix(in oklab, ${RISK_VAR.clear} 35%, transparent)` }}>
                    <div className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: RISK_VAR.clear }}>Clear</div>
                    <p className="sans mt-0.5 text-xs text-muted">{d.clear}</p>
                  </div>
                  <div className="rounded border px-3 py-2" style={{ borderColor: `color-mix(in oklab, ${RISK_VAR.elevated} 35%, transparent)` }}>
                    <div className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: RISK_VAR.elevated }}>Elevated</div>
                    <p className="sans mt-0.5 text-xs text-muted">{d.elevated}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Product weighting table */}
      <div className="mt-8">
        <SectionLabel>Weighting by product</SectionLabel>
        <p className="sans mt-2 max-w-2xl text-sm text-muted">
          The weights change with what you are deploying, because different products lean on different
          factors. A stablecoin payment product cares about asset controls and illicit exposure; a
          custody product cares most about traceability and coverage. A customer overlay (retail or
          institutional) tilts the weights further.
        </p>
        <div className="panel mt-3 overflow-x-auto rounded-md">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b text-[11px] font-semibold uppercase tracking-widest text-faint">
                <th className="px-4 py-2.5 text-left">Product</th>
                {DIMENSIONS.map((d) => (
                  <th key={d.id} className="px-2 py-2.5 text-center">
                    <span className="mx-auto block max-w-[128px] leading-tight">{d.label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(Object.keys(PRODUCT_WEIGHTS) as ProductProfile[]).map((p, i) => (
                <tr key={p} className={i > 0 ? "border-t" : undefined}>
                  <td className="px-4 py-2 font-medium text-ink">{PRODUCT_META[p].label}</td>
                  {DIMENSIONS.map((d) => {
                    const w = PRODUCT_WEIGHTS[p][d.id];
                    const max = Math.max(...DIMENSIONS.map((x) => PRODUCT_WEIGHTS[p][x.id]));
                    return (
                      <td key={d.id} className="mono px-2 py-2 text-center tabular-nums" style={{ color: w >= max ? "var(--accent)" : "var(--muted)" }}>
                        {(w * 100).toFixed(0)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="sans mt-2 text-[11px] text-faint">Figures are the base weight (%) before the customer overlay and renormalisation.</p>
      </div>

      {/* Caps + grades side by side */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <SectionLabel>Hard caps</SectionLabel>
          <p className="sans mt-2 text-sm text-muted">
            A weighting must never hide a critical failure, so two caps override the weighted score:
          </p>
          <ul className="sans mt-3 space-y-2 text-sm text-muted">
            <li className="panel rounded-md px-3 py-2">
              <span className="font-medium text-ink">Visibility failure. </span>
              If traceability or analytics coverage is Elevated, the chain cannot be seen or screened,
              and the score is floored into grade E regardless of weights.
            </li>
            <li className="panel rounded-md px-3 py-2">
              <span className="font-medium text-ink">Compounding. </span>
              Two or more Elevated factors floor the score into at least grade D.
            </li>
          </ul>
        </div>
        <div>
          <SectionLabel>The grade and the band</SectionLabel>
          <p className="sans mt-2 text-sm text-muted">
            The score maps to a letter grade, and grades roll up into the plain-English band used for
            scanning.
          </p>
          <div className="mt-3 space-y-2">
            {BANDS.map((b) => (
              <div key={b.id} className="panel rounded-md px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <RiskDot level={BAND_LEVEL[b.id]} />
                  <h3 className="text-sm font-semibold text-ink">{b.label}</h3>
                  <span className="ml-auto text-[11px] text-faint">
                    {b.id === "established" ? "grades A–B" : b.id === "conditional" ? "grades C–D" : "grade E"}
                  </span>
                </div>
                <p className="sans mt-1 text-xs text-muted">{b.verdict}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coverage: which chains are in, which are not, and why. A rating scale
          is only credible if the bar for entry is stated. */}
      <div className="mt-8">
        <SectionLabel>What we cover, and what we leave out</SectionLabel>
        <p className="sans mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          A rating is only useful if it covers the rails people are asked about, so every
          chain carries a footprint tier alongside its grade. The tier says how likely a regulated
          firm is to meet the chain. It carries no risk signal, and it is kept off the risk palette on purpose: a restricted chain is highly relevant precisely because you are excluding it.
        </p>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {(Object.keys(RELEVANCE_LABEL) as Relevance[]).map((tier) => (
            <div key={tier} className="panel rounded-md px-4 py-3">
              <div className="mb-1 flex items-center gap-2">
                <TierTag tier={tier} />
                <span className="mono text-[11px] tabular-nums text-faint">
                  {CHAINS.filter((c) => c.exposure.tier === tier).length} chains
                </span>
              </div>
              <p className="sans text-sm leading-relaxed text-muted">{RELEVANCE_BLURB[tier]}</p>
            </div>
          ))}
        </div>

        <h3 className="mt-6 text-sm font-semibold text-ink">Not rated, and why</h3>
        <p className="sans mt-1 max-w-3xl text-sm leading-relaxed text-muted">
          Two bars decide what gets a grade. It has to be a public chain, so permissioned networks are outside the scope of this site, and never badly rated by it, and their own operators
          govern what happens on them. It also has to be on mainnet, because a rating needs
          observable behaviour, and a specification supplies none. Anything held back by the second bar is
          named here, so a gap reads as a decision instead of an oversight.
        </p>
        <div className="mt-3 space-y-2">
          {NOT_RATED.map((n) => (
            <div key={n.name} className="panel rounded-md px-4 py-3">
              <div className="text-sm font-semibold text-ink">{n.name}</div>
              <p className="sans mt-1 text-sm leading-relaxed text-muted">{n.reason}</p>
              {n.sources.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  {n.sources.map((s) => (
                    <a
                      key={s.name}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-[11px] text-faint underline decoration-dotted underline-offset-2 transition-colors hover:text-ink"
                    >
                      {s.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <h3 className="mt-6 text-sm font-semibold text-ink">Why there is no ranking</h3>
        <p className="sans mt-1 max-w-3xl text-sm leading-relaxed text-muted">
          Seven factors on a three-level scale cannot separate chains that rate the same on all seven,
          and several chains share a grade on the balanced profile. Sorting those into a strict
          order would invent a precision the model does not have, so chains are shown in grade
          cohorts and ordered within a cohort by footprint. A scale of this kind will produce
          ties, and that is expected.
        </p>
      </div>

      {/* Scope */}
      <div className="mt-8">
        <SectionLabel>Scope and limitations</SectionLabel>
        <div className="mt-3 grid gap-2 lg:grid-cols-2">
          {[
            ["Public chains only.", "Mainnets, layer 2s and payment ledgers. Permissioned networks are a different question and are out of scope here."],
            ["Curated, on a dated review cycle.", "Ratings are an assessed view of public information, reviewed and dated, in the spirit of L2BEAT's hand-reviewed risk cells, with no automated scoring."],
            ["Sourced where it is a hard fact.", "Analytics coverage, sanctions, illicit data, freeze precedents and native controls carry a source. Judgement calls are labelled \"Our judgement, no source\"."],
            ["A starting point only.", "This informs enhanced due diligence on a settlement network. It should not be relied on as legal, regulatory or investment advice, and it does not replace transaction-level screening."],
          ].map(([h, body]) => (
            <div key={h} className="panel rounded-md px-4 py-3">
              <span className="sans text-sm font-medium text-ink">{h} </span>
              <span className="sans text-sm text-muted">{body}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-faint">Framework and ratings as at {FEED_META.asAt}.</p>
      </div>
    </div>
  );
}
