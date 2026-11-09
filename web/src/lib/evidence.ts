import type { Chain, DimensionId } from "../content/types";
import { DIMENSIONS } from "../content/methodology";
import { resolveWeights, type Profile } from "./model";

// ---------------------------------------------------------------
// How much of a grade rests on evidence, and how much on our say-so.
//
// A reviewer comparing Stellar, Ethereum and Avalanche for a tokenised money
// market fund found Stellar ahead, 0 against 5, and then found the whole gap sat
// on one factor: illicit exposure, rated clear on Stellar with no source, while
// Ethereum and Avalanche both carried a Chainalysis citation and were rated
// WORSE. Their conclusion was the right one. That is not a number to put in a
// paper as "ChainGauge says 0".
//
// The defect is an incentive, and it is backwards: an unsourced `clear` is
// cheaper than a sourced `caution`, so a chain nobody has published data about
// beats one where somebody measured a problem. Absence of evidence pays.
//
// The fix is NOT to penalise unsourced factors in the score. That would blend
// two different things, how risky the chain is and how well we know it, into one
// number, and the model's whole value is that it is a transparent sum of
// severities times weights. Instead the evidence strength is published beside
// the score as its own figure, so a reader can discount it themselves. Same move
// as `basis` on a rating: keep the judgement, expose the ground it stands on.
// ---------------------------------------------------------------

export interface Evidence {
  /** Share of the score's weight carried by factors with a published source. */
  sourcedShare: number;
  /**
   * Share of the score's weight carried by factors that are rated `clear` with
   * no source. This is the sharp one: it is the part of the chain's good news
   * that nobody has published evidence for.
   */
  unevidencedShare: number;
  /** The clear-and-unsourced factors, heaviest under this profile first. */
  weakest: { id: DimensionId; weight: number }[];
}

export function evidenceFor(chain: Chain, profile: Profile): Evidence {
  const weights = resolveWeights(profile);
  let sourced = 0;
  let unevidenced = 0;
  const weakest: { id: DimensionId; weight: number }[] = [];

  for (const d of DIMENSIONS) {
    const rating = chain.ratings[d.id];
    const w = weights[d.id];
    if (rating.sources.length > 0) {
      sourced += w;
    } else if (rating.level === "clear") {
      unevidenced += w;
      weakest.push({ id: d.id, weight: w });
    }
  }

  weakest.sort((a, b) => b.weight - a.weight);
  return { sourcedShare: sourced, unevidencedShare: unevidenced, weakest };
}

export interface Caveat {
  /** The factor doing the most to separate the two chains. */
  id: DimensionId;
  /** The chain the factor favours. */
  betterId: string;
  worseId: string;
  /** Set when the favoured side's rating carries no source. */
  unsourcedOnBetterSide: boolean;
}

/**
 * What is actually separating two chains, and whether that thing is evidenced.
 *
 * This is the reviewer's finding generalised. Comparing chains is the moment the
 * question stops being "how risky is this" and becomes "why is this one ahead",
 * and at that moment it matters enormously whether the deciding factor rests on
 * a published source or on our own read.
 *
 * Returns null when the two do not differ on any factor.
 */
export function decidingFactor(a: Chain, b: Chain, profile: Profile): Caveat | null {
  const weights = resolveWeights(profile);
  const severity = { clear: 0, caution: 50, elevated: 100 } as const;

  let best: Caveat | null = null;
  let bestGap = 0;

  for (const d of DIMENSIONS) {
    const sa = severity[a.ratings[d.id].level];
    const sb = severity[b.ratings[d.id].level];
    if (sa === sb) continue;
    const gap = Math.abs(sa - sb) * weights[d.id];
    if (gap <= bestGap) continue;

    const better = sa < sb ? a : b;
    const worse = sa < sb ? b : a;
    bestGap = gap;
    best = {
      id: d.id,
      betterId: better.id,
      worseId: worse.id,
      unsourcedOnBetterSide: better.ratings[d.id].sources.length === 0,
    };
  }

  return best;
}
