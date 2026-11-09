import { useMemo } from "react";
import { ArrowRight, GitPullRequestArrow, ListFilter, Sigma } from "lucide-react";
import { CHAINS, FEED_META } from "../content/chains";
import { DIMENSIONS } from "../content/methodology";
import { DEFAULT_PROFILE, gradeMeta, scoreChain, type Grade } from "../lib/model";
import type { RoutePage } from "../lib/router";
import { GradeChip, Monogram, SectionLabel, TierTag } from "../components/primitives";
import { RiskRosette } from "../components/RiskRosette";
import { RISK_VAR, textStyle } from "../lib/uiTokens";
import { openSearch } from "../components/TopNav";

// ---------------------------------------------------------------
// The landing page. Its only job is that a compliance professional who has
// never seen this before knows, inside one screen, what it is, whether it is
// for them, and what to do next.
//
// It is not a marketing page: the worked example below is the real model
// running on real ratings, not a picture of one.
// ---------------------------------------------------------------

const GRADE_ORDER: Grade[] = ["A", "B", "C", "D", "E"];

/** The chain the worked example uses. Ethereum, because a first-time reader
 *  should meet the framework on the chain they already know, with the harder
 *  cases one click away in the table. (It was Tron until 18 August 2026;
 *  Sooraj asked for a simpler, more familiar example on the front page.) */
const EXAMPLE_ID = "ethereum";

function Step({
  n,
  icon: Icon,
  title,
  body,
  action,
  onClick,
}: {
  n: string;
  icon: typeof Sigma;
  title: string;
  body: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="panel group flex h-full flex-col rounded-md p-4 text-left transition-colors hover:bg-[var(--panel-2)]"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="mono text-[11px] tabular-nums tracking-widest text-faint">{n}</span>
        <Icon className="size-4" style={{ color: "var(--accent)" }} />
      </div>
      <div className="text-sm font-semibold text-ink">{title}</div>
      <p className="sans mt-1.5 flex-1 text-[13px] leading-relaxed text-muted">{body}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-faint transition-colors group-hover:text-ink">
        {action}
        <ArrowRight className="size-3" />
      </span>
    </button>
  );
}

