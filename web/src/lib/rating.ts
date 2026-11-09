import type { Band, Chain, DimensionId, Level } from "../content/types";
import { DIMENSIONS } from "../content/methodology";
import { DEFAULT_PROFILE, scoreChain, type Profile } from "./model";

// ---------------------------------------------------------------
// Rating helpers. The band and the concern score are now produced by the
// quantitative model (lib/model.ts), which is profile-aware. These thin wrappers
// keep the call sites simple and default to the balanced profile.
// ---------------------------------------------------------------

export function levelsOf(chain: Chain): Level[] {
  return DIMENSIONS.map((d) => chain.ratings[d.id].level);
}

/** Headline posture band for a chain under a deployment profile. */
export function deriveBand(chain: Chain, profile: Profile = DEFAULT_PROFILE): Band {
  return scoreChain(chain, profile).band;
}

/** 0–100 risk score (0 = lowest financial-crime risk) under a profile. */
export function concernIndex(chain: Chain, profile: Profile = DEFAULT_PROFILE): number {
  return scoreChain(chain, profile).score;
}

const BAND_ORDER: Record<Band, number> = { established: 0, conditional: 1, "high-risk": 2 };

/** A comparator for a given profile: safest first, then by score, then name. */
export function byRisk(profile: Profile = DEFAULT_PROFILE) {
  return (a: Chain, b: Chain): number => {
    const sa = scoreChain(a, profile);
    const sb = scoreChain(b, profile);
    const byBand = BAND_ORDER[sa.band] - BAND_ORDER[sb.band];
    if (byBand !== 0) return byBand;
    if (sa.score !== sb.score) return sa.score - sb.score;
    return a.name.localeCompare(b.name);
  };
}

// ---- Rosette geometry --------------------------------------------------------

export interface Wedge {
  id: DimensionId;
  /** SVG path for a donut sector, in a `size`×`size` viewBox. */
  d: string;
}

function polar(cx: number, cy: number, r: number, angleDeg: number): [number, number] {
  const a = ((angleDeg - 90) * Math.PI) / 180; // 0deg = 12 o'clock, clockwise
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

/**
 * Seven donut sectors, clockwise from the top, in DIMENSIONS order. The caller
 * fills each with the matching level colour. `gap` leaves a hairline between
 * wedges so they read as distinct segments.
 */
export function rosetteWedges(size = 100, innerRatio = 0.52, gap = 2): Wedge[] {
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size / 2;
  const rInner = rOuter * innerRatio;
  const n = DIMENSIONS.length;
  const step = 360 / n;
  const half = gap / 2;

  return DIMENSIONS.map((dim, i) => {
    const start = i * step + half;
    const end = (i + 1) * step - half;
    const [ox1, oy1] = polar(cx, cy, rOuter, start);
    const [ox2, oy2] = polar(cx, cy, rOuter, end);
    const [ix2, iy2] = polar(cx, cy, rInner, end);
    const [ix1, iy1] = polar(cx, cy, rInner, start);
    const large = end - start > 180 ? 1 : 0;
    const d = [
      `M ${ox1.toFixed(2)} ${oy1.toFixed(2)}`,
      `A ${rOuter} ${rOuter} 0 ${large} 1 ${ox2.toFixed(2)} ${oy2.toFixed(2)}`,
      `L ${ix2.toFixed(2)} ${iy2.toFixed(2)}`,
      `A ${rInner} ${rInner} 0 ${large} 0 ${ix1.toFixed(2)} ${iy1.toFixed(2)}`,
      "Z",
    ].join(" ");
    return { id: dim.id, d };
  });
}
