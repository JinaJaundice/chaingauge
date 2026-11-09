import type { Profile } from "./model";
import { DEFAULT_PROFILE, CUSTOMER_META, PRODUCT_META } from "./model";

// ---------------------------------------------------------------
// A tiny hash router. Every view, the open chain, the compare set and the
// deployment profile live in the URL, so any state is shareable and the back
// button works. Parse/format are pure (unit-tested); App.tsx owns the wiring.
//
//   #/                          the overview (default; #/overview also parses)
//   #/chains                    the ratings table
//   #/matrix · #/method · #/contribute · #/changelog · #/about
//   #/chain/<id>                a chain page
//   #/compare/<id1>,<id2>,...   the compare view (up to 4)
//   ...?p=<product>&c=<customer>  the profile, on any route
// ---------------------------------------------------------------

export type RoutePage =
  | "overview"
  | "chains"
  | "matrix"
  | "compare"
  | "method"
  | "contribute"
  | "changelog"
  | "about";

export interface Route {
  page: RoutePage;
  /** Set only when a chain page is open. */
  chainId: string | null;
  /** The compare selection (ids, unvalidated order preserved). */
  compareIds: string[];
  profile: Profile;
}

export const DEFAULT_ROUTE: Route = {
  page: "overview",
  chainId: null,
  compareIds: [],
  profile: DEFAULT_PROFILE,
};

const PAGES: RoutePage[] = [
  "overview",
  "chains",
  "matrix",
  "compare",
  "method",
  "contribute",
  "changelog",
  "about",
];

function parseProfile(query: string): Profile {
  const params = new URLSearchParams(query);
  const p = params.get("p") ?? "";
  const c = params.get("c") ?? "";
  return {
    product: p in PRODUCT_META ? (p as Profile["product"]) : DEFAULT_PROFILE.product,
    customer: c in CUSTOMER_META ? (c as Profile["customer"]) : DEFAULT_PROFILE.customer,
  };
}

/** Parse a location.hash (with or without the leading '#') into a Route. */
export function parseHash(hash: string, knownChainIds: readonly string[]): Route {
  const raw = hash.replace(/^#/, "");
  const [path, query = ""] = raw.split("?");
  const segs = path.split("/").filter(Boolean);
  const profile = parseProfile(query);

  if (segs[0] === "chain" && segs[1] && knownChainIds.includes(segs[1])) {
    return { page: "chains", chainId: segs[1], compareIds: [], profile };
  }
  if (segs[0] === "compare") {
    const ids = (segs[1] ?? "")
      .split(",")
      .filter((id) => knownChainIds.includes(id))
      .slice(0, 4);
    return { page: "compare", chainId: null, compareIds: ids, profile };
  }
  const page = PAGES.includes(segs[0] as RoutePage) ? (segs[0] as RoutePage) : "overview";
  return { page, chainId: null, compareIds: [], profile };
}

/** Format a Route back into a hash string (always starts with '#/'). */
export function formatHash(route: Route): string {
  let path: string;
  if (route.chainId) path = `/chain/${route.chainId}`;
  else if (route.page === "compare")
    path = route.compareIds.length > 0 ? `/compare/${route.compareIds.join(",")}` : "/compare";
  else if (route.page === "overview") path = "/";
  else path = `/${route.page}`;

  const params = new URLSearchParams();
  if (route.profile.product !== DEFAULT_PROFILE.product) params.set("p", route.profile.product);
  if (route.profile.customer !== DEFAULT_PROFILE.customer) params.set("c", route.profile.customer);
  const query = params.toString();
  return `#${path}${query ? `?${query}` : ""}`;
}
