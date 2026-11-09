import { useMemo, useState } from "react";
import type { Chain, Level } from "../content/types";
import { DIMENSIONS } from "../content/methodology";
import {
  gradeMeta,
  scoreChain,
  type Grade,
  type ProductProfile,
  type Profile,
} from "../lib/model";
import { RELEVANCE_ORDER, RISK_VAR, textStyle } from "../lib/uiTokens";
import { CHAIN_ICON } from "../content/chainIcons";
import { GradeChip, TierTag } from "./primitives";
import { cn } from "../lib/cn";

// ---------------------------------------------------------------
// One chart, replacing two.
//
// The pair it replaces were both scatters over the same factors, and the
// data does not support a scatter: visibility and control are each the mean of
// two three-level factors, so there are 25 possible positions and only 9 are
// occupied, one of them holding 16 chains. Plotting that produces clumps that a
// force layout then has to push apart, which is where the overlapping and
// clipping came from. The marks were also unlabelled dots, so finding one chain
// meant hovering over fifty.
//
// This is laid out in HTML rather than SVG. Every defect in the old charts was
// an SVG layout defect: escaping marks, clipped labels, a viewBox that had to
// be fought. A grid of tiles wraps by itself, scales by itself, and each tile
// is a real button.
// ---------------------------------------------------------------

const GRADES: Grade[] = ["A", "B", "C", "D", "E"];

const PRODUCTS: ProductProfile[] = [
  "balanced",
  "payments",
  "securities",
  "custody",
  "exchange",
  "defi",
];

/**
 * How far a chain's grade moves across the six products, holding the customer
 * type fixed.
 *
 * This is the one thing the table underneath cannot show, and it is the whole
 * argument the site makes: a chain is not safe or unsafe on its own, it is safe
 * or unsafe for something. A chain that sits at B for custody and D for payments
 * is a different conversation from one that holds its grade whatever you build,
 * and the ratings table only ever shows one profile at a time.
 */
function gradeSpread(chain: Chain, customer: Profile["customer"]) {
  const grades = PRODUCTS.map((product) => ({
    product,
    grade: scoreChain(chain, { product, customer }).grade,
  }));
  const best = grades.reduce((a, b) => (a.grade <= b.grade ? a : b));
  const worst = grades.reduce((a, b) => (a.grade >= b.grade ? a : b));
  return { moves: best.grade !== worst.grade, best, worst };
}

/**
 * The chain's mark at tile scale, or a single letter if it has no mark.
 *
 * Deliberately not the `Monogram` primitive: that draws its own bordered box,
 * and a box inside a tile that is already a box reads as clutter at this size.
 * Here the tile is the container and this is just the glyph.
 *
 * Hidden below `sm`. Five grade columns at 390px leaves about 62px a tile, and
 * the mark pushed 15 of the 51 tickers into an ellipsis. A ticker you cannot
 * read is worse than no icon, and the ranking is what the grid is for.
 */
function ChainMark({
  chainId,
  ticker,
  level,
}: {
  chainId: string;
  ticker: string;
  level: Level;
}) {
  const glyph = CHAIN_ICON[chainId];
  if (glyph) {
    return (
      <svg
        viewBox="0 0 24 24"
        width={14}
        height={14}
        fill="none"
        className="hidden shrink-0 opacity-90 sm:block"
        aria-hidden
        dangerouslySetInnerHTML={{ __html: glyph }}
      />
    );
  }
  return (
    <span
      className="mono hidden size-3.5 shrink-0 items-center justify-center rounded-[3px] text-[11px] leading-none font-bold sm:flex"
      style={{
        color: RISK_VAR[level],
        background: `color-mix(in oklab, ${RISK_VAR[level]} 16%, transparent)`,
      }}
      aria-hidden
    >
      {(ticker.replace(/[^A-Za-z0-9]/g, "")[0] ?? "?").toUpperCase()}
    </span>
  );
}

/** The worst-rated factor: what a reader should look at first. */
function topConcern(chain: Chain) {
  const rank = { clear: 0, caution: 1, elevated: 2 };
  let worst = DIMENSIONS[0];
  for (const d of DIMENSIONS) {
    if (rank[chain.ratings[d.id].level] > rank[chain.ratings[worst.id].level]) worst = d;
  }
  return { dim: worst, level: chain.ratings[worst.id].level };
}

