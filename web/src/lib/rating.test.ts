import { describe, it, expect } from "vitest";
import type { Chain, DimensionId, Level } from "../content/types";
import { byRisk, concernIndex, deriveBand, rosetteWedges } from "./rating";
import {
  PRODUCT_WEIGHTS,
  resolveWeights,
  scoreChain,
  type ProductProfile,
  type Profile,
} from "./model";

function chain(base: Level, overrides: Partial<Record<DimensionId, Level>> = {}, name = "Test"): Chain {
  const lvl = (id: DimensionId): Level => overrides[id] ?? base;
  const rating = (id: DimensionId) => ({ level: lvl(id), rationale: "", sources: [] });
  return {
    id: name.toLowerCase(),
    name,
    ticker: "T",
    category: "l1",
    exposure: { tier: "emerging", where: "", scale: { label: "", value: "" } },
    residual: { note: "", sources: [] },
    facts: { consensus: "", model: "", launched: "", steward: "" },
    summary: "",
    deployment: "",
    stats: [],
    asAt: "2026-07-15",
    ratings: {
      traceability: rating("traceability"),
      coverage: rating("coverage"),
      illicit: rating("illicit"),
      controls: rating("controls"),
      travelRule: rating("travelRule"),
      accountability: rating("accountability"),
      adverseMedia: rating("adverseMedia"),
    },
  };
}

const P = (product: ProductProfile): Profile => ({ product, customer: "mixed" });

describe("resolveWeights", () => {
  it("normalises to sum 1 for every product profile", () => {
    for (const product of Object.keys(PRODUCT_WEIGHTS) as ProductProfile[]) {
      const w = resolveWeights(P(product));
      const total = Object.values(w).reduce((a, b) => a + b, 0);
      expect(total).toBeCloseTo(1, 6);
    }
  });
});

describe("scoreChain", () => {
  it("all clear scores 0 and grades A / Established", () => {
    const s = scoreChain(chain("clear"));
    expect(s.score).toBe(0);
    expect(s.grade).toBe("A");
    expect(s.band).toBe("established");
    expect(s.cap).toBeNull();
  });

  it("all elevated grades E / High-risk", () => {
    const s = scoreChain(chain("elevated"));
    expect(s.grade).toBe("E");
    expect(s.band).toBe("high-risk");
  });

  it("privacy-by-default (traceability elevated) is capped to Severe regardless of weights", () => {
    const s = scoreChain(chain("clear", { traceability: "elevated" }));
    expect(s.cap).not.toBeNull();
    expect(s.grade).toBe("E");
    expect(s.band).toBe("high-risk");
  });

  it("no analytics coverage (coverage elevated) is capped to Severe", () => {
    expect(scoreChain(chain("clear", { coverage: "elevated" })).grade).toBe("E");
  });

  it("two elevated non-visibility factors trip the compounding cap", () => {
    const s = scoreChain(chain("clear", { illicit: "elevated", controls: "elevated" }));
    expect(s.cap).not.toBeNull();
    expect(s.score).toBeGreaterThanOrEqual(46);
  });

  it("weights are product-dependent: elevated controls costs more under payments than custody", () => {
    const c = chain("clear", { controls: "elevated" });
    const payments = scoreChain(c, P("payments")).score;
    const custody = scoreChain(c, P("custody")).score;
    expect(payments).toBeGreaterThan(custody);
  });

  it("exposes per-factor contributions that sum to the raw score", () => {
    const s = scoreChain(chain("clear", { illicit: "caution", controls: "caution" }));
    const sum = s.factors.reduce((a, f) => a + f.contribution, 0);
    expect(sum).toBeCloseTo(s.rawScore, 5);
  });
});

describe("rating wrappers", () => {
  it("deriveBand and concernIndex mirror the model", () => {
    const c = chain("clear", { illicit: "elevated" });
    expect(deriveBand(c)).toBe(scoreChain(c).band);
    expect(concernIndex(c)).toBe(scoreChain(c).score);
  });

  it("byRisk orders Established before High-risk", () => {
    const safe = chain("clear", {}, "Aaa");
    const risky = chain("clear", { traceability: "elevated" }, "Zzz");
    const sorted = [risky, safe].sort(byRisk());
    expect(sorted[0].name).toBe("Aaa");
  });
});

describe("rosetteWedges", () => {
  it("produces one valid wedge per dimension", () => {
    const wedges = rosetteWedges();
    expect(wedges).toHaveLength(7);
    for (const w of wedges) {
      expect(w.d.startsWith("M ")).toBe(true);
      expect(w.d.endsWith("Z")).toBe(true);
    }
  });
});

