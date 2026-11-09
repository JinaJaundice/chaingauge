import { describe, it, expect } from "vitest";
import type { Chain, DimensionId, Level } from "../content/types";
import { buildAssessment, buildExportCSV, buildExportJSON } from "./exportData";
import { DEFAULT_PROFILE, scoreChain } from "./model";

function chain(base: Level, overrides: Partial<Record<DimensionId, Level>> = {}, name = "Test"): Chain {
  const lvl = (id: DimensionId): Level => overrides[id] ?? base;
  const rating = (id: DimensionId) => ({ level: lvl(id), rationale: "why, with a comma", sources: [] });
  return {
    id: name.toLowerCase(), name, ticker: "T", category: "l1",
    exposure: { tier: "emerging", where: "", scale: { label: "", value: "" } },
    residual: { note: "", sources: [] },
    facts: { consensus: "", model: "", launched: "", steward: "" },
    summary: "", deployment: "", stats: [], asAt: "2026-07-15",
    ratings: {
      traceability: rating("traceability"), coverage: rating("coverage"),
      illicit: rating("illicit"), controls: rating("controls"),
      travelRule: rating("travelRule"), accountability: rating("accountability"),
      adverseMedia: rating("adverseMedia"),
    },
  };
}

describe("buildAssessment", () => {
  it("mirrors the on-screen model output", () => {
    const c = chain("clear", { illicit: "elevated" });
    const a = buildAssessment(c, DEFAULT_PROFILE);
    const s = scoreChain(c, DEFAULT_PROFILE);
    expect(a.grade).toBe(s.grade);
    expect(a.score).toBe(s.score);
    expect(a.factors).toHaveLength(7);
    expect(a.factors.find((f) => f.id === "illicit")!.severity).toBe(100);
  });

  it("records the cap when one applies", () => {
    const a = buildAssessment(chain("clear", { traceability: "elevated" }), DEFAULT_PROFILE);
    expect(a.cap).not.toBeNull();
  });
});

describe("buildExportCSV", () => {
  it("emits a header plus one row per chain and escapes commas", () => {
    const csv = buildExportCSV([chain("clear"), chain("caution", {}, "Other")], DEFAULT_PROFILE);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0].startsWith("id,name,ticker")).toBe(true);
    expect(lines[0].split(",").length).toBe(lines[1].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).length);
  });
});

describe("buildExportJSON", () => {
  it("carries the profile and the disclaimer", () => {
    const parsed = JSON.parse(buildExportJSON([chain("clear")], { product: "payments", customer: "retail" }));
    expect(parsed.profile.product).toBe("payments");
    expect(parsed.disclaimer).toMatch(/due diligence/);
    expect(parsed.chains).toHaveLength(1);
  });
});

