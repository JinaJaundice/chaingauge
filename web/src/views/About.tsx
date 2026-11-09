import { ArrowRight } from "lucide-react";
import { FEED_META, CHAINS } from "../content/chains";
import { GradeChip, SectionLabel } from "../components/primitives";
import { gradeMeta, type Grade } from "../lib/model";
import { RISK_VAR } from "../lib/uiTokens";
import type { RoutePage } from "../lib/router";

export function About({ setPage }: { setPage: (p: RoutePage) => void }) {
  return (
    <div className="rise">
      <div className="mb-2 text-[11px] uppercase tracking-widest text-faint">About</div>
      <h1 className="text-xl font-bold tracking-tight text-ink">What ChainGauge is</h1>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main column */}
        <div className="space-y-8">
          <p className="sans max-w-2xl text-sm leading-relaxed text-muted">
            ChainGauge rates public blockchains for financial crime risk, so that a compliance team
            can tell which chain is suitable to build on, and where the gaps are, before a product
            team commits to one. It exists because public blockchains are often treated as a
            single, opaque category that a bank cannot track. In practice, transparent public
            ledgers are highly traceable and well covered by blockchain analytics, and the real
            variation between chains is more specific than the label suggests.
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            <section>
              <SectionLabel>How it works</SectionLabel>
              <p className="sans mt-2 text-sm leading-relaxed text-muted">
                Every chain is rated across seven independent factors, and a transparent
                model turns those into a 0–100 score and a letter grade. The weights change with what
                you are deploying, so the ratings are product-aware rather than one-size-fits-all.{" "}
                <button onClick={() => setPage("method")} className="text-accent hover:underline">
                  See the full methodology
                </button>
                .
              </p>
            </section>
            <section>
              <SectionLabel>Nobody pays to be listed</SectionLabel>
              <p className="sans mt-2 text-sm leading-relaxed text-muted">
                No chain pays to be listed or rated. The ratings are an assessed view of public
                information, reviewed and dated, in the spirit of L2BEAT's approach to L2 security. The
                reasoning and sources are published in full so the ratings can be argued with rather
                than taken on trust.
              </p>
            </section>
            <section>
              <SectionLabel>Who is behind it</SectionLabel>
              {/* Named, because it was not before and a reviewer said that was
                  the one thing stopping them citing the site in a risk paper.
                  You cannot write "source: ChainGauge" if you cannot say who
                  made the judgement or what qualifies them. */}
              <p className="sans mt-2 text-sm leading-relaxed text-muted">
                Built and maintained by <span className="text-ink">Sooraj Muhammed</span>. I have
                worked in financial crime and digital assets since 2020, now in consulting. Before
                that I was a senior policy adviser on cryptoassets at the Financial Conduct
                Authority, where I led the operational and cyber resilience policy work and took
                CP25/25 to publication. The ratings here are written by someone who has argued these
                questions from the supervisor's side of the table and from the firm's.
              </p>
              <p className="sans mt-2 text-sm leading-relaxed text-muted">
                This is a personal project. No employer is involved in it, none has reviewed it, and
                nothing here is the view of any organisation. It is not affiliated with any chain,
                analytics provider or vendor, and nobody pays to be listed or rated.
              </p>
              <p className="sans mt-2 text-sm leading-relaxed text-muted">
                One more thing worth knowing if you are weighing this as a source: the site says
                "we", and "we" is one person. There is no research team behind these ratings. That is
                the reason the method, the weights and every source are published, and the reason
                the form for arguing with them is the most important page here.
              </p>
            </section>
            <section>
              <SectionLabel>Telling us we are wrong</SectionLabel>
              <p className="sans mt-2 text-sm leading-relaxed text-muted">
                Some of these ratings will be wrong, and the transparency exists so they can be
                corrected. Challenge a factor with a source, propose a chain that is missing, or
                report a defect. No account needed anywhere, and every change is published with its
                date and its reason.{" "}
                <button onClick={() => setPage("contribute")} className="text-accent hover:underline">
                  Contribute
                </button>
                .
              </p>
            </section>
          </div>

          <section>
            <SectionLabel>Scope and limitations</SectionLabel>
            <ul className="sans mt-3 grid gap-2 text-sm leading-relaxed text-muted lg:grid-cols-3">
              <li className="panel rounded-md px-3 py-2">Public chains only: mainnets, layer 2s and payment ledgers. Permissioned networks are out of scope.</li>
              <li className="panel rounded-md px-3 py-2">A curated, dated view, refreshed by review. It rates chains as wholes, with no wallet
              or transaction ratings.</li>
              <li className="panel rounded-md px-3 py-2">A starting point for enhanced due diligence, which should not be relied on as legal,
              regulatory or investment advice.</li>
            </ul>
          </section>
        </div>

        {/* Side rail */}
        <aside className="space-y-4">
          <div className="panel rounded-md p-4">
            <SectionLabel>At a glance</SectionLabel>
            <dl className="mt-3 space-y-2.5">
              <Stat k="Chains rated" v={String(FEED_META.chainCount)} />
              <Stat k="Factors per chain" v="6" />
              <Stat k="Deployment profiles" v="6 × 3" />
              <Stat k="Grades" v="A – E" />
              <Stat k="Assessed" v={FEED_META.asAt} />
            </dl>
          </div>
          <div className="panel rounded-md p-4">
            <SectionLabel>What it is not</SectionLabel>
            <ul className="sans mt-2 space-y-1.5 text-xs text-muted">
              <li>Not transaction screening (that is Chainalysis / TRM / Elliptic).</li>
              <li>Not a wallet risk score.</li>
              <li>Not investment or legal advice.</li>
            </ul>
          </div>
          <button
            onClick={() => setPage("chains")}
            className="w-full rounded-md border px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-ink transition-colors hover:bg-[var(--panel-2)]"
          >
            Browse the {CHAINS.length} chains →
          </button>
        </aside>
      </div>

      {/* How a firm wires the ratings into its own controls — the abridged
          risk → control → implementation journey, with diagrams. */}
      <section className="mt-12">
        <SectionLabel>Using these ratings in a policy engine</SectionLabel>
        <p className="sans mt-3 max-w-3xl text-sm leading-relaxed text-muted">
          The ratings are built to be consumed as data as well as read. A firm that wants settlement-chain
          risk inside its controls can wire it in the same way a country risk table drives payment
          screening: rate the chains, decide an appetite, and enforce it in code.
        </p>

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {/* Step 1 — rate */}
          <div className="panel rounded-md p-4">
            <div className="flex items-baseline gap-2">
              <span className="mono text-xs font-semibold tabular-nums text-faint">01</span>
              <h3 className="text-sm font-semibold text-ink">Rate the chains</h3>
            </div>
            <p className="sans mt-1.5 text-xs leading-relaxed text-muted">
              Read each chain's grade under the profile that matches your product, on this site or
              from the feed. The seven factor levels are published raw, so you can apply your own
              weighting instead of ours.
            </p>
            <RateDiagram />
          </div>

          {/* Step 2 — decide */}
          <div className="panel rounded-md p-4">
            <div className="flex items-baseline gap-2">
              <span className="mono text-xs font-semibold tabular-nums text-faint">02</span>
              <h3 className="text-sm font-semibold text-ink">Decide the appetite</h3>
            </div>
            <p className="sans mt-1.5 text-xs leading-relaxed text-muted">
              Write a risk appetite against the grades into the policy standard: what settles, what
              needs enhanced due diligence and above what amount, what is held for review, and what
              is blocked.
            </p>
            <AppetiteLadder />
          </div>

          {/* Step 3 — enforce */}
          <div className="panel rounded-md p-4">
            <div className="flex items-baseline gap-2">
              <span className="mono text-xs font-semibold tabular-nums text-faint">03</span>
              <h3 className="text-sm font-semibold text-ink">Enforce it in code</h3>
            </div>
            <p className="sans mt-1.5 text-xs leading-relaxed text-muted">
              Point the policy engine at the feed and evaluate every transfer at settlement time.
              The appetite executes in code, and tuning it reshapes outcomes immediately rather
              than waiting for the next policy refresh.
            </p>
            <EnforceDiagram />
          </div>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1fr]">
          <div className="panel rounded-md p-4">
            <div className="text-[11px] uppercase tracking-widest text-faint">The feed</div>
            <pre className="mono mt-2 overflow-x-auto text-[11px] leading-relaxed text-muted">
{`GET /ratings.json

{
 "asAt": "${FEED_META.asAt}",
 "chains": [{
   "id": "ethereum",
   "factors": {
     "illicit": { "level": "caution", ... },
     ...
   },
   "balanced": { "score": 8, "grade": "A",
                 "band": "established" }
 }, ...]
}`}
            </pre>
          </div>
          <div className="panel rounded-md p-4">
            <div className="text-[11px] uppercase tracking-widest text-faint">If you wire it in</div>
            <p className="sans mt-2 text-xs leading-relaxed text-muted">
              Three things are worth getting right. Cache the feed and fall back to your last good
              copy, so an outage here cannot stop your settlement. Version the appetite itself, not
              just the grades, so a change to what grade D means is reviewable after the fact. And
              treat private or permissioned rails as out of scope, a different state from unrated: nothing here
              applies to them, and the venue's own controls govern instead.
            </p>
            <p className="sans mt-2 text-xs leading-relaxed text-faint">
              The feed regenerates from the same data and model as this site on every release, so a
              consumer inherits rating revisions without a schema change. Factor levels are
              published raw for firms that prefer their own weighting.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// ---- the three little diagrams (theme-adaptive, mono-labelled) --------------

