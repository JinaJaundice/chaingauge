import type { Band, Chain, DimensionId, Level } from "../content/types";
import { DIMENSIONS } from "../content/methodology";

// ---------------------------------------------------------------
// The quantitative risk model.
//
// A transparent, product-aware scoring model in the spirit of a credit rating.
// Each of the seven factors carries an ordinal severity (0 / 50 / 100). A weight
// vector, chosen by the product and customer you are deploying for, combines the
// severities into a 0–100 risk score (0 = lowest financial-crime risk). Two hard
// caps stop a weighting from hiding a critical failure. The score maps to a
// letter grade A–E. Everything here is pure and shown in full on the chain page.
// ---------------------------------------------------------------

export type Grade = "A" | "B" | "C" | "D" | "E";

export type ProductProfile =
  | "balanced"
  | "payments"
  | "securities"
  | "custody"
  | "exchange"
  | "defi";

export type CustomerProfile = "mixed" | "retail" | "institutional";

export interface Profile {
  product: ProductProfile;
  customer: CustomerProfile;
}

export const DEFAULT_PROFILE: Profile = { product: "balanced", customer: "mixed" };

// Ordinal severity per level. The inputs are deliberately ordinal (an assessed
// three-level rating), so the model does not invent false precision; the
// nuance comes from the weighting and the caps, not from the input scale.
export const SEVERITY: Record<Level, number> = { clear: 0, caution: 50, elevated: 100 };

// The four pillars the seven factors roll up into, used by the breakdown views.
export const PILLARS: { id: string; label: string; factors: DimensionId[] }[] = [
  { id: "visibility", label: "Visibility", factors: ["traceability", "coverage"] },
  { id: "exposure", label: "Exposure", factors: ["illicit"] },
  { id: "control", label: "Control", factors: ["controls", "travelRule"] },
  { id: "integrity", label: "Integrity", factors: ["accountability", "adverseMedia"] },
];

// Base weight vectors per product. Each roughly sums to 1; resolveWeights
// normalises after the customer modifier, so they need not be exact.
// Adverse media (added 18 Aug 2026) carries a deliberately modest weight:
// it is a reputational signal about the people and organisations behind a
// chain, and it must inform the grade without being able to outweigh the
// visibility and control factors a screening decision actually turns on.
export const PRODUCT_WEIGHTS: Record<ProductProfile, Record<DimensionId, number>> = {
  balanced: { traceability: 0.22, coverage: 0.2, illicit: 0.18, controls: 0.15, travelRule: 0.12, accountability: 0.13, adverseMedia: 0.1 },
  payments: { traceability: 0.18, coverage: 0.16, illicit: 0.2, controls: 0.22, travelRule: 0.14, accountability: 0.1, adverseMedia: 0.08 },
  securities: { traceability: 0.15, coverage: 0.13, illicit: 0.12, controls: 0.22, travelRule: 0.18, accountability: 0.2, adverseMedia: 0.12 },
  custody: { traceability: 0.24, coverage: 0.22, illicit: 0.2, controls: 0.12, travelRule: 0.12, accountability: 0.1, adverseMedia: 0.08 },
  exchange: { traceability: 0.22, coverage: 0.2, illicit: 0.2, controls: 0.1, travelRule: 0.16, accountability: 0.12, adverseMedia: 0.12 },
  defi: { traceability: 0.24, coverage: 0.22, illicit: 0.22, controls: 0.08, travelRule: 0.1, accountability: 0.14, adverseMedia: 0.08 },
};

// Customer modifiers multiply the product weights, then everything is renormalised.
export const CUSTOMER_MULT: Record<CustomerProfile, Record<DimensionId, number>> = {
  mixed: { traceability: 1, coverage: 1, illicit: 1, controls: 1, travelRule: 1, accountability: 1, adverseMedia: 1 },
  retail: { traceability: 1.05, coverage: 1.05, illicit: 1.15, controls: 0.95, travelRule: 1.1, accountability: 0.95, adverseMedia: 1 },
  institutional: { traceability: 1, coverage: 1, illicit: 0.95, controls: 1.15, travelRule: 1.05, accountability: 1.15, adverseMedia: 1.1 },
};

export const PRODUCT_META: Record<
  ProductProfile,
  { label: string; short: string; blurb: string }
> = {
  balanced: { label: "Balanced", short: "Balanced", blurb: "A general view with no product emphasis." },
  payments: { label: "Payments / stablecoin", short: "Payments", blurb: "Weights asset controls, illicit exposure and traceability." },
  securities: { label: "Tokenised securities", short: "Securities", blurb: "Weights asset controls, identity and accountability." },
  custody: { label: "Custody / wallet", short: "Custody", blurb: "Weights traceability, coverage and illicit exposure." },
  exchange: { label: "Exchange listing", short: "Exchange", blurb: "Weights traceability, coverage, illicit and the Travel Rule." },
  defi: { label: "DeFi / smart contract", short: "DeFi", blurb: "Weights visibility and illicit exposure; asset controls matter less." },
};