export function ChainGrid({
  chains,
  profile,
  onSelect,
}: {
  chains: Chain[];
  profile: Profile;
  onSelect: (id: string) => void;
}) {
  const [active, setActive] = useState<string | null>(null);

  const columns = useMemo(
    () =>
      GRADES.map((grade) => ({
        grade,
        meta: gradeMeta(grade),
        chains: chains
          .map((c) => ({ c, s: scoreChain(c, profile) }))
          .filter((r) => r.s.grade === grade)
          .sort(
            (a, b) =>
              RELEVANCE_ORDER[a.c.exposure.tier] - RELEVANCE_ORDER[b.c.exposure.tier] ||
              a.s.score - b.s.score ||
              a.c.name.localeCompare(b.c.name),
          ),
      })),
    [chains, profile],
  );

  const shown = active ? chains.find((c) => c.id === active) : null;
  const shownScore = shown ? scoreChain(shown, profile) : null;
  const concern = shown ? topConcern(shown) : null;
  const spread = shown ? gradeSpread(shown, profile.customer) : null;

  const movers = useMemo(
    () => chains.filter((c) => gradeSpread(c, profile.customer).moves).length,
    [chains, profile.customer],
  );

  return (
    <section className="panel rounded-md p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-sm font-semibold text-ink">Every chain by grade</h2>
        <p className="sans text-[11px] text-faint">
          best on the left · hover or focus for detail · click to open
        </p>
      </div>

      {/*
        The inspector, at a FIXED height. This is load-bearing.

        It used to size to its content, so it stood at 52px for a short entry and
        64px for a long one. Hovering a tile therefore moved the grid below it by
        11px, which put the pointer over a different tile, which changed the
        inspector back, which moved the grid back. The result was a grid that
        appeared to shake under the cursor. Anything that reacts to hover and
        sits ABOVE what you are hovering has to reserve its space up front.

        Two fixed rows: an identity line, and two clamped lines of prose.
      */}
      <div
        className="mt-3 h-[5.25rem] overflow-hidden rounded border px-3 py-2"
        style={{ borderColor: "var(--line)" }}
      >
        {shown && shownScore && concern ? (
          <>
            <div className="flex h-7 items-center gap-x-2.5 overflow-hidden">
              <GradeChip grade={shownScore.grade} size="sm" />
              <span className="truncate font-semibold text-ink">{shown.name}</span>
              <TierTag tier={shown.exposure.tier} />
              <span className="mono shrink-0 text-[11px] tabular-nums text-faint">
                score {shownScore.score}
              </span>
              {spread?.moves && (
                <span className="shrink-0 rounded border px-1.5 py-0.5 text-[11px] uppercase tracking-wide text-faint">
                  {spread.best.grade}–{spread.worst.grade} by product
                </span>
              )}
            </div>
            <p className="line-clamp-2 text-[13px] leading-snug text-muted">
              {concern.level === "clear" ? (
                <>
                  <span className="text-ink">No gaps found on the seven factors. What remains:</span>{" "}
                  {shown.residual.note}
                </>
              ) : (
                <>
                  Watch <span style={textStyle(concern.level)}>{concern.dim.label.toLowerCase()}</span>:{" "}
                  {shown.ratings[concern.dim.id].rationale}
                </>
              )}
            </p>
          </>
        ) : (
          <>
            <div className="flex h-7 items-center">
              <span className="text-[11px] uppercase tracking-widest text-faint">
                {chains.length} chains · {movers} change grade by product
              </span>
            </div>
            <p className="line-clamp-2 text-[13px] leading-snug text-faint">
              Point at any chain to read what drives its grade, or click through to the full
              assessment.
            </p>
          </>
        )}
      </div>

      <div className="mt-3 grid grid-cols-5 gap-2">
        {columns.map((col) => (
          <div key={col.grade} className="min-w-0">
            <div
              className="mb-2 flex min-h-[4.25rem] flex-col justify-center rounded border px-1 py-1 text-center"
              style={{
                borderColor: `color-mix(in oklab, ${RISK_VAR[col.meta.level]} 35%, transparent)`,
                background: `color-mix(in oklab, ${RISK_VAR[col.meta.level]} 8%, transparent)`,
              }}
            >
              <div className="text-sm font-bold" style={textStyle(col.meta.level)}>
                {col.grade}
              </div>
              <div className="text-[11px] uppercase leading-tight text-faint">{col.meta.label}</div>
              <div className="mono text-[11px] tabular-nums text-faint">{col.chains.length}</div>
            </div>

            <ul className="flex flex-col gap-1">
              {col.chains.length === 0 && (
                <li className="py-2 text-center text-[11px] text-faint" aria-hidden>
                  none
                </li>
              )}
              {col.chains.map(({ c }) => {
                const moves = gradeSpread(c, profile.customer).moves;
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => onSelect(c.id)}
                      onMouseEnter={() => setActive(c.id)}
                      onMouseLeave={() => setActive((a) => (a === c.id ? null : a))}
                      onFocus={() => setActive(c.id)}
                      onBlur={() => setActive((a) => (a === c.id ? null : a))}
                      aria-label={`${c.name}, grade ${col.grade}`}
                      className={cn(
                        // No `title`. Fifty-one native tooltips in a grid means
                        // one pops and dismisses every time the pointer crosses a
                        // tile; the inspector above already says all of it, and
                        // the aria-label covers the screen reader.
                        "flex w-full items-center gap-1.5 rounded border py-1 pl-1 pr-1.5 text-[11px] font-semibold tracking-tight transition-colors",
                        active === c.id ? "text-ink" : "text-muted hover:text-ink",
                      )}
                      style={{
                        borderColor:
                          active === c.id
                            ? RISK_VAR[col.meta.level]
                            : `color-mix(in oklab, ${RISK_VAR[col.meta.level]} 28%, transparent)`,
                        background:
                          active === c.id
                            ? `color-mix(in oklab, ${RISK_VAR[col.meta.level]} 18%, transparent)`
                            : "transparent",
                      }}
                    >
                      <ChainMark chainId={c.id} ticker={c.ticker} level={col.meta.level} />
                      <span className="mono min-w-0 flex-1 truncate text-left">
                        {c.ticker === "—" ? c.name.slice(0, 5) : c.ticker}
                      </span>
                      {/* Never colour alone: this is a shape, and the inspector
                          and the footnote both say it in words. */}
                      {moves && (
                        <span
                          className="size-1 shrink-0 rounded-full"
                          style={{ background: "var(--accent)" }}
                          aria-hidden
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t pt-2.5">
        <span className="text-[11px] text-faint">
          <span
            className="mr-1.5 inline-block size-1 align-middle rounded-full"
            style={{ background: "var(--accent)" }}
            aria-hidden
          />
          {movers} of {chains.length} chains change grade depending on the product
        </span>
      </div>
      <p className="sans mt-1.5 text-[11px] leading-relaxed text-faint">
        Grades come from the model on the Method page and move with the deployment profile above.
        Within a column the order is by how likely you are to meet the chain, because chains sharing
        a grade are not separable by the model.
      </p>
    </section>
  );
}
