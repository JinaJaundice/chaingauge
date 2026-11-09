import { useEffect, type ReactNode } from "react";
import { Plus, X } from "lucide-react";
import type { Chain, Level } from "../content/types";
import { CHAINS, FEED_META } from "../content/chains";
import { DIMENSION_BY_ID, DIMENSIONS } from "../content/methodology";
import { scoreChain, type Profile } from "../lib/model";
import { decidingFactor } from "../lib/evidence";
import { RISK_LABEL, RISK_VAR } from "../lib/uiTokens";
import { CategoryTag, GradeChip, Monogram, RiskDot, SectionLabel } from "../components/primitives";
import { RiskRosette } from "../components/RiskRosette";
import { Segmentation } from "../components/Segmentation";

// Side-by-side comparison of two to four chains under the active profile — the
// actual compliance workflow ("we are choosing between Base and Polygon").
// The selection lives in the URL, so a comparison is shareable.

const DEFAULT_SET = ["bitcoin", "tron", "monero"];
/** Structural stats aligned across chains, matched by their shared labels. */
const STAT_ROWS = ["Analytics coverage", "Privacy tech", "Native controls", "Travel Rule"];

export function Compare({
  ids,
  setIds,
  profile,
  setProfile,
  onSelect,
}: {
  ids: string[];
  setIds: (ids: string[]) => void;
  profile: Profile;
  setProfile: (p: Profile) => void;
  onSelect: (id: string) => void;
}) {
  // An empty URL selection gets a meaningful default (persisted via replace,
  // so the back button is not affected).
  useEffect(() => {
    if (ids.length === 0) setIds(DEFAULT_SET);
  }, [ids, setIds]);

  const chains = ids.map((id) => CHAINS.find((c) => c.id === id)).filter((c): c is Chain => !!c);

  const nameOf = (id: string) => CHAINS.find((c) => c.id === id)?.name ?? id;

  // Every pair, keeping only those whose deciding factor is unevidenced on the
  // winning side. Four chains is six pairs, so this stays small.
  const caveats = chains.flatMap((a, i) =>
    chains.slice(i + 1).flatMap((b) => {
      const d = decidingFactor(a, b, profile);
      return d && d.unsourcedOnBetterSide ? [d] : [];
    }),
  );
  const swap = (i: number, id: string) => {
    // Guard: never write an empty or duplicate id into the URL.
    if (!id || ids.includes(id)) return;
    setIds(ids.map((x, j) => (j === i ? id : x)));
  };
  const remove = (i: number) => setIds(ids.filter((_, j) => j !== i));
  const add = () => {
    const next = CHAINS.find((c) => !ids.includes(c.id));
    if (next) setIds([...ids, next.id]);
  };

  return (
    <div className="rise">
      <div className="mb-5">
        <div className="mb-2 text-[11px] uppercase tracking-widest text-faint">Compare</div>
        <h1 className="text-xl font-bold tracking-tight text-ink">Chains side by side</h1>
        <p className="sans mt-2 max-w-3xl text-sm text-muted">
          Two to four chains under the same deployment profile, factor by factor. The selection is in
          the URL, so a comparison can be shared as a link.
        </p>
      </div>

      <div className="mb-5">
        <Segmentation profile={profile} setProfile={setProfile} compact />
      </div>

      {/* Comparing is the moment the question stops being "how risky is this"
          and becomes "why is this one ahead", and that is exactly when it starts
          to matter whether the deciding factor is evidenced. A reviewer compared
          three chains for a tokenised fund, found the leader ahead on one
          factor, and found that factor was the only one on its page with no
          source, while the chains it beat carried a citation and were rated
          worse. An unsourced clear costs nothing in the score. */}
      {caveats.length > 0 && (
        <div
          className="mb-5 rounded-md border border-dashed px-4 py-3"
          style={{ borderColor: `color-mix(in oklab, ${RISK_VAR.caution} 45%, transparent)` }}
        >
          <div className="text-[11px] font-semibold uppercase tracking-widest text-faint">
            Check this before you quote the difference
          </div>
          <ul className="mt-2 space-y-1.5">
            {caveats.map((c) => (
              <li key={`${c.betterId}-${c.worseId}-${c.id}`} className="sans text-[13px] leading-relaxed text-muted">
                <span className="text-ink">{nameOf(c.betterId)}</span> is ahead of{" "}
                <span className="text-ink">{nameOf(c.worseId)}</span> mainly on{" "}
                <span style={{ color: RISK_VAR.caution }}>
                  {DIMENSION_BY_ID[c.id].label.toLowerCase()}
                </span>
                , and that is the one factor {nameOf(c.betterId)} carries no published source for.
                The chain it beats does cite one, and is rated worse on it.
              </li>
            ))}
          </ul>
          <p className="sans mt-2 text-[11px] leading-relaxed text-faint">
            This does not mean the rating is wrong. It means the gap rests on our reading, with no published evidence behind it, so check it
            before it goes in a paper.
          </p>
        </div>
      )}

      <div className="overflow-x-auto pb-2">
        <div
          className="grid min-w-[560px] gap-px overflow-hidden rounded-md border"
          style={{
            gridTemplateColumns: `132px repeat(${chains.length}, minmax(150px, 1fr))`,
            background: "var(--line)",
          }}
        >
          {/* Header row: pickers + identity */}
          <Cell head />
          {chains.map((c, i) => {
            const s = scoreChain(c, profile);
            return (
              <Cell key={c.id} head>
                <div className="flex items-start justify-between gap-2">
                  <select
                    value={c.id}
                    onChange={(e) => swap(i, e.target.value)}
                    className="panel-2 mono w-full cursor-pointer rounded border px-1.5 py-1 text-xs text-ink outline-none"
                    aria-label={`Column ${i + 1} chain`}
                  >
                    {CHAINS.filter((x) => x.id === c.id || !ids.includes(x.id))
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((x) => (
                        <option key={x.id} value={x.id} className="bg-[var(--panel)] text-ink">
                          {x.name}
                        </option>
                      ))}
                  </select>
                  {chains.length > 2 && (
                    <button
                      onClick={() => remove(i)}
                      className="mt-0.5 text-faint transition-colors hover:text-ink"
                      aria-label={`Remove ${c.name}`}
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
                <button onClick={() => onSelect(c.id)} className="mt-3 flex items-center gap-2 text-left">
                  <Monogram ticker={c.ticker === "—" ? c.name : c.ticker} chainId={c.id} size="sm" />
                  <span className="truncate text-sm font-semibold text-ink hover:underline">{c.name}</span>
                </button>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <GradeChip grade={s.grade} withLabel size="sm" />
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <CategoryTag category={c.category} />
                  <span className="mono text-[11px] tabular-nums text-faint">score {s.score}</span>
                </div>
                <div className="mt-3 flex justify-center">
                  <RiskRosette chain={c} size={64} interactive />
                </div>
              </Cell>
            );
          })}

          {/* Seven factors */}
          {DIMENSIONS.map((d) => (
            <FactorRow key={d.id} label={d.label}>
              {chains.map((c) => {
                const r = c.ratings[d.id];
                return (
                  <Cell key={c.id}>
                    <div className="flex items-center gap-1.5" title={r.rationale}>
                      <RiskDot level={r.level} />
                      <span className="text-xs" style={{ color: RISK_VAR[r.level] }}>
                        {RISK_LABEL[r.level]}
                      </span>
                    </div>
                    <p className="sans mt-1 line-clamp-3 text-[11px] leading-snug text-faint">{r.rationale}</p>
                  </Cell>
                );
              })}
            </FactorRow>
          ))}

          {/* Structural stats */}
          {STAT_ROWS.map((label) => (
            <FactorRow key={label} label={label}>
              {chains.map((c) => {
                const st = c.stats.find((s) => s.label === label);
                return (
                  <Cell key={c.id}>
                    <span
                      className="sans text-xs font-medium"
                      style={{ color: st?.level ? RISK_VAR[st.level as Level] : "var(--ink)" }}
                    >
                      {st?.value ?? "—"}
                    </span>
                  </Cell>
                );
              })}
            </FactorRow>
          ))}

          {/* Deployment note */}
          <FactorRow label="Deployment note">
            {chains.map((c) => (
              <Cell key={c.id}>
                <p className="sans text-[11px] leading-relaxed text-muted">{c.deployment}</p>
              </Cell>
            ))}
          </FactorRow>

          {/* Every surface that shows factors also shows what survives them.
              A comparison is the easiest place to read seven clears as a winner. */}
          <FactorRow label="Still a risk">
            {chains.map((c) => (
              <Cell key={c.id}>
                <p className="sans text-[11px] leading-relaxed text-muted">{c.residual.note}</p>
              </Cell>
            ))}
          </FactorRow>
        </div>
      </div>

      {chains.length < 4 && (
        <button
          onClick={add}
          className="mt-3 inline-flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-muted transition-colors hover:text-ink"
        >
          <Plus className="size-3.5" /> Add a chain
        </button>
      )}

      <p className="sans mt-4 text-xs text-faint">
        Grades and scores follow the selected profile. Assessed {FEED_META.asAt}; a starting point for enhanced due diligence, and no form of legal or investment advice.
      </p>
    </div>
  );
}

function Cell({ children, head }: { children?: ReactNode; head?: boolean }) {
  return <div className={`bg-[var(--panel)] px-3 ${head ? "py-3" : "py-2.5"}`}>{children}</div>;
}

function FactorRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <div className="flex items-start bg-[var(--panel)] px-3 py-2.5">
        <SectionLabel className="leading-snug normal-case tracking-wide">{label}</SectionLabel>
      </div>
      {children}
    </>
  );
}
