import type { Band, DimensionId, Level } from "./types";

// ---------------------------------------------------------------
// The framework, as data.
//
// The Methodology view, the rosette labels and the band-derivation logic all
// read from here so there is one definition of each dimension, level and band.
// ---------------------------------------------------------------

export interface DimensionDef {
  id: DimensionId;
  /** Short label used in tables and the rosette legend. */
  label: string;
  /** The compliance question this dimension answers. */
  question: string;
  /** What the clear (green) end looks like. */
  clear: string;
  /** What the elevated (red) end looks like. */
  elevated: string;
}

/** Order matters: it fixes the rosette wedge order (clockwise from top). */
export const DIMENSIONS: DimensionDef[] = [
  {
    id: "traceability",
    label: "Traceability",
    question: "Can transaction flows be followed on this chain?",
    clear: "Fully transparent public ledger, no anonymity-enhancing technology.",
    elevated:
      "Privacy by default (ring signatures, shielded pools) that defeats analytics.",
  },
  {
    id: "coverage",
    label: "Analytics coverage",
    question: "Do the major blockchain-intelligence providers support it?",
    clear:
      "Covered by Chainalysis, TRM and Elliptic with mature attribution and screening.",
    elevated: "Unsupported by the major providers; tracing is infeasible at scale.",
  },
  {
    id: "illicit",
    label: "Illicit exposure",
    question: "How concentrated is known illicit and sanctioned activity here?",
    clear: "Illicit share is low relative to legitimate volume.",
    elevated:
      "Disproportionate concentration of illicit, sanctioned or blacklisted-address activity.",
  },
  {
    id: "controls",
    label: "Asset controls",
    question: "Can assets be frozen, seized or permissioned when incidents occur?",
    clear:
      "Mature native and token-level freeze / seize controls with real enforcement precedent.",
    elevated: "No practical controls; assets are effectively immutable once sent.",
  },
  {
    id: "travelRule",
    label: "Travel Rule & identity",
    question: "Can originator and beneficiary identity be attached to transfers?",
    clear: "Broad VASP coverage, Travel Rule support and identity / credential tooling.",
    elevated: "No Travel Rule or identity infrastructure in practice.",
  },
  {
    id: "accountability",
    label: "Accountability",
    question: "Is there a reachable, accountable operator and clear jurisdiction?",
    clear:
      "Accountable operator or foundation, clear jurisdiction, responsive governance, no sanctions nexus.",
    elevated:
      "Anonymous or ungoverned, or infrastructure with a sanctions nexus.",
  },
  {
    // Added 18 August 2026 after user feedback: a chain whose founders or
    // operators sit in sustained adverse reporting carries a risk the other six
    // factors did not surface. Distinct from illicit exposure (which measures
    // activity on the chain) and from accountability (which asks whether an
    // operator can be reached): this factor asks what credible reporting says
    // about the network and the people behind it.
    id: "adverseMedia",
    label: "Adverse media",
    question:
      "Is there sustained credible adverse reporting about the network or the organisations and people behind it?",
    clear: "No sustained adverse reporting; coverage is product and market news.",
    elevated:
      "Sustained, current adverse reporting tying the network or its principals to financial crime, enforcement or sanctions.",
  },
];

export const DIMENSION_BY_ID: Record<DimensionId, DimensionDef> = Object.fromEntries(
  DIMENSIONS.map((d) => [d.id, d]),
) as Record<DimensionId, DimensionDef>;

export interface LevelDef {
  id: Level;
  label: string;
  /** Plain meaning for the legend. */
  meaning: string;
}

export const LEVELS: LevelDef[] = [
  {
    id: "clear",
    label: "Clear",
    // Deliberately not "low risk". A clear rating is a statement about one
    // question, and a chain can be clear on all seven and still carry risk this
    // framework does not ask about, which is why every chain also publishes
    // what remains.
    meaning: "No material gap found on this one factor. A clear result describes this factor alone, and says nothing about the chain as a whole.",
  },
  { id: "caution", label: "Caution", meaning: "A gap that can be managed with additional work." },
  { id: "elevated", label: "Elevated", meaning: "Material financial-crime concern." },
];

export const LEVEL_BY_ID: Record<Level, LevelDef> = Object.fromEntries(
  LEVELS.map((l) => [l.id, l]),
) as Record<Level, LevelDef>;

export interface BandDef {
  id: Band;
  label: string;
  /** The one-line verdict for a compliance reader. */
  verdict: string;
  /** How the band is reached — stated so it is not a black box. */
  rule: string;
}

export const BANDS: BandDef[] = [
  {
    id: "established",
    label: "Use it",
    verdict:
      "Activity on this chain can be observed, screened and acted on, so standard financial crime controls are generally sufficient.",
    rule: "Grades A and B under the current profile: a low weighted score with no cap applied.",
  },
  {
    id: "conditional",
    label: "Use it carefully",
    verdict:
      "The chain is workable, but it carries named gaps that additional controls would need to cover.",
    rule: "Grades C and D: gaps that fall short of Established but no hard stop.",
  },
  {
    id: "high-risk",
    label: "Think hard",
    verdict:
      "Too little of what happens on this chain can be observed or controlled, and most firms are likely to conclude it falls outside their appetite.",
    rule: "Grade E, which includes any chain where Traceability or Analytics coverage is Elevated, because a chain that cannot be seen or screened is capped there whatever the rest of its profile says.",
  },
];

export const BAND_BY_ID: Record<Band, BandDef> = Object.fromEntries(
  BANDS.map((b) => [b.id, b]),
) as Record<Band, BandDef>;

