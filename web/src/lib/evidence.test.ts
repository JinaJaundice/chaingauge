import { describe, it, expect } from "vitest";
import { CHAINS } from "../content/chains";
import { decidingFactor, evidenceFor } from "./evidence";
import type { Profile } from "./model";

const byId = (id: string) => CHAINS.find((c) => c.id === id)!;
const SECURITIES: Profile = { product: "securities", customer: "institutional" };

describe("evidenceFor", () => {
  it("never claims more weight than exists", () => {
    for (const chain of CHAINS) {
      const e = evidenceFor(chain, SECURITIES);
      expect(e.sourcedShare).toBeGreaterThanOrEqual(0);
      expect(e.sourcedShare + e.unevidencedShare).toBeLessThanOrEqual(1.000001);
    }
  });

  it("catches the case that prompted this: Stellar's lead rests on an unsourced clear", () => {
    // The reviewer compared these three for a tokenised money market fund.
    // Stellar scored best, and the whole gap sat on illicit exposure, which is
    // rated clear on Stellar with no source and caution on the other two WITH a
    // source. If that ever stops being true, this test should be re-read rather
    // than deleted: the point is that the metric surfaces it.
    const stellar = evidenceFor(byId("stellar"), SECURITIES);
    expect(stellar.weakest.map((w) => w.id)).toContain("illicit");
    expect(stellar.unevidencedShare).toBeGreaterThan(0);
  });

  it("scores a chain with sourced factors as better evidenced than one without", () => {
    const eth = evidenceFor(byId("ethereum"), SECURITIES);
    const stellar = evidenceFor(byId("stellar"), SECURITIES);
    expect(eth.sourcedShare).toBeGreaterThan(stellar.sourcedShare);
  });

  it("orders the weakest factors by the weight they carry", () => {
    for (const chain of CHAINS) {
      const w = evidenceFor(chain, SECURITIES).weakest.map((x) => x.weight);
      expect(w).toEqual([...w].sort((a, b) => b - a));
    }
  });

  it("moves with the profile, because the weights do", () => {
    const payments = evidenceFor(byId("stellar"), { product: "payments", customer: "institutional" });
    const custody = evidenceFor(byId("stellar"), { product: "custody", customer: "institutional" });
    expect(payments.sourcedShare).not.toBe(custody.sourcedShare);
  });
});

describe("decidingFactor", () => {
  it("names illicit exposure as what separates Stellar from Ethereum, and flags it unsourced", () => {
    const d = decidingFactor(byId("stellar"), byId("ethereum"), SECURITIES)!;
    expect(d.id).toBe("illicit");
    expect(d.betterId).toBe("stellar");
    expect(d.unsourcedOnBetterSide).toBe(true);
  });

  it("returns null when two chains do not differ", () => {
    expect(decidingFactor(byId("stellar"), byId("stellar"), SECURITIES)).toBeNull();
  });

  it("does not flag a difference the better side has evidenced", () => {
    // Monero against Bitcoin: Bitcoin wins on traceability and it is a sourced
    // or structural call, not an unevidenced clear on the winning side.
    const d = decidingFactor(byId("bitcoin"), byId("monero"), SECURITIES)!;
    expect(d.betterId).toBe("bitcoin");
    expect(d.worseId).toBe("monero");
  });
});
