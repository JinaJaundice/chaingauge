import { useMemo, useState } from "react";
import { ChevronRight, Columns3, Download, GitCompare } from "lucide-react";
import type { Category, Chain, Relevance } from "../content/types";
import { CHAINS, FEED_META } from "../content/chains";
import { DIMENSIONS } from "../content/methodology";
import { gradeMeta, scoreChain, type Grade, type Profile } from "../lib/model";
import { RELEVANCE_ORDER, RISK_VAR, textStyle } from "../lib/uiTokens";
import { cn } from "../lib/cn";
import { CategoryTag, GradeChip, Monogram, RiskDot, TierTag } from "../components/primitives";
import { RiskRosette } from "../components/RiskRosette";
import { Segmentation } from "../components/Segmentation";
import { ChainGrid } from "../components/ChainGrid";
import { buildExportCSV, buildExportJSON, downloadFile, exportStamp } from "../lib/exportData";

type Filter = "all" | Category | Relevance;

/** Two filter groups on one row: what kind of chain, and how likely you are to
 *  meet it. Both are filters over the same store, so they share one control. */
const FILTERS: { id: Filter; label: string; group: "type" | "footprint" }[] = [
  { id: "all", label: "All", group: "type" },
  { id: "l1", label: "L1", group: "type" },
  { id: "l2", label: "L2", group: "type" },
  { id: "payment", label: "Payment", group: "type" },
  { id: "privacy", label: "Privacy", group: "type" },
  { id: "mainstream", label: "Mainstream", group: "footprint" },
  { id: "emerging", label: "Emerging", group: "footprint" },
  { id: "restricted", label: "Restricted", group: "footprint" },
];

const CATEGORIES: Filter[] = ["l1", "l2", "payment", "privacy"];

const GRADE_ORDER: Grade[] = ["A", "B", "C", "D", "E"];

/** Shared by the header and every row, so the two can never disagree. */
const COLUMNS = "sm:grid-cols-[minmax(0,1.7fr)_88px_minmax(0,1.2fr)_minmax(0,1.3fr)_76px]";

function ExportButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted transition-colors hover:text-ink"
      title={`Download the full assessment under the current profile (${label})`}
    >
      <Download className="size-3" />
      {label}
    </button>
  );
}

/** The dimension a reader should look at first: the worst-rated one. */
function headlineGap(chain: Chain) {
  const rank = { clear: 0, caution: 1, elevated: 2 };
  let worst = DIMENSIONS[0];
  for (const d of DIMENSIONS) {
    if (rank[chain.ratings[d.id].level] > rank[chain.ratings[worst.id].level]) worst = d;
  }
  return { dim: worst, level: chain.ratings[worst.id].level };
}

