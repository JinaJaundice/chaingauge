import type { Chain } from "../content/types";
import { DIMENSIONS } from "../content/methodology";
import { CUSTOMER_META, PRODUCT_META, scoreChain, type Profile } from "./model";

// ---------------------------------------------------------------
// Assessment exports. Pure builders (unit-tested) that serialise the model's
// output — the same numbers shown on screen — so a compliance team can file
// the assessment as due-diligence evidence. The download helper is the only
// DOM-touching piece.
// ---------------------------------------------------------------

export interface ChainAssessment {
  id: string;
  name: string;
  ticker: string;
  category: string;
  asAt: string;
  grade: string;
  band: string;
  score: number;
  rawScore: number;
  cap: { floor: number; reason: string } | null;
  exposureTier: string;
  residual: string;
  factors: {
    id: string;
    label: string;
    level: string;
    severity: number;
    weight: number;
    contribution: number;
    rationale: string;
    sources: string[];
  }[];
}

export function buildAssessment(chain: Chain, profile: Profile): ChainAssessment {
  const s = scoreChain(chain, profile);
  return {
    id: chain.id,
    name: chain.name,
    ticker: chain.ticker,
    category: chain.category,
    asAt: chain.asAt,
    grade: s.grade,
    band: s.band,
    score: s.score,
    rawScore: s.rawScore,
    cap: s.cap ? { floor: s.cap.floor, reason: s.cap.reason } : null,
    exposureTier: chain.exposure.tier,
    residual: chain.residual.note,
    factors: DIMENSIONS.map((d) => {
      const f = s.factors.find((x) => x.id === d.id)!;
      const r = chain.ratings[d.id];
      return {
        id: d.id,
        label: d.label,
        level: r.level,
        severity: f.severity,
        weight: Math.round(f.weight * 1000) / 1000,
        contribution: Math.round(f.contribution * 10) / 10,
        rationale: r.rationale,
        sources: r.sources.map((src) => src.url ?? src.name),
      };
    }),
  };
}

export function buildExportJSON(chains: Chain[], profile: Profile): string {
  return JSON.stringify(
    {
      generator: "ChainGauge",
      url: "https://chaingauge.vercel.app/",
      exportedAt: new Date().toISOString().slice(0, 10),
      disclaimer:
        "An assessed view of public information; a starting point for enhanced due diligence, and no form of legal or investment advice.",
      profile: {
        product: profile.product,
        productLabel: PRODUCT_META[profile.product].label,
        customer: profile.customer,
        customerLabel: CUSTOMER_META[profile.customer].label,
      },
      chains: chains.map((c) => buildAssessment(c, profile)),
    },
    null,
    2,
  );
}

function csvCell(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function buildExportCSV(chains: Chain[], profile: Profile): string {
  const factorCols = DIMENSIONS.flatMap((d) => [`${d.id}_level`, `${d.id}_contribution`]);
  const header = [
    "id", "name", "ticker", "category", "as_at",
    "product_profile", "customer_profile",
    "grade", "band", "score", "raw_score", "cap_floor",
    "exposure_tier", "residual",
    ...factorCols,
  ];
  const rows = chains.map((c) => {
    const a = buildAssessment(c, profile);
    const factorVals = a.factors.flatMap((f) => [f.level, f.contribution]);
    return [
      a.id, a.name, a.ticker, a.category, a.asAt,
      profile.product, profile.customer,
      a.grade, a.band, a.score, a.rawScore, a.cap ? a.cap.floor : "",
      a.exposureTier, a.residual,
      ...factorVals,
    ].map(csvCell).join(",");
  });
  return [header.join(","), ...rows].join("\n");
}

/** Trigger a client-side download of a generated file. */
export function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportStamp(profile: Profile): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${profile.product}-${profile.customer}-${date}`;
}
