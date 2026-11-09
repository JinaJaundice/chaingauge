import type { Chain, DimensionId, Rating } from "../content/types";

// ---------------------------------------------------------------
// The second question.
//
// The site was built for "should we deploy on this chain". A reviewer working as
// an MLRO was asked something else entirely: a relationship manager wanted to
// know whether they could bank a client whose funds came from Hyperliquid. They
// got a defensible answer, but had to translate the deployment factors into a
// source-of-funds question themselves.
//
// This does that translation, and nothing more. It invents no ratings and adds
// no data: every line below is derived from a factor level that is already
// published and already sourced, restated for the case where the money has
// already moved and the chain was somebody else's choice.
//
// WHAT THIS DELIBERATELY DOES NOT DO: it does not tell a firm what to ask a
// customer for, when to escalate, or when to file. That is a regulated judgement
// belonging to the firm and its MLRO, it depends on facts this site cannot see,
// and a public site nudging it would be wrong regardless of how useful it felt.
// The line held here is between a consequence and an instruction: "there is no // operator to send an information request to" is a fact about the chain, while
// "therefore file" is not ours to say.
// ---------------------------------------------------------------

export interface Consequence {
  id: DimensionId;
  /** The question this factor answers once funds have already moved. */
  question: string;
  /** What this chain's rating means for that question. */
  answer: string;
  level: Rating["level"];
  /** True when the rating rests on no track record, so the answer is weaker. */
  unmeasured: boolean;
}

type ByLevel = { clear: string; caution: string; elevated: string };

const QUESTION: Record<DimensionId, string> = {
  traceability: "Can you reconstruct where the money came from?",
  coverage: "Will your analytics provider tell you anything about it?",
  illicit: "How much should an exposure finding surprise you?",
  controls: "If it needs freezing, who can do it?",
  travelRule: "Should the sending firm hold originator information?",
  accountability: "Is there anyone to send an information request to?",
  adverseMedia: "What will adverse media screening return on the chain itself?",
};

const ANSWER: Record<DimensionId, ByLevel> = {
  traceability: {
    clear:
      "Yes. The ledger is transparent, so the path into your customer's wallet can be walked back through prior hops without relying on what anybody tells you.",
    caution:
      "Partly. Most of the path is readable, but this chain has features that can break the trail, so expect stretches you cannot reconstruct from the ledger alone.",
    elevated:
      "No. The chain hides the flow by design, so source of funds has to come from the customer and their counterparties, because the ledger will not give it.",
  },
  coverage: {
    clear:
      "Yes. The major providers index this chain with real attribution depth, so a screen should return something you can act on.",
    caution:
      "Less than you are used to. The chain is indexed but attribution is thinner, so a clean screen here is weaker evidence than a clean screen on a major rail.",
    elevated:
      "Little or nothing. Do not treat a clean screen on this chain as evidence of anything.",
  },
  illicit: {
    clear:
      "Not much concentration of illicit activity here, so a finding is worth taking seriously, never as background noise.",
    caution:
      "Enough concentration that exposure findings are common. A hit is not on its own remarkable, and the size and directness of it matter more than its existence.",
    elevated:
      "High concentration. Expect findings, and treat the absence of one as a question about your tooling, never as reassurance.",
  },
  controls: {
    clear:
      "The issuer of the asset involved has frozen funds on this chain before, so there is a route that has been used.",
    caution:
      "Only the asset issuer; the chain itself freezes nothing. Whether anything can be frozen depends on which token the funds are in, wherever they moved.",
    elevated: "Nobody. Nothing on this chain can be frozen or clawed back.",
  },
  travelRule: {
    clear:
      "Probably, for a hop between two regulated firms. The tooling is widely deployed on this chain.",
    caution:
      "Do not assume it. Travel Rule coverage here is uneven, so the sending firm may hold nothing even where it should.",
    elevated:
      "No. There is no practical way to attach or obtain originator and beneficiary data on this chain.",
  },
  accountability: {
    clear:
      "Yes. There is a named, reachable operator, so a request for information has an addressee.",
    caution:
      "In principle. An entity exists but its jurisdiction or its willingness to answer makes a request an uncertain route.",
    elevated:
      "No. There is no regulated operator to serve or to ask, so anything you learn has to come from the ledger and from your customer.",
  },
  adverseMedia: {
    clear:
      "Probably little. The network and the organisations behind it do not sit in sustained adverse coverage, so a media hit on the chain's name alone would be unusual.",
    caution:
      "Some. The network or the people behind it carry notable adverse coverage, so expect screening to return items about the chain's own ecosystem, separate from anything about your customer.",
    elevated:
      "A lot. The network or its principals sit in sustained adverse reporting, so screening will return material on the chain's own name, separate from anything about your customer.",
  },
};

/**
 * The seven factors restated for the case where funds have already arrived.
 *
 * Ordered by how much the rating constrains the enquiry, worst first, because
 * the point of the readout is what to go and do something about.
 */
export function sourceOfFundsView(chain: Chain): Consequence[] {
  const rank = { elevated: 0, caution: 1, clear: 2 } as const;
  return (Object.keys(QUESTION) as DimensionId[])
    .map((id) => {
      const rating = chain.ratings[id];
      const unmeasured = rating.basis === "no-record";
      let answer = ANSWER[id][rating.level];
      if (unmeasured) {
        answer += " That reading rests on the chain having no track record yet, so it is an absence of evidence, short of a clean result.";
      }
      return { id, question: QUESTION[id], answer, level: rating.level, unmeasured };
    })
    .sort((a, b) => rank[a.level] - rank[b.level]);
}

/** The one line to lead with: the factor that most constrains the enquiry. */
export function bindingConstraint(chain: Chain): Consequence {
  return sourceOfFundsView(chain)[0];
}
