import { ArrowLeft, Download, ExternalLink, Printer } from "lucide-react";
import { buildExportJSON, downloadFile, exportStamp } from "../lib/exportData";
import type { Chain, Rating, Stat } from "../content/types";
import { BAND_BY_ID, DIMENSION_BY_ID, DIMENSIONS } from "../content/methodology";
import { gradeMeta, PRODUCT_META, CUSTOMER_META, scoreChain, type Profile } from "../lib/model";
import { BAND_LEVEL, RISK_LABEL, RISK_VAR } from "../lib/uiTokens";
import {
  BandChip,
  CategoryTag,
  Citation,
  EvidenceChip,
  GradeChip,
  Monogram,
  RiskDot,
  SectionLabel,
  TierTag,
} from "../components/primitives";
import { ConcernGauge, RosetteWithLegend } from "../components/RiskRosette";
import { sourceOfFundsView } from "../lib/sourceOfFunds";
import { evidenceFor } from "../lib/evidence";
import { ContributionBars, ProfileSensitivity } from "../components/charts";
import { Segmentation } from "../components/Segmentation";

export function ChainDetail({
  chain,
  profile,
  setProfile,
  onBack,
}: {
  chain: Chain;
  profile: Profile;
  setProfile: (p: Profile) => void;
  onBack: () => void;
}) {
  const s = scoreChain(chain, profile);
  const evidence = evidenceFor(chain, profile);
  const band = s.band;
  const gm = gradeMeta(s.grade);
  return (
    <div className="rise">
      <div className="mb-5 flex items-center justify-between print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wide text-faint transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" /> All chains
        </button>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded border px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-muted transition-colors hover:text-ink"
            title="Print this assessment (or save it as a PDF one-pager)"
          >
            <Printer className="size-3" /> Print / PDF
          </button>
          <button
            onClick={() =>
              downloadFile(
                `chaingauge-${chain.id}-${exportStamp(profile)}.json`,
                buildExportJSON([chain], profile),
                "application/json",
              )
            }
            className="inline-flex items-center gap-1.5 rounded border px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-muted transition-colors hover:text-ink"
            title="Download this chain's assessment under the current profile"
          >
            <Download className="size-3" /> JSON
          </button>
        </div>
      </div>

      {/* Print-only header so the one-pager states its own context. */}
      <div className="mb-4 hidden print:block">
        <div className="text-[11px] uppercase tracking-widest text-faint">
          ChainGauge · financial-crime chain assessment · profile: {PRODUCT_META[profile.product].label} ·{" "}
          {CUSTOMER_META[profile.customer].label} · {chain.asAt}
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start gap-4">
        <Monogram ticker={chain.ticker === "—" ? chain.name : chain.ticker} chainId={chain.id} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-ink">{chain.name}</h1>
            <span className="text-sm text-faint">{chain.ticker}</span>
            <CategoryTag category={chain.category} />
            <GradeChip grade={s.grade} withLabel />
            <BandChip band={band} />
          </div>
          <p className="sans mt-2 max-w-3xl text-sm leading-relaxed text-muted">{chain.summary}</p>
        </div>
      </div>

      {/* Profile control */}
      <div className="mt-4 print:hidden">
        <Segmentation profile={profile} setProfile={setProfile} compact />
      </div>

      {/* Instrument cluster + verdict/facts */}
      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[300px_1fr]">
        <div className="panel flex flex-col items-center gap-5 rounded-md px-5 py-6">
          <div className="w-full max-w-[240px]">
            <ConcernGauge value={s.score} level={gm.level} />
          </div>
          <div className="h-px w-full" style={{ background: "var(--line)" }} />
          <RosetteWithLegend chain={chain} />
        </div>

        <div className="flex flex-col gap-4">
          <div
            className="rounded-md border px-4 py-3"
            style={{
              borderColor: `color-mix(in oklab, ${RISK_VAR[BAND_LEVEL[band]]} 35%, transparent)`,
              background: `color-mix(in oklab, ${RISK_VAR[BAND_LEVEL[band]]} 8%, transparent)`,
            }}
          >
            <div className="text-[11px] font-semibold uppercase tracking-widest text-faint">
              Grade {s.grade} · {gm.label} · {BAND_BY_ID[band].label}
            </div>
            <p className="sans mt-1 text-sm text-ink">{BAND_BY_ID[band].verdict}</p>
          </div>

          <div className="panel rounded-md px-4 py-3">
            <SectionLabel>At a glance</SectionLabel>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <Fact label="Model" value={chain.facts.model} />
              <Fact label="Consensus" value={chain.facts.consensus} />
              <Fact label="Launched" value={chain.facts.launched} />
              <Fact label="Steward" value={chain.facts.steward} />
            </dl>
          </div>

          <div className="panel rounded-md px-4 py-3">
            <SectionLabel>Before you deploy</SectionLabel>
            <p className="sans mt-1.5 text-sm leading-relaxed text-ink">{chain.deployment}</p>
          </div>

          {/* Required on every chain, including the ones rated clear across all
              seven factors. A grade says no material gap was found on the seven
              questions asked; it does not say the chain is safe, and a page that
              never prints the difference lets a reader assume otherwise. */}
          <div className="panel rounded-md px-4 py-3">
            <SectionLabel>Still a risk</SectionLabel>
            <p className="sans mt-1.5 text-sm leading-relaxed text-ink">{chain.residual.note}</p>
            {chain.residual.sources.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                {chain.residual.sources.map((src) => (
                  <a
                    key={src.name}
                    href={src.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 text-[11px] text-faint underline decoration-dotted underline-offset-2 transition-colors hover:text-ink"
                  >
                    {src.name} <ExternalLink className="size-2.5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* The footprint. It was on the ratings table and the landing page but
              not here, which is backwards: this is the page a reader lands on
              when they have been asked about one specific chain, and "will we
              even see this" is the first thing they need. */}
          <div className="panel rounded-md px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <SectionLabel>Where you meet it</SectionLabel>
              <TierTag tier={chain.exposure.tier} />
            </div>
            <p className="sans mt-1.5 text-sm leading-relaxed text-ink">{chain.exposure.where}</p>
            <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t pt-2.5">
              <span className="text-[11px] uppercase tracking-widest text-faint">
                {chain.exposure.scale.label}
              </span>
              {/* Deliberately not tinted by the risk palette, for the same
                  reason the tier tag is not: size of footprint is not size of
                  risk. Showing Tron's $87bn in rose would say the volume is the
                  danger, when what the rating actually objects to is where that
                  volume ends up, which the seven factors below already say. */}
              <span className="sans text-sm text-ink">{chain.exposure.scale.value}</span>
              {chain.exposure.scale.source?.url && (
                <a
                  href={chain.exposure.scale.source.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-[11px] text-faint underline decoration-dotted underline-offset-2 transition-colors hover:text-ink"
                >
                  source <ExternalLink className="size-2.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* How the rating is calculated */}
      <div className="mt-6">
        <SectionLabel>How this grade is calculated</SectionLabel>
        <div className="panel mt-3 grid gap-6 rounded-md p-4 lg:grid-cols-[1fr_300px]">
          <div>
            <p className="sans mb-3 text-xs text-muted">
              Each factor's severity (0 / 50 / 100) is multiplied by its weight for the{" "}
              <span className="text-ink">{PRODUCT_META[profile.product].label}</span> ·{" "}
              <span className="text-ink">{CUSTOMER_META[profile.customer].label}</span> profile. The
              contributions sum to the score. The faint bar behind each is that factor's maximum
              possible contribution at its weight.
            </p>
            <ContributionBars score={s} />
          </div>

          <div className="flex flex-col gap-3">
            <div className="panel-2 rounded-md border px-3 py-2.5">
              <Row label="Weighted score" value={s.rawScore.toFixed(1)} />
              {s.cap && <Row label="Cap applied" value={`â†’ ${s.cap.floor}`} level="elevated" />}
              <div className="my-2 h-px" style={{ background: "var(--line)" }} />
              <Row label="Final score (0–100)" value={String(s.score)} bold />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wide text-faint">Grade</span>
                <GradeChip grade={s.grade} withLabel />
              </div>
            </div>
            {s.cap && (
              <p className="sans text-[11px] leading-relaxed" style={{ color: RISK_VAR.elevated }}>
                {s.cap.reason}
              </p>
            )}
            <div>
              <div className="text-[11px] uppercase tracking-widest text-faint">Key risk drivers</div>
              <ol className="mt-1.5 space-y-1">
                {s.drivers.slice(0, 3).map((d) => (
                  <li key={d.id} className="flex items-center justify-between text-xs">
                    <span className="text-muted">{DIMENSION_BY_ID[d.id].label}</span>
                    <span className="mono tabular-nums text-faint">{d.contribution.toFixed(1)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Sensitivity: the same chain under every product profile */}
      <div className="mt-6">
        <SectionLabel>Profile sensitivity</SectionLabel>
        <div className="mt-3">
          <ProfileSensitivity chain={chain} customer={profile.customer} />
        </div>
      </div>

      {/* Financial-crime data readout */}
      <div className="mt-6">
        <SectionLabel>Financial-crime data</SectionLabel>
        <div className="mt-3 flex flex-wrap gap-2">
          {chain.stats.map((st) => (
            <StatCell key={st.label} stat={st} />
          ))}
        </div>
        <p className="sans mt-2 text-[11px] text-faint">
          Chain-level illicit figures are only shown where a credible source breaks them out; the
          structural facts (coverage, privacy, controls) feed the ratings directly.
        </p>
      </div>

      {/* The second question. The site was built for "should we deploy on
          this chain"; an MLRO was asked whether a client could be banked whose
          funds came from one, and had to do this translation by hand. */}
      <div className="mt-6">
        <SectionLabel>If a customer's funds came from here</SectionLabel>
        <p className="sans mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          The same seven factors, restated for the case where the money has already moved and the
          chain was somebody else's choice. Nothing new is rated in this section: each line
          restates the published factor above, read for a source-of-funds enquiry and ordered
          worst first.
        </p>
        <div className="panel mt-3 rounded-md">
          {sourceOfFundsView(chain).map((c, i) => (
            <div key={c.id} className={i === 0 ? "px-4 py-3" : "border-t px-4 py-3"}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <RiskDot level={c.level} basis={c.unmeasured ? "no-record" : undefined} />
                <span className="text-sm font-semibold text-ink">{c.question}</span>
                <span
                  className="text-[11px] font-medium uppercase tracking-wide"
                  style={{ color: RISK_VAR[c.level] }}
                >
                  {DIMENSION_BY_ID[c.id].label}
                </span>
              </div>
              <p className="sans mt-1 max-w-3xl text-sm leading-relaxed text-muted">{c.answer}</p>
            </div>
          ))}
        </div>
        <p className="sans mt-3 max-w-3xl text-xs leading-relaxed text-faint">
          What this will not tell you is what to ask the customer for, when to escalate, or when to
          file. That is a regulated judgement for the firm and its MLRO, and it turns on facts
          this site cannot see.
        </p>
      </div>

      {/* Dimensions */}
      <div className="mt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <SectionLabel>The seven factors</SectionLabel>
          {/* A reviewer writing a customer risk assessment said the sourced and
              the assessed factors sat at the same visual weight, so working out
              what was defensible to a supervisor meant reading every line. This
              answers that before they read anything. */}
          {/* Not a count of factors but a share of WEIGHT, because the two come
              apart: a chain can have six of seven sourced and still rest its
              advantage on the unsourced one if that is the factor the profile
              leans on. A reviewer hit exactly that comparing three chains for a
              tokenised fund. */}
          <p className="sans text-[11px] text-faint">
            {Math.round(evidence.sourcedShare * 100)}% of this grade rests on factors with a
            published source
            {evidence.unevidencedShare > 0.12 && (
              <>
                {" · "}
                <span style={{ color: RISK_VAR.caution }}>
                  {Math.round(evidence.unevidencedShare * 100)}% rests on an unsourced clear
                </span>
              </>
            )}
          </p>
        </div>
        {evidence.weakest.length > 0 && (
          <p
            className="sans mt-2 max-w-3xl rounded border border-dashed px-3 py-2 text-[13px] leading-relaxed text-muted"
            style={{ borderColor: `color-mix(in oklab, ${RISK_VAR.caution} 40%, transparent)` }}
          >
            <span className="text-ink">Worth knowing before you quote the grade.</span> This chain is
            rated clear on{" "}
            {evidence.weakest.map((w, i) => (
              <span key={w.id}>
                {i > 0 && (i === evidence.weakest.length - 1 ? " and " : ", ")}
                <span className="text-ink">{DIMENSION_BY_ID[w.id].label.toLowerCase()}</span>
              </span>
            ))}{" "}
            without a published source to point at. An unsourced clear is our reading, and it costs a
            chain nothing in the score, so a chain nobody has measured can outrank one where somebody
            found and published a problem. Treat it as a hypothesis to check rather than a number to
            rely on.
          </p>
        )}
        <div className="panel mt-3 rounded-md">
          {DIMENSIONS.map((d, i) => (
            <DimensionRow
              key={d.id}
              label={d.label}
              question={d.question}
              rating={chain.ratings[d.id]}
              first={i === 0}
            />
          ))}
        </div>
      </div>

      <p className="sans mt-4 text-xs leading-relaxed text-faint">
        {/* The chain's own review date, not the framework's. They were the same
            for every chain, which let an entry rated once and never revisited
            claim the freshness of one looked at last week. */}
        The seven factor ratings for {chain.name} were last examined on{" "}
        {chain.reviewed ?? chain.asAt}. The framework itself was last revised on {chain.asAt}. The
        ratings are an assessed view of public information, offered as a starting point for
        enhanced due diligence, and should not be relied on as legal or investment advice.
      </p>
    </div>
  );
}

function Row({ label, value, bold, level }: { label: string; value: string; bold?: boolean; level?: "elevated" }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-[11px] uppercase tracking-wide text-faint">{label}</span>
      <span
        className={`tabular-nums ${bold ? "text-base font-semibold" : "text-sm"}`}
        style={level ? { color: RISK_VAR[level] } : { color: "var(--ink)" }}
      >
        {value}
      </span>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-widest text-faint">{label}</dt>
      <dd className="sans mt-0.5 text-ink">{value}</dd>
    </div>
  );
}

function StatCell({ stat }: { stat: Stat }) {
  const color = stat.level ? RISK_VAR[stat.level] : "var(--ink)";
  return (
    <div className="panel min-w-[12rem] flex-1 rounded-md border px-4 py-3">
      <div className="text-[11px] uppercase tracking-widest text-faint">{stat.label}</div>
      <div className="mono sans mt-1 text-sm font-semibold tabular-nums" style={{ color }}>
        {stat.value}
      </div>
      {stat.source?.url && (
        <a
          href={stat.source.url}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-accent hover:underline"
        >
          source <ExternalLink className="size-2.5" />
        </a>
      )}
    </div>
  );
}

function DimensionRow({
  label,
  question,
  rating,
  first,
}: {
  label: string;
  question: string;
  rating: Rating;
  first: boolean;
}) {
  return (
    <div className={`px-4 py-3.5 ${first ? "" : "border-t"}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <RiskDot level={rating.level} basis={rating.basis} />
        <span className="font-semibold text-ink">{label}</span>
        <span className="text-[11px] font-medium uppercase tracking-wide" style={{ color: RISK_VAR[rating.level] }}>
          {RISK_LABEL[rating.level]}
        </span>
        {/* The badge alone cannot carry this. A reviewer reading the site as an
            MLRO put it plainly: a four-month-old chain showed the same green as
            one with fifteen years of measured data behind it, and under time
            pressure the badge is all anyone reads. */}
        {rating.basis === "no-record" && (
          <span
            className="rounded border border-dashed px-1.5 py-0.5 text-[11px] uppercase tracking-wide"
            style={{ color: RISK_VAR[rating.level], borderColor: RISK_VAR[rating.level] }}
          >
            No track record yet
          </span>
        )}
        <span className="sans ml-auto hidden text-xs text-faint sm:block">{question}</span>
      </div>
      <p className="sans mt-1.5 text-sm leading-relaxed text-muted">{rating.rationale}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {rating.sources.length > 0 ? (
          rating.sources.map((src) => <Citation key={src.name} source={src} />)
        ) : (
          <EvidenceChip sourced={false} />
        )}
      </div>
    </div>
  );
}