export function Overview({ setPage, onSelect }: { setPage: (p: RoutePage) => void; onSelect: (id: string) => void }) {
  const { spread, example, exampleScore, mainstream } = useMemo(() => {
    const counts = Object.fromEntries(GRADE_ORDER.map((g) => [g, 0])) as Record<Grade, number>;
    for (const c of CHAINS) counts[scoreChain(c, DEFAULT_PROFILE).grade] += 1;
    const ex = CHAINS.find((c) => c.id === EXAMPLE_ID) ?? CHAINS[0];
    return {
      spread: counts,
      example: ex,
      exampleScore: scoreChain(ex, DEFAULT_PROFILE),
      mainstream: CHAINS.filter((c) => c.exposure.tier === "mainstream").length,
    };
  }, []);

  const worst = DIMENSIONS.reduce((a, d) => {
    const rank = { clear: 0, caution: 1, elevated: 2 };
    return rank[example.ratings[d.id].level] > rank[example.ratings[a.id].level] ? d : a;
  }, DIMENSIONS[0]);

  return (
    <div className="rise">
      {/* ---- What this is ----------------------------------------------------
          Two columns on a wide screen: the claim on the left, the distribution
          on the right. The right column is there because the page should carry
          a fact in the first screen, not because the space needed filling. */}
      <section className="grid items-start gap-8 border-b pb-8 lg:grid-cols-[1.35fr_1fr]">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-widest text-faint">
            <span className="pulse size-1.5 rounded-full" style={{ background: "var(--clear)" }} aria-hidden />
            Independent · {FEED_META.chainCount} chains · reviewed {FEED_META.asAt}
          </div>
          <h1 className="text-[26px] font-bold leading-[1.15] tracking-tight text-ink sm:text-[34px]">
            Financial-crime ratings for public blockchains.
          </h1>
          <p className="sans mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
            ChainGauge rates each public blockchain on seven financial crime factors and combines
            them into a single grade, weighted for the product being deployed. It is built so that
            a compliance team can assess a chain before a product team commits to it, and show the
            reasoning afterwards.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setPage("chains")}
              className="inline-flex items-center gap-2 rounded px-3.5 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--accent-ink)]"
              style={{ background: "var(--accent)" }}
            >
              See the ratings
              <ArrowRight className="size-3.5" />
            </button>
            <button
              onClick={openSearch}
              className="inline-flex items-center gap-2 rounded border px-3.5 py-2 text-xs font-medium uppercase tracking-wide text-muted transition-colors hover:text-ink"
            >
              Look up one chain
              <kbd className="rounded border px-1 text-[11px] text-faint">/</kbd>
            </button>
          </div>
        </div>

        {/* The spread as a bar per grade, sized by how many chains sit in it.
            Clicking one opens the ratings. */}
        <div className="panel rounded-md p-4">
          <div className="flex items-baseline justify-between">
            <SectionLabel>The spread</SectionLabel>
            <span className="text-[11px] tracking-wide text-faint">balanced profile</span>
          </div>
          <ul className="mt-3 space-y-1.5">
            {GRADE_ORDER.map((g) => {
              const meta = gradeMeta(g);
              const share = (spread[g] / FEED_META.chainCount) * 100;
              return (
                <li key={g}>
                  <button
                    onClick={() => setPage("chains")}
                    className="group flex w-full items-center gap-3"
                    title={`${spread[g]} chains graded ${g} (${meta.label})`}
                  >
                    <span
                      className="w-3 shrink-0 text-left text-xs font-bold"
                      style={textStyle(meta.level)}
                    >
                      {g}
                    </span>
                    <span className="w-16 shrink-0 text-left text-[11px] uppercase tracking-wide text-faint">
                      {meta.label}
                    </span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: "var(--line)" }}>
                      <span
                        className="block h-full rounded-full transition-[width]"
                        style={{ width: `${Math.max(share, 2)}%`, background: RISK_VAR[meta.level] }}
                      />
                    </span>
                    <span className="mono w-5 shrink-0 text-right text-xs tabular-nums text-muted">
                      {spread[g]}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="sans mt-3 border-t pt-3 text-xs leading-relaxed text-faint">
            Change the deployment profile and this distribution moves, because a chain that is
            suitable for custody may not be suitable for payments.
          </p>
        </div>
      </section>

      {/* ---- Who it is for --------------------------------------------------- */}
      <section className="border-b py-8">
        <SectionLabel className="mb-4">Who this is for</SectionLabel>
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="text-sm font-semibold text-ink">You are asked to approve a chain</div>
            <p className="sans mt-1.5 text-[13px] leading-relaxed text-muted">
              A product team wants to settle on a new chain, and you need a defensible view of
              whether activity on it can be traced, screened and acted on, with sources you can
              put in a paper.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold text-ink">You are writing the risk assessment</div>
            <p className="sans mt-1.5 text-[13px] leading-relaxed text-muted">
              A standard assessment considers the customer, product, geography and delivery
              channel. A digital asset product adds the settlement network as a further area, and
              it needs the same treatment.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold text-ink">You are setting a policy threshold</div>
            <p className="sans mt-1.5 text-[13px] leading-relaxed text-muted">
              The grades are published as a machine-readable feed, so a risk appetite statement
              can refer to a grade instead of maintaining a list of chains that goes stale.
            </p>
          </div>
        </div>
      </section>

      {/* ---- A worked example ------------------------------------------------ */}
      <section className="border-b py-8">
        <SectionLabel className="mb-1">What a rating looks like</SectionLabel>
        <p className="sans mb-4 max-w-2xl text-[13px] leading-relaxed text-muted">
          This is the real entry for {example.name}, drawn from the live data behind the site.
          Every factor carries a rationale and, where it is a hard fact, a source you can open.
        </p>

        <button
          onClick={() => onSelect(example.id)}
          className="panel block w-full rounded-md p-4 text-left transition-colors hover:bg-[var(--panel-2)] sm:p-5"
        >
          <div className="flex flex-wrap items-center gap-3">
            <Monogram ticker={example.ticker} chainId={example.id} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-semibold text-ink">{example.name}</span>
                <TierTag tier={example.exposure.tier} />
              </div>
              <p className="sans mt-1 text-[13px] leading-relaxed text-muted">
                {example.exposure.where}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <RiskRosette chain={example} size={48} />
              <div className="text-right">
                <GradeChip grade={exampleScore.grade} size="lg" />
                <div className="mt-1 text-[11px] uppercase tracking-wide text-faint">
                  {gradeMeta(exampleScore.grade).label}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-x-6 gap-y-2 border-t pt-4 sm:grid-cols-2 lg:grid-cols-3">
            {DIMENSIONS.map((d) => {
              const r = example.ratings[d.id];
              return (
                <div key={d.id} className="flex items-baseline justify-between gap-3">
                  <span className="sans truncate text-[13px] text-muted">{d.label}</span>
                  <span
                    className="text-[11px] font-medium uppercase tracking-wide"
                    style={textStyle(r.level)}
                  >
                    {r.level}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="sans mt-4 border-t pt-3 text-[13px] leading-relaxed text-muted">
            <span className="font-medium text-ink">Weakest factor:</span> {worst.label.toLowerCase()}.{" "}
            {example.ratings[worst.id].rationale}
          </p>
        </button>
      </section>

      {/* ---- Where to go next ------------------------------------------------ */}
      <section className="py-8">
        <SectionLabel className="mb-4">Three things you can do with it</SectionLabel>
        <div className="grid gap-3 md:grid-cols-3">
          <Step
            n="01"
            icon={ListFilter}
            title="Screen a chain before you approve it"
            body={`Set the deployment profile to the product you are building, then read the grade and the seven factors underneath it. ${mainstream} of the ${FEED_META.chainCount} chains are ones a regulated firm is likely to face today.`}
            action="Open the ratings"
            onClick={() => setPage("chains")}
          />
          <Step
            n="02"
            icon={Sigma}
            title="Check the working before you rely on it"
            body="Each grade is calculated from the seven factor levels and a published set of weights, with two hard caps. The Method page sets out the weights, the caps and what has been left unrated, with the reason."
            action="Read the method"
            onClick={() => setPage("method")}
          />
          <Step
            n="03"
            icon={GitPullRequestArrow}
            title="Tell us where we are wrong"
            body="The ratings are open to challenge, because they will need correction as the evidence changes. Dispute a factor with a source, propose a chain that is missing, or report something broken on the site. Every change is published with a date and a reason."
            action="Challenge a rating"
            onClick={() => setPage("contribute")}
          />
        </div>

        <p className="sans mt-6 max-w-3xl text-xs leading-relaxed text-faint">
          Independent and not affiliated with any chain, analytics provider or vendor. The ratings
          are curated, dated judgements built from public sources, in the spirit of a hand-reviewed
          risk register, with no automated scoring. They are a starting point for enhanced due
          diligence and should not be relied on as legal, compliance or investment advice.
        </p>
      </section>
    </div>
  );
}
