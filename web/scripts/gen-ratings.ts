import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { CHAINS, FEED_META } from "../src/content/chains";
import { DIMENSIONS } from "../src/content/methodology";
import {
  CUSTOMER_META,
  DEFAULT_PROFILE,
  PRODUCT_META,
  resolveWeights,
  scoreChain,
} from "../src/lib/model";

// Generates public/ratings.json — the machine-readable contract other systems
// (a policy engine, a risk register, a spreadsheet) consume. Runs automatically
// before every build ("prebuild"), so the feed can never drift from the store:
// the same data and the same model produce both the UI and the feed.
//
// Shape is deliberately stable: per-chain factor levels (the raw ordinal
// inputs, so a consumer can apply its own weighting) plus the balanced-profile
// score/grade/band as the reference rating.

const out = {
  generator: "ChainGauge",
  schemaVersion: 2, // 2 (18 Aug 2026): the adverse media factor joined the seven-factor set
  url: "https://chaingauge.vercel.app/",
  methodology: "https://chaingauge.vercel.app/#/method",
  asAt: FEED_META.asAt,
  disclaimer:
    "An assessed view of public information; a starting point for enhanced due diligence, not legal or investment advice.",
  factors: DIMENSIONS.map((d) => ({ id: d.id, label: d.label })),
  levels: ["clear", "caution", "elevated"],
  bases: ["observed", "no-record"],
  grades: ["A", "B", "C", "D", "E"],
  // A grade is meaningless without the weighting that produced it, and the feed
  // publishes exactly one. The key being called "balanced" was the only signal,
  // which is not a machine-readable one: a consumer that flattens or renames it
  // could enforce a threshold with no idea the grade is profile-specific. So the
  // profile is stated, with its weights and the warning.
  profile: {
    product: DEFAULT_PROFILE.product,
    customer: DEFAULT_PROFILE.customer,
    label: `${PRODUCT_META[DEFAULT_PROFILE.product].label} / ${CUSTOMER_META[DEFAULT_PROFILE.customer].label}`,
    weights: resolveWeights(DEFAULT_PROFILE),
    note:
      "Every score, grade and band below is produced by this profile alone. A chain that is acceptable for custody is not automatically acceptable for payments, and the grade moves with the product. Reweight the raw factor levels yourself if your deployment differs.",
  },
  chains: CHAINS.map((c) => {
    const s = scoreChain(c); // balanced profile — the reference rating
    return {
      id: c.id,
      name: c.name,
      ticker: c.ticker,
      category: c.category,
      asAt: c.asAt,
      reviewed: c.reviewed ?? c.asAt,
      factors: Object.fromEntries(
        DIMENSIONS.map((d) => [
          d.id,
          {
            level: c.ratings[d.id].level,
            rationale: c.ratings[d.id].rationale,
            basis: c.ratings[d.id].basis ?? "observed",
          },
        ]),
      ),
      balanced: { score: s.score, grade: s.grade, band: s.band },
      exposure: { tier: c.exposure.tier, where: c.exposure.where },
      residual: c.residual.note,
    };
  }),
};

const dest = join(dirname(fileURLToPath(import.meta.url)), "../public/ratings.json");
writeFileSync(dest, JSON.stringify(out, null, 1));
console.log(`wrote ${dest} (${out.chains.length} chains, as at ${out.asAt})`);