export function Ratings({
  onSelect,
  profile,
  setProfile,
  onMatrix,
  onCompare,
}: {
  onSelect: (id: string) => void;
  profile: Profile;
  setProfile: (p: Profile) => void;
  onMatrix: () => void;
  onCompare: () => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  // Grade cohorts, not a rank. Fourteen chains share grade A on the balanced
  // profile, and sorting them 1 to 51 by score would imply a precision this
  // model does not have. Rating agencies group; so does this. Within a cohort
  // the order is by footprint, so the chains you are most likely to meet sit at
  // the top of their own band.
  const cohorts = useMemo(() => {
    const list =
      filter === "all"
        ? CHAINS
        : CATEGORIES.includes(filter)
          ? CHAINS.filter((c) => c.category === filter)
          : CHAINS.filter((c) => c.exposure.tier === filter);

    const scored = list.map((c) => ({ chain: c, s: scoreChain(c, profile) }));
    return GRADE_ORDER.map((grade) => ({
      grade,
      rows: scored
        .filter((r) => r.s.grade === grade)
        .sort(
          (a, b) =>
            RELEVANCE_ORDER[a.chain.exposure.tier] - RELEVANCE_ORDER[b.chain.exposure.tier] ||
            a.s.score - b.s.score ||
            a.chain.name.localeCompare(b.chain.name),
        ),
    })).filter((c) => c.rows.length > 0);
  }, [filter, profile]);

  const total = cohorts.reduce((n, c) => n + c.rows.length, 0);

  return (
    <div className="rise">
      {/* Header. The landing page does the explaining; this is the work surface,
          so it states the job and gets out of the way. */}
      <div className="mb-5">
        <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">Ratings</h1>
        <p className="sans mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          Every rated chain, graded for the deployment profile you pick below. The chains are
          grouped by grade instead of ranked, because the model does not meaningfully separate
          chains within a grade, and each group is ordered by how likely a regulated firm is to
          meet the chain.
        </p>
      </div>

      {/* Deployment profile */}
      <div className="mb-5">
        <Segmentation profile={profile} setProfile={setProfile} />
      </div>

      {/* One chart. See docs/DESIGN.md and the ChainGrid header for why the
          two scatters it replaced could not work on data this coarse. */}
      <div className="mb-6">
        <ChainGrid chains={CHAINS} profile={profile} onSelect={onSelect} />
      </div>

      {/* Filter */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="panel inline-flex flex-wrap rounded-md p-0.5">
          {FILTERS.map((f, i) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide transition-colors sm:px-3 sm:text-xs",
                filter === f.id ? "text-[var(--accent-ink)]" : "text-faint hover:text-ink",
                // A hairline between the two filter groups, so it reads as two
                // questions rather than one long list of eight buttons.
                f.group === "footprint" && FILTERS[i - 1]?.group === "type" ? "ml-1 border-l pl-3" : "",
              )}
              style={filter === f.id ? { background: "var(--accent)" } : undefined}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <button
            onClick={onCompare}
            className="inline-flex items-center gap-1.5 rounded border px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-muted transition-colors hover:text-ink"
            title="Put two to four chains side by side under the same profile"
          >
            <GitCompare className="size-3" />
            Compare
          </button>
          <button
            onClick={onMatrix}
            className="inline-flex items-center gap-1.5 rounded border px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-muted transition-colors hover:text-ink"
            title="See every chain against every factor in one grid"
          >
            <Columns3 className="size-3" />
            Matrix
          </button>
          <span className="text-[11px] tracking-wide text-faint">
            {total} chains<span className="hidden sm:inline"> · assessed {FEED_META.asAt}</span>
          </span>
          {/* File the assessment: the same numbers the model shows on screen. */}
          <div className="flex items-center gap-1">
            <ExportButton
              label="JSON"
              onClick={() =>
                downloadFile(
                  `chaingauge-assessment-${exportStamp(profile)}.json`,
                  buildExportJSON(CHAINS, profile),
                  "application/json",
                )
              }
            />
            <ExportButton
              label="CSV"
              onClick={() =>
                downloadFile(
                  `chaingauge-assessment-${exportStamp(profile)}.csv`,
                  buildExportCSV(CHAINS, profile),
                  "text/csv",
                )
              }
            />
          </div>
        </div>
      </div>

      {/* Table, in grade cohorts */}
      <div className="panel overflow-hidden rounded-md">
        <div
          className={cn(
            "hidden items-center gap-4 border-b px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-faint sm:grid",
            COLUMNS,
          )}
        >
          <span>Chain</span>
          <span className="text-center">Factors</span>
          <span>How common</span>
          <span>Weakest</span>
          <span className="text-right">Score</span>
        </div>

        {total === 0 && (
          <p className="sans px-4 py-8 text-center text-sm text-faint">
            No chains match that filter.
          </p>
        )}

        {cohorts.map((cohort) => {
          const meta = gradeMeta(cohort.grade);
          return (
            <section key={cohort.grade}>
              {/* The cohort header carries the grade once, so the rows do not
                  repeat it fifty times. */}
              <div className="flex items-center gap-3 border-y bg-[var(--panel-2)] px-4 py-2">
                <GradeChip grade={cohort.grade} size="sm" />
                <span
                  className="text-[11px] font-semibold uppercase tracking-widest"
                  style={textStyle(meta.level)}
                >
                  {meta.label}
                </span>
                <span className="mono ml-auto text-[11px] tabular-nums tracking-wide text-faint">
                  {cohort.rows.length}
                </span>
              </div>

              <ul>
                {cohort.rows.map(({ chain, s }, i) => {
                  const gap = headlineGap(chain);
                  return (
                    <li key={chain.id} className={i > 0 ? "border-t" : undefined}>
                      <button
                        onClick={() => onSelect(chain.id)}
                        className={cn(
                          "grid w-full grid-cols-[1fr_auto] items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-[var(--panel-2)]",
                          COLUMNS,
                        )}
                      >
                        {/* Chain */}
                        <div className="flex min-w-0 items-center gap-3">
                          <Monogram ticker={chain.ticker === "—" ? chain.name : chain.ticker} chainId={chain.id} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate font-medium text-ink">{chain.name}</span>
                              <span className="hidden text-[11px] text-faint sm:inline">
                                {chain.ticker}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-1.5">
                              <CategoryTag category={chain.category} />
                              <span className="sm:hidden">
                                <TierTag tier={chain.exposure.tier} />
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="hidden justify-center sm:flex">
                          <RiskRosette chain={chain} size={34} interactive />
                        </div>

                        <div className="hidden min-w-0 flex-col gap-1 sm:flex">
                          <TierTag tier={chain.exposure.tier} className="self-start" />
                          <span className="sans truncate text-[11px] text-faint" title={chain.exposure.scale.value}>
                            {chain.exposure.scale.value}
                          </span>
                        </div>

                        <div className="hidden min-w-0 items-center gap-2 sm:flex">
                          <RiskDot level={gap.level} />
                          <span className="sans truncate text-sm text-muted">
                            {gap.level === "clear" ? "No gaps, but see the risk" : gap.dim.label}
                          </span>
                        </div>

                        <div className="flex items-center justify-end gap-3">
                          <div className="hidden items-center gap-2 sm:flex">
                            <div
                              className="h-1 w-10 overflow-hidden rounded-full"
                              style={{ background: "var(--line)" }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${Math.max(s.score, 4)}%`,
                                  background:
                                    RISK_VAR[
                                      s.grade === "A" || s.grade === "B"
                                        ? "clear"
                                        : s.grade === "C"
                                          ? "caution"
                                          : "elevated"
                                    ],
                                }}
                              />
                            </div>
                            <span className="mono w-6 text-right text-xs tabular-nums text-muted">
                              {s.score}
                            </span>
                          </div>
                          <ChevronRight className="size-4 text-faint" />
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <p className="sans mt-4 max-w-3xl text-xs leading-relaxed text-faint">
        Grades and scores are produced by the model on the Method page and change with the deployment
        profile. Chains inside a grade are listed together rather than ranked against each other,
        because the model does not separate them. The ratings are a starting point for enhanced due
        diligence and should not be relied on as legal or investment advice. Assessed as at{" "}
        {FEED_META.asAt}.
      </p>
    </div>
  );
}
