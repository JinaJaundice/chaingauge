import { useMemo } from "react";
import type { Chain, DimensionId } from "../content/types";
import { DIMENSION_BY_ID } from "../content/methodology";
import {
  PRODUCT_META,
  scoreChain,
  type ChainScore,
  type Grade,
  type ProductProfile,
  type Profile,
} from "../lib/model";
import { RISK_VAR } from "../lib/uiTokens";

// The per-chain charts. Theme-adaptive, drawn as SVG on a fixed viewBox with
// every mark clamped inside it. Colour follows the grade palette and is always
// paired with a label, never carried alone.
//
// The two all-chain scatters that used to live here were replaced by
// ChainGrid.tsx; see its header for why.

const gradeLevel = (g: Grade): "clear" | "caution" | "elevated" =>
  g === "A" || g === "B" ? "clear" : g === "C" ? "caution" : "elevated";

const PRODUCTS: ProductProfile[] = ["balanced", "payments", "securities", "custody", "exchange", "defi"];

export function ProfileSensitivity({ chain, customer }: { chain: Chain; customer: Profile["customer"] }) {
  // Six products are categories, and a line chart over categories on a fixed
  // 0-100 axis put every point in the top eighth of an otherwise empty plot for
  // any well-rated chain. Bars carry the same numbers, keep the absolute scale
  // so the score still means something, and cannot look empty.
  const rows = useMemo(
    () => PRODUCTS.map((p) => ({ p, s: scoreChain(chain, { product: p, customer }) })),
    [chain, customer],
  );
  const scores = rows.map((r) => r.s.score);
  const spread = Math.max(...scores) - Math.min(...scores);
  const grades = new Set(rows.map((r) => r.s.grade));

  return (
    <figure className="panel min-w-0 rounded-md p-4">
      <figcaption className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3">
        <span className="text-sm font-semibold text-ink">How the grade changes by product</span>
        <span className="text-[11px] text-faint">
          {grades.size === 1
            ? `grade ${[...grades][0]} for every product`
            : `${grades.size} different grades`}
        </span>
      </figcaption>
      <p className="sans mb-3 text-xs text-muted">
        The same chain scored for each product type, on the same 0 to 100 scale as everywhere else.
        A wide spread means suitability depends on what you build on it.
      </p>

      <ul className="space-y-1.5">
        {rows.map(({ p, s }) => {
          const level = gradeLevel(s.grade);
          return (
            <li key={p} className="flex items-center gap-2.5">
              <span className="w-20 shrink-0 text-[11px] uppercase tracking-wide text-faint">
                {PRODUCT_META[p].short}
              </span>
              <span
                className="h-2.5 flex-1 overflow-hidden rounded-full"
                style={{ background: "var(--line)" }}
              >
                <span
                  className="block h-full rounded-full"
                  style={{ width: `${Math.max(s.score, 1.5)}%`, background: RISK_VAR[level] }}
                />
              </span>
              <span
                className="w-4 shrink-0 text-right text-[11px] font-bold"
                style={{ color: RISK_VAR[level] }}
                title={`Grade ${s.grade}`}
              >
                {s.grade}
              </span>
              <span className="mono w-6 shrink-0 text-right text-[11px] tabular-nums text-muted">
                {s.score}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="sans mt-3 border-t pt-2.5 text-[11px] leading-relaxed text-faint">
        {spread === 0
          ? "The score does not move at all across the six products, so nothing about this chain depends on what you build on it."
          : `Lowest ${Math.min(...scores)}, highest ${Math.max(...scores)}, a ${spread}-point spread. 0 is the safest end of the scale.`}
      </p>
    </figure>
  );
}

export function ContributionBars({ score }: { score: ChainScore }) {
  const rows = [...score.factors].sort((a, b) => b.contribution - a.contribution);
  const max = Math.max(1, ...rows.map((r) => r.weight * 100));
  const level = (sev: number) => (sev === 100 ? "elevated" : sev === 50 ? "caution" : "clear");
  return (
    <div className="space-y-2">
      {rows.map((f) => {
        const dim = DIMENSION_BY_ID[f.id as DimensionId];
        const pct = (f.contribution / max) * 100;
        const potential = (f.weight * 100) / max;
        return (
          <div key={f.id} className="grid grid-cols-[130px_1fr_44px] items-center gap-3">
            <span className="truncate text-[11px] text-muted" title={dim.label}>{dim.label}</span>
            <div className="relative h-3 rounded-[3px]" style={{ background: "var(--line)" }}>
              <div className="absolute inset-y-0 left-0 rounded-[3px]" style={{ width: `${potential * 100}%`, background: "color-mix(in oklab, var(--muted) 12%, transparent)" }} />
              <div
                className="absolute inset-y-0 left-0 rounded-[3px]"
                style={{ width: `${Math.max(pct, 1)}%`, background: RISK_VAR[level(f.severity) as keyof typeof RISK_VAR] }}
                title={`${dim.label}: weight ${(f.weight * 100).toFixed(0)}% × severity ${f.severity} = ${f.contribution.toFixed(1)}`}
              />
            </div>
            <span className="mono text-right text-[11px] tabular-nums text-muted">{f.contribution.toFixed(1)}</span>
          </div>
        );
      })}
    </div>
  );
}
