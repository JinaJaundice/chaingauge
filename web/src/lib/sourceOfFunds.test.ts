import { describe, it, expect } from "vitest";
import { CHAINS } from "../content/chains";
import { bindingConstraint, sourceOfFundsView } from "./sourceOfFunds";

const byId = (id: string) => CHAINS.find((c) => c.id === id)!;

describe("sourceOfFundsView", () => {
  it("covers all seven factors for every chain", () => {
    for (const chain of CHAINS) {
      const view = sourceOfFundsView(chain);
      expect(view).toHaveLength(7);
      expect(new Set(view.map((c) => c.id)).size).toBe(7);
      for (const c of view) expect(c.answer.length).toBeGreaterThan(30);
    }
  });

  it("leads with the factor that most constrains the enquiry", () => {
    // Hyperliquid is the case that prompted this: transparent ledger, but no
    // regulated operator to send an information request to.
    const worst = bindingConstraint(byId("hyperliquid"));
    expect(worst.id).toBe("accountability");
    expect(worst.level).toBe("elevated");
    expect(worst.answer).toContain("no regulated operator");
  });

  it("says the ledger can be walked back where traceability is clear", () => {
    const view = sourceOfFundsView(byId("hyperliquid"));
    const trace = view.find((c) => c.id === "traceability")!;
    expect(trace.level).toBe("clear");
    expect(trace.answer).toContain("walked back");
  });

  it("orders worst first so the readout starts with what to act on", () => {
    const rank = { elevated: 0, caution: 1, clear: 2 };
    for (const chain of CHAINS) {
      const levels = sourceOfFundsView(chain).map((c) => rank[c.level]);
      expect(levels).toEqual([...levels].sort((a, b) => a - b));
    }
  });

  it("qualifies an answer that rests on no track record", () => {
    const view = sourceOfFundsView(byId("tempo"));
    const illicit = view.find((c) => c.id === "illicit")!;
    expect(illicit.unmeasured).toBe(true);
    expect(illicit.answer).toContain("absence of evidence");
  });

  it("never tells a firm what to do about it", () => {
    // The line this file holds: consequences, never instructions. If these words
    // appear, someone has started giving compliance advice from a public site.
    const banned = /\b(you should|must file|file an? SAR|report it|escalate to|we recommend|refuse the)\b/i;
    for (const chain of CHAINS) {
      for (const c of sourceOfFundsView(chain)) {
        expect(c.answer, `${chain.id}/${c.id}`).not.toMatch(banned);
      }
    }
  });
});
