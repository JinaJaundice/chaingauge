import { useCallback, useEffect, useState } from "react";
import { TopNav } from "./components/TopNav";
import { QuickSearch } from "./components/QuickSearch";
import { Overview } from "./views/Overview";
import { Ratings } from "./views/Ratings";
import { Contribute } from "./views/Contribute";
import { Changelog } from "./views/Changelog";
import { Matrix } from "./views/Matrix";
import { Compare } from "./views/Compare";
import { Methodology } from "./views/Methodology";
import { About } from "./views/About";
import { ChainDetail } from "./views/ChainDetail";
import { CHAINS, FEED_META } from "./content/chains";
import type { Profile } from "./lib/model";
import { formatHash, parseHash, type Route, type RoutePage } from "./lib/router";

const CHAIN_IDS = CHAINS.map((c) => c.id);

function readRoute(): Route {
  return parseHash(window.location.hash, CHAIN_IDS);
}

export function App() {
  // The URL hash is the single source of truth; this state mirrors it.
  const [route, setRoute] = useState<Route>(() => readRoute());

  useEffect(() => {
    const onChange = () => setRoute(readRoute());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  // Navigation pushes a history entry (back works); profile tweaks replace it
  // (changing a dropdown should not bury the back button).
  const navigate = useCallback((next: Route) => {
    window.location.hash = formatHash(next);
  }, []);
  const replace = useCallback((next: Route) => {
    history.replaceState(null, "", formatHash(next));
    setRoute(next);
  }, []);

  const gotoPage = (page: RoutePage) =>
    navigate({ ...route, page, chainId: null, compareIds: page === "compare" ? route.compareIds : [] });
  const openChain = (id: string) => navigate({ ...route, chainId: id });
  const closeChain = () => navigate({ ...route, chainId: null });
  const setCompareIds = (ids: string[]) =>
    replace({ ...route, page: "compare", chainId: null, compareIds: ids });
  const setProfile = (profile: Profile) => replace({ ...route, profile });

  const selected = route.chainId ? CHAINS.find((c) => c.id === route.chainId) ?? null : null;
  const { profile } = route;

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav
        page={route.page}
        chainOpen={!!selected}
        setPage={gotoPage}
        onHome={() => gotoPage("overview")}
        asAt={FEED_META.asAt}
      />
      <QuickSearch chains={CHAINS} profile={profile} onSelect={openChain} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6" key={route.chainId ?? route.page}>
        {selected ? (
          <ChainDetail chain={selected} profile={profile} setProfile={setProfile} onBack={closeChain} />
        ) : route.page === "overview" ? (
          <Overview setPage={gotoPage} onSelect={openChain} />
        ) : route.page === "chains" ? (
          <Ratings
            onSelect={openChain}
            profile={profile}
            setProfile={setProfile}
            onMatrix={() => gotoPage("matrix")}
            onCompare={() => gotoPage("compare")}
          />
        ) : route.page === "matrix" ? (
          <Matrix onSelect={openChain} profile={profile} onBack={() => gotoPage("chains")} />
        ) : route.page === "compare" ? (
          <Compare ids={route.compareIds} setIds={setCompareIds} profile={profile} setProfile={setProfile} onSelect={openChain} />
        ) : route.page === "method" ? (
          <Methodology />
        ) : route.page === "contribute" ? (
          <Contribute setPage={gotoPage} />
        ) : route.page === "changelog" ? (
          <Changelog setPage={gotoPage} onSelect={openChain} />
        ) : (
          <About setPage={gotoPage} />
        )}
      </main>

      <footer className="border-t py-6 print:hidden">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 text-[11px] tracking-wide text-faint sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>
            ChainGauge · financial-crime safety ratings for {FEED_META.chainCount} public chains
          </span>
          <span>Assessed {FEED_META.asAt}. Not advice; a starting point for due diligence.</span>
        </div>
      </footer>
    </div>
  );
}
