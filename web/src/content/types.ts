// ---------------------------------------------------------------
// One content model, many views.
//
// Every tracked thing is a `Chain`. Each tab (Overview, Matrix,
// Methodology, the chain drill-down) is a filtered or reshaped view over
// the single store in `content/chains.ts`. Adding a chain is one entry in
// that array — never new plumbing. The posture band is never stored: it is
// derived from the ratings by `deriveBand` in `lib/rating.ts`, so the
// headline can never drift out of sync with the rosette.
// ---------------------------------------------------------------

/**
 * `Level` is the concern level for a single dimension, normalised so `clear`
 * always means LOWER financial-crime concern even for "less is better"
 * dimensions like illicit exposure, which keeps the rosette readable.
 * `DimensionId` is the stable union of the seven factors, shared by the store,
 * the rosette geometry and the Methodology view.
 *
 * Both are defined in `api/_lib/submission.ts` and re-exported here. The
 * serverless function needs them and cannot import from this tree, so the
 * definition lives on the side that has the harder constraint.
 */
import type { Level, DimensionId } from "@shared/submission";

export type { Level, DimensionId };

/** Headline posture, derived from the rosette (see lib/rating.ts). */
export type Band = "established" | "conditional" | "high-risk";

export type Category = "l1" | "l2" | "payment" | "privacy";

/**
 * How likely a regulated firm is to meet this chain. A rating is only useful if
 * it covers the rails people are actually asked about, so every chain states
 * its footprint and the evidence for it rather than leaving the reader to guess
 * whether an entry matters.
 *
 * `restricted` is not a smaller version of `niche`: those chains are highly
 * relevant, but a firm meets them as something to exclude rather than deploy.
 */
export type Relevance = "mainstream" | "emerging" | "niche" | "restricted";

export interface Exposure {
  tier: Relevance;
  /** One line: where a compliance team actually meets this chain. */
  where: string;
  /** The usage figure or footprint that justifies the tier. */
  scale: Stat;
}

export interface Source {
  name: string;
  url?: string;
  /** primary = the originating data/document; secondary = reporting about it. */
  kind?: "primary" | "secondary";
}

/**
 * Why we hold a level, which is a different question from what the level is.
 *
 * `observed` means there is a track record and it supports the level.
 * `no-record` means there is not enough history to say, and the level reflects
 * the absence of evidence rather than evidence of absence.
 *
 * The distinction exists because a reviewer reading the site as an MLRO would
 * pointed it out: a four-month-old chain showed Clear on illicit exposure, and
 * the badge looked exactly like Bitcoin's, which has fifteen years of measured
 * data behind it. The small print said "too young for a track record" but the
 * green badge was what a reader skimming under time pressure would take away.
 * Absence of evidence must not render as evidence of absence.
 */
export type Basis = "observed" | "no-record";

export interface Rating {
  level: Level;
  /** One line: why this level. Concrete, and sourced where it is a hard fact. */
  rationale: string;
  /** Empty for a purely assessed judgement (labelled as such in the UI). */
  sources: Source[];
  /** Defaults to `observed` when absent. Only set it where it is not. */
  basis?: Basis;
}

/**
 * A financial-crime data point shown on the chain detail readout. Some are hard
 * figures with a source (money stolen, frozen value, blacklisted addresses),
 * others are structured facts that also feed the rating (analytics coverage,
 * privacy tech, native controls). `level` optionally tints the value.
 */
export interface Stat {
  label: string;
  value: string;
  level?: Level;
  source?: Source;
}

export interface Chain {
  id: string;
  name: string;
  ticker: string;
  category: Category;
  /** Where a regulated firm meets this chain, and the evidence for it. */
  exposure: Exposure;
  /**
   * What remains after the seven factors, in one line. Required on every chain,
   * with no exceptions and no empty strings.
   *
   * Seven clear ratings mean no material gap was found on those seven questions. It
   * does not mean the chain is safe, and a table that renders "no material gap"
   * with nothing beside it tells a reader it does. Every chain carries residual
   * financial-crime risk, so every chain has to say what its is.
   */
  residual: { note: string; sources: Source[] };
  /** Short, verifiable facts shown in the detail header. */
  facts: {
    consensus: string;
    model: string; // e.g. "UTXO", "EVM L1", "Optimistic rollup (L2)"
    launched: string; // year
    /** Who runs / stewards it, and where — the accountability anchor. */
    steward: string;
  };
  /** 1–2 sentence headline synthesis in the compliance lens. */
  summary: string;
  /** What a team should weigh before deploying on this chain. */
  deployment: string;
  /** Financial-crime data points shown on the detail readout. */
  stats: Stat[];
  ratings: Record<DimensionId, Rating>;
  /** When this assessment was last reviewed (ISO yyyy-mm-dd). */
  asAt: string;
  /**
   * When THIS CHAIN'S ratings were last examined, which is not the same as when
   * the file was last edited.
   *
   * All 51 chains previously shared one date, so a chain rated once and never
   * revisited claimed the same freshness as one re-examined last week. That
   * overstates how current the older entries are, and freshness is exactly the
   * thing a reader is trusting when they take a rating at face value.
   */
  reviewed?: string;
}