function RateDiagram() {
  // Seven factor levels (Ethereum's real ones) funnel through profile weights
  // into a grade. Ethereum replaced Tron here on 18 Aug 2026, the same day the
  // adverse media factor arrived: the front-of-site examples now use the chain
  // a first-time reader already knows.
  const dots: ("clear" | "caution" | "elevated")[] = [
    "clear", "clear", "caution", "clear", "clear", "clear", "clear",
  ];
  return (
    <svg viewBox="0 0 260 96" className="mt-3 w-full" role="img" aria-label="Seven factor levels weighted into a grade">
      {dots.map((lvl, i) => (
        <circle
          key={i}
          cx={18 + (i % 2) * 18}
          cy={18 + Math.floor(i / 2) * 14}
          r={5.5}
          fill={RISK_VAR[lvl]}
        />
      ))}
      <text x={26} y={86} textAnchor="middle" fontSize={8} fill="var(--faint)">7 factors</text>
      <path d="M 52 42 h 22" stroke="var(--faint)" strokeWidth={1.2} markerEnd="url(#rd-arr)" />
      <rect x={80} y={24} width={92} height={38} rx={4} fill="var(--panel-2)" stroke="var(--line)" />
      <text x={126} y={40} textAnchor="middle" fontSize={9} fontWeight={600} fill="var(--ink)">× profile weights</text>
      <text x={126} y={53} textAnchor="middle" fontSize={8} fill="var(--faint)">e.g. payments · retail</text>
      <path d="M 176 42 h 22" stroke="var(--faint)" strokeWidth={1.2} markerEnd="url(#rd-arr)" />
      <rect x={204} y={22} width={42} height={42} rx={5} fill="none" stroke={RISK_VAR.clear} />
      <text x={225} y={47} textAnchor="middle" fontSize={17} fontWeight={700} fill={RISK_VAR.clear}>A</text>
      <text x={225} y={80} textAnchor="middle" fontSize={8} fill="var(--faint)">Strong · 8/100</text>
      <defs>
        <marker id="rd-arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--faint)" />
        </marker>
      </defs>
    </svg>
  );
}

