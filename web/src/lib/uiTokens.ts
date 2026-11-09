import type { CSSProperties } from "react";
import type { Band, Category, Level, Relevance } from "../content/types";

// ---------------------------------------------------------------
// Visual tokens — terminal / instrument panel, theme-driven.
//
// Colour lives in CSS custom properties (see index.css), so the same tokens
// serve both the dark-native and the light "daylight" theme. The risk colours
// are variables too, which lets the SVG rosette and gauges adapt automatically.
// ---------------------------------------------------------------

/** The CSS variable that carries each level's colour, per the active theme. */
export const RISK_VAR: Record<Level, string> = {
  clear: "var(--clear)",
  caution: "var(--caution)",
  elevated: "var(--elevated)",
};

export const RISK_LABEL: Record<Level, string> = {
  clear: "Clear",
  caution: "Caution",
  elevated: "Elevated",
};

/** A filled indicator dot. */
export function dotStyle(level: Level): CSSProperties {
  return { background: RISK_VAR[level] };
}

/** A pill chip: coloured text + a faint tint of the same colour + hairline ring. */
export function chipStyle(level: Level): CSSProperties {
  const c = RISK_VAR[level];
  return {
    color: c,
    background: `color-mix(in oklab, ${c} 14%, transparent)`,
    borderColor: `color-mix(in oklab, ${c} 40%, transparent)`,
  };
}

/** Just the coloured text. */
export function textStyle(level: Level): CSSProperties {
  return { color: RISK_VAR[level] };
}

/** Bands borrow the risk palette: Established=clear, Conditional=caution, High-risk=elevated. */
export const BAND_LEVEL: Record<Band, Level> = {
  established: "clear",
  conditional: "caution",
  "high-risk": "elevated",
};

export const BAND_LABEL: Record<Band, string> = {
  established: "Use it",
  conditional: "Use it carefully",
  "high-risk": "Think hard",
};

export function bandChipStyle(band: Band): CSSProperties {
  return chipStyle(BAND_LEVEL[band]);
}

export const CATEGORY_LABEL: Record<Category, string> = {
  l1: "L1",
  l2: "L2",
  payment: "PAYMENT",
  privacy: "PRIVACY",
};

// --- Exposure tiers ---------------------------------------------------------
// How likely a regulated firm is to meet a chain. Deliberately NOT on the risk
// palette: relevance is not risk, and colouring it green to red would say a
// mainstream chain is safe and a niche one is dangerous, which is the opposite
// of what several of these entries mean.

export const RELEVANCE_LABEL: Record<Relevance, string> = {
  mainstream: "Mainstream",
  emerging: "Emerging",
  niche: "Niche",
  restricted: "Restricted",
};

export const RELEVANCE_ORDER: Record<Relevance, number> = {
  mainstream: 0,
  emerging: 1,
  restricted: 2,
  niche: 3,
};

export const RELEVANCE_BLURB: Record<Relevance, string> = {
  mainstream:
    "A regulated firm is likely to face this chain today, through its own products or through customer activity.",
  emerging:
    "Real and growing, or backed by named institutions, but not yet something most firms have to handle.",
  niche: "Rated for completeness. Little or no regulated-firm footprint.",
  restricted:
    "Highly relevant, but met as something to exclude rather than deploy on. Delisting and anonymity-enhancing-asset rules apply.",
};

/** Filled for mainstream, quieter as the footprint thins; restricted is outlined. */
export function relevanceStyle(tier: Relevance): CSSProperties {
  if (tier === "restricted") {
    return {
      color: "var(--elevated)",
      borderColor: "color-mix(in oklab, var(--elevated) 40%, transparent)",
      background: "transparent",
    };
  }
  const strength = tier === "mainstream" ? 100 : tier === "emerging" ? 62 : 38;
  return {
    color: `color-mix(in oklab, var(--ink) ${strength}%, var(--faint))`,
    borderColor: "var(--line)",
    background: "transparent",
  };
}

export const CATEGORY_LONG: Record<Category, string> = {
  l1: "Layer 1",
  l2: "Layer 2",
  payment: "Payment ledger",
  privacy: "Privacy chain",
};