export const CUSTOMER_META: Record<CustomerProfile, { label: string; blurb: string }> = {
  mixed: { label: "Mixed", blurb: "No customer-base emphasis." },
  retail: { label: "Retail", blurb: "Leans on illicit exposure and the Travel Rule." },
  institutional: { label: "Institutional", blurb: "Leans on asset controls and accountability." },
};

/** Resolve the normalised weight vector for a profile (weights sum to 1). */
export function resolveWeights(profile: Profile): Record<DimensionId, number> {
  const base = PRODUCT_WEIGHTS[profile.product];
  const mult = CUSTOMER_MULT[profile.customer];
  const raw: Record<string, number> = {};
  let total = 0;
  for (const d of DIMENSIONS) {
    raw[d.id] = base[d.id] * mult[d.id];
    total += raw[d.id];
  }
  const out: Record<string, number> = {};
  for (const d of DIMENSIONS) out[d.id] = raw[d.id] / total;
  return out as Record<DimensionId, number>;
}

const GRADE_META: Record<Grade, { label: string; level: Level }> = {
  A: { label: "Strong", level: "clear" },
  B: { label: "Good", level: "clear" },
  C: { label: "Mixed", level: "caution" },
  D: { label: "Weak", level: "elevated" },
  E: { label: "Poor", level: "elevated" },
};

export function gradeMeta(grade: Grade) {
  return GRADE_META[grade];
}

// Score thresholds (0 = safest). Tuned so the balanced profile gives a sensible
// spread and the caps carry the critical cases.
function gradeFromScore(score: number): Grade {
  if (score < 12) return "A";
  if (score < 26) return "B";
  if (score < 44) return "C";
  if (score < 62) return "D";
  return "E";
}

export function bandFromGrade(grade: Grade): Band {
  if (grade === "A" || grade === "B") return "established";
  if (grade === "E") return "high-risk";
  return "conditional";
}

export interface FactorScore {
  id: DimensionId;
  severity: number;
  weight: number;
  contribution: number;
}

export interface Cap {
  floor: number;
  reason: string;
}

export interface ChainScore {
  factors: FactorScore[];
  rawScore: number;
  cap: Cap | null;
  score: number;
  grade: Grade;
  band: Band;
  /** Factors ranked by contribution to the score (the key risk drivers). */
  drivers: FactorScore[];
  weights: Record<DimensionId, number>;
}

/**
 * Score a chain for a given deployment profile. Pure and fully transparent: the
 * returned object carries the weights, the per-factor contributions, any cap
 * applied, the raw and final scores, and the grade.
 */
export function scoreChain(chain: Chain, profile: Profile = DEFAULT_PROFILE): ChainScore {
  const weights = resolveWeights(profile);
  const factors: FactorScore[] = DIMENSIONS.map((d) => {
    const severity = SEVERITY[chain.ratings[d.id].level];
    const weight = weights[d.id];
    return { id: d.id, severity, weight, contribution: weight * severity };
  });
  const rawScore = factors.reduce((s, f) => s + f.contribution, 0);

  // Hard caps stop a weighting from hiding a critical failure.
  const elevated = DIMENSIONS.filter((d) => chain.ratings[d.id].level === "elevated").length;
  const visBlind =
    chain.ratings.traceability.level === "elevated" || chain.ratings.coverage.level === "elevated";
  let cap: Cap | null = null;
  if (visBlind) {
    cap = { floor: 66, reason: "Critical visibility failure: the chain cannot be reliably traced or screened." };
  } else if (elevated >= 2) {
    cap = { floor: 46, reason: "Two or more elevated factors compound the risk." };
  }

  const score = cap ? Math.max(rawScore, cap.floor) : rawScore;
  const grade = gradeFromScore(score);
  const drivers = [...factors].sort((a, b) => b.contribution - a.contribution);

  return {
    factors,
    rawScore: Math.round(rawScore * 10) / 10,
    cap: cap && cap.floor > rawScore ? cap : null,
    score: Math.round(score),
    grade,
    band: bandFromGrade(grade),
    drivers,
    weights,
  };
}

/** Pillar severities (0–100, unweighted within a pillar) for the landscape/breakdown views. */
export function pillarSeverity(chain: Chain): Record<string, number> {
  const out: Record<string, number> = {};
  for (const p of PILLARS) {
    const vals = p.factors.map((f) => SEVERITY[chain.ratings[f].level]);
    out[p.id] = vals.reduce((a, b) => a + b, 0) / vals.length;
  }
  return out;
}
