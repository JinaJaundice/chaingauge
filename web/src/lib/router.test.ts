import { describe, it, expect } from "vitest";
import { DEFAULT_ROUTE, formatHash, parseHash, type Route } from "./router";

const IDS = ["bitcoin", "ethereum", "tron", "monero", "zcash"];

describe("parseHash", () => {
  it("defaults to the landing page with the balanced profile", () => {
    expect(parseHash("", IDS)).toEqual(DEFAULT_ROUTE);
    expect(parseHash("#/", IDS)).toEqual(DEFAULT_ROUTE);
    expect(parseHash("#/nonsense", IDS)).toEqual(DEFAULT_ROUTE);
  });

  it("parses plain pages", () => {
    expect(parseHash("#/chains", IDS).page).toBe("chains");
    expect(parseHash("#/matrix", IDS).page).toBe("matrix");
    expect(parseHash("#/method", IDS).page).toBe("method");
    expect(parseHash("#/contribute", IDS).page).toBe("contribute");
    expect(parseHash("#/about", IDS).page).toBe("about");
  });

  it("parses a chain page and rejects unknown ids", () => {
    expect(parseHash("#/chain/tron", IDS).chainId).toBe("tron");
    expect(parseHash("#/chain/fakecoin", IDS).chainId).toBeNull();
  });

  it("parses the compare set, dropping unknown ids and capping at four", () => {
    const r = parseHash("#/compare/bitcoin,fake,tron,monero,zcash,ethereum", IDS);
    expect(r.page).toBe("compare");
    expect(r.compareIds).toEqual(["bitcoin", "tron", "monero", "zcash"]);
  });

  it("parses the profile from the query and falls back on junk", () => {
    const r = parseHash("#/chain/tron?p=payments&c=retail", IDS);
    expect(r.profile).toEqual({ product: "payments", customer: "retail" });
    const bad = parseHash("#/matrix?p=junk&c=junk", IDS);
    expect(bad.profile).toEqual(DEFAULT_ROUTE.profile);
  });
});

describe("formatHash", () => {
  it("round-trips every route shape", () => {
    const routes: Route[] = [
      DEFAULT_ROUTE,
      { page: "matrix", chainId: null, compareIds: [], profile: { product: "custody", customer: "mixed" } },
      { page: "chains", chainId: "monero", compareIds: [], profile: { product: "payments", customer: "retail" } },
      { page: "compare", chainId: null, compareIds: ["bitcoin", "tron"], profile: DEFAULT_ROUTE.profile },
      { page: "compare", chainId: null, compareIds: [], profile: DEFAULT_ROUTE.profile },
    ];
    for (const r of routes) {
      expect(parseHash(formatHash(r), IDS)).toEqual(r);
    }
  });

  it("omits default profile params to keep URLs clean", () => {
    expect(formatHash(DEFAULT_ROUTE)).toBe("#/");
    expect(formatHash({ ...DEFAULT_ROUTE, profile: { product: "defi", customer: "mixed" } })).toBe(
      "#/?p=defi",
    );
    expect(formatHash({ ...DEFAULT_ROUTE, page: "chains" })).toBe("#/chains");
  });
});
