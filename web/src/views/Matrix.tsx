import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { CHAINS, FEED_META } from "../content/chains";
import { DIMENSIONS, LEVELS } from "../content/methodology";
import { byRisk } from "../lib/rating";
import { scoreChain, type Profile } from "../lib/model";
import { RISK_LABEL, RISK_VAR } from "../lib/uiTokens";
import { GradeChip, Monogram } from "../components/primitives";

// The analyst's view: every chain against every dimension, a dot grid in the
// spirit of the L2BEAT risk table. Each cell is hover-explained.

export function Matrix({
  onSelect,
  profile,
  onBack,
}: {
  onSelect: (id: string) => void;
  profile: Profile;
  onBack: () => void;
}) {
  const rows = useMemo(() => [...CHAINS].sort(byRisk(profile)), [profile]);

  return (
    <div className="rise">
      {/* The matrix is reached from a button on the ratings page and has no tab
          of its own, so without this it is a dead end: the only way out was the
          browser back button or guessing which tab to press. */}
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-xs uppercase tracking-wide text-faint transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" /> Back to ratings
      </button>

      <div className="mb-5">
        <div className="mb-2 text-[11px] uppercase tracking-widest text-faint">Risk matrix</div>
        <h1 className="text-xl font-bold tracking-tight text-ink">
          Every chain against every factor
        </h1>
        <p className="sans mt-2 max-w-3xl text-sm text-muted">
          Green is lower financial-crime concern, red is higher. Each dimension is judged
          independently, so a strength in one area never hides a weakness in another. Hover a cell for
          the reason.
        </p>
      </div>

      {/* Legend */}
      <div className="mb-3 flex flex-wrap items-center gap-4 text-[11px] text-muted">
        {LEVELS.map((l) => (
          <span key={l.id} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ background: RISK_VAR[l.id] }} aria-hidden />
            {l.label} — {l.meaning}
          </span>
        ))}
      </div>

      <div className="panel overflow-x-auto rounded-md">
        <table className="w-full min-w-[780px] border-collapse text-sm">
          <thead>
            <tr className="border-b text-[11px] font-semibold uppercase tracking-widest text-faint">
              <th className="sticky left-0 z-10 bg-[var(--panel)] px-4 py-3 text-left">Chain</th>
              {DIMENSIONS.map((d) => (
                <th key={d.id} className="px-2 py-3 text-center">
                  <span className="mx-auto block max-w-[128px] leading-tight">{d.label}</span>
                </th>
              ))}
              <th className="px-4 py-3 text-right">Grade</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((chain, i) => (
              <tr
                key={chain.id}
                onClick={() => onSelect(chain.id)}
                className={`group cursor-pointer transition-colors hover:bg-[var(--panel-2)] ${i > 0 ? "border-t" : ""}`}
              >
                <td className="sticky left-0 z-10 bg-[var(--panel)] px-4 py-2.5 group-hover:bg-[var(--panel-2)]">
                  <div className="flex items-center gap-2.5">
                    <Monogram ticker={chain.ticker === "—" ? chain.name : chain.ticker} chainId={chain.id} size="sm" />
                    <span className="font-medium text-ink">{chain.name}</span>
                  </div>
                </td>
                {DIMENSIONS.map((d) => {
                  const r = chain.ratings[d.id];
                  return (
                    <td key={d.id} className="px-2 py-2.5 text-center">
                      <span
                        className="mx-auto inline-flex size-6 items-center justify-center rounded"
                        style={{ background: `color-mix(in oklab, ${RISK_VAR[r.level]} 14%, transparent)` }}
                        title={`${chain.name} · ${d.label}: ${RISK_LABEL[r.level]}. ${r.rationale}`}
                      >
                        <span
                          data-level={r.level}
                          className="size-2.5 rounded-full"
                          style={
                            r.basis === "no-record"
                              ? { border: `1.5px dashed ${RISK_VAR[r.level]}` }
                              : { background: RISK_VAR[r.level] }
                          }
                        />
                      </span>
                    </td>
                  );
                })}
                <td className="px-4 py-2.5 text-right">
                  <span className="inline-flex justify-end">
                    <GradeChip grade={scoreChain(chain, profile).grade} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="sans mt-4 text-xs text-faint">
        Assessed {FEED_META.asAt}. A starting point for enhanced due diligence, not legal or
        investment advice.
      </p>
    </div>
  );
}