function AppetiteLadder() {
  // An illustrative appetite: each grade mapped to a plain-word treatment.
  const rows: { grade: Grade; note: string; level: "clear" | "caution" | "elevated" }[] = [
    { grade: "A", note: "settles, standard controls", level: "clear" },
    { grade: "B", note: "settles, standard controls", level: "clear" },
    { grade: "C", note: "EDD above £250k", level: "caution" },
    { grade: "D", note: "held for review", level: "caution" },
    { grade: "E", note: "blocked", level: "elevated" },
  ];
  return (
    <div className="mt-3 space-y-1.5">
      {rows.map((r) => (
        <div key={r.grade} className="flex items-center gap-2">
          <GradeChip grade={r.grade} size="sm" />
          <span className="w-14 shrink-0 text-[11px] uppercase tracking-wide text-faint">
            {gradeMeta(r.grade).label}
          </span>
          <ArrowRight className="size-3 shrink-0 text-faint" />
          <span className="sans text-xs" style={{ color: RISK_VAR[r.level] }}>
            {r.note}
          </span>
        </div>
      ))}
      <p className="sans pt-1 text-[11px] leading-relaxed text-faint">
        An example only: each firm sets its own appetite.
      </p>
    </div>
  );
}

function EnforceDiagram() {
  // The response surface, abridged: grade columns over an amount axis, a cap
  // line and a transfer needle — outcomes decided per transfer in code.
  const W = 260;
  const H = 118;
  const pad = { t: 10, b: 26, l: 30, r: 10 };
  const ih = H - pad.t - pad.b;
  const iw = W - pad.l - pad.r;
  const slot = iw / 5;
  const barW = slot - 12;
  const capY = pad.t + ih * 0.42;
  const eddY = pad.t + ih * 0.58;
  const needleY = pad.t + ih * 0.68;
  // Segments mirror the real composition: above the per-transfer cap everything
  // is at least review; Watch (C) chains flip earlier at the EDD threshold.
  const bottom = pad.t + ih;
  const cols: { g: Grade; segs: { y0: number; y1: number; fill: string; op: number }[] }[] = [
    { g: "A", segs: [{ y0: capY, y1: bottom, fill: RISK_VAR.clear, op: 0.3 }, { y0: pad.t, y1: capY, fill: RISK_VAR.caution, op: 0.7 }] },
    { g: "B", segs: [{ y0: capY, y1: bottom, fill: RISK_VAR.clear, op: 0.3 }, { y0: pad.t, y1: capY, fill: RISK_VAR.caution, op: 0.7 }] },
    { g: "C", segs: [{ y0: eddY, y1: bottom, fill: RISK_VAR.clear, op: 0.3 }, { y0: pad.t, y1: eddY, fill: RISK_VAR.caution, op: 0.7 }] },
    { g: "D", segs: [{ y0: pad.t, y1: bottom, fill: RISK_VAR.caution, op: 0.7 }] },
    { g: "E", segs: [{ y0: pad.t, y1: bottom, fill: RISK_VAR.elevated, op: 0.7 }] },
  ];
  const cX = pad.l + 2 * slot + (slot - barW) / 2; // the C column, for the EDD marker
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" role="img" aria-label="Grade columns over an amount axis with thresholds and a transfer needle">
      <text x={-(pad.t + ih / 2)} y={9} transform="rotate(-90)" textAnchor="middle" fontSize={7.5} fill="var(--faint)">amount →</text>
      {cols.map((c, i) => {
        const x = pad.l + i * slot + (slot - barW) / 2;
        return (
          <g key={c.g}>
            {c.segs.map((s, j) => (
              <rect key={j} x={x} y={s.y0} width={barW} height={s.y1 - s.y0} rx={2} fill={s.fill} fillOpacity={s.op} />
            ))}
            <text x={x + barW / 2} y={H - 14} textAnchor="middle" fontSize={8.5} fontWeight={600} fill="var(--muted)">{c.g}</text>
          </g>
        );
      })}
      <line x1={cX - 3} y1={eddY} x2={cX + barW + 3} y2={eddY} stroke={RISK_VAR.caution} strokeWidth={1} strokeDasharray="2 2" />
      <line x1={pad.l} y1={capY} x2={pad.l + iw} y2={capY} stroke={RISK_VAR.caution} strokeWidth={1} strokeDasharray="4 3" />
      <text x={pad.l + 3} y={capY + 9} fontSize={7.5} fontWeight={600} fill={RISK_VAR.caution}>per-transfer limit</text>
      <line x1={pad.l} y1={needleY} x2={pad.l + iw} y2={needleY} stroke="var(--accent)" strokeWidth={1.5} />
      <text x={pad.l + 3} y={needleY + 10} fontSize={7.5} fontWeight={700} fill="var(--accent)">this transfer</text>
      <text x={pad.l + iw / 2} y={H - 3} textAnchor="middle" fontSize={7.5} fill="var(--faint)">chains by grade · decided per transfer</text>
    </svg>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[11px] uppercase tracking-wide text-faint">{k}</dt>
      <dd className="mono text-sm font-semibold tabular-nums text-ink">{v}</dd>
    </div>
  );
}
