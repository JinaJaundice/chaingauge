import { Activity, Moon, Search, Sun } from "lucide-react";
import { cn } from "../lib/cn";
import { useTheme } from "../lib/theme";
import type { RoutePage } from "../lib/router";

// Matrix is a view mode inside Ratings, and Compare is reached from the table
// and the chain pages, so neither takes a tab.
//
// The overview IS a tab. It used to sit outside the navigation as a splash
// page, which meant nothing highlighted while you were on it and moving into
// the ratings read as a jump between two different products.
const TABS: { id: RoutePage; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "chains", label: "Ratings" },
  { id: "method", label: "Method" },
  { id: "contribute", label: "Contribute" },
  { id: "changelog", label: "Changelog" },
  { id: "about", label: "About" },
];

/** Routes that live under a tab rather than having one of their own. */
const TAB_OF: Partial<Record<RoutePage, RoutePage>> = {
  matrix: "chains",
  compare: "chains",
};

/** Ask the QuickSearch overlay to open (it owns its own state). */
export function openSearch() {
  window.dispatchEvent(new CustomEvent("cg:search"));
}

export function TopNav({
  page,
  chainOpen,
  setPage,
  onHome,
  asAt,
}: {
  page: RoutePage;
  chainOpen: boolean;
  setPage: (p: RoutePage) => void;
  onHome: () => void;
  asAt: string;
}) {
  const [theme, toggle] = useTheme();
  const activeTab = TAB_OF[page] ?? page;
  return (
    <header className="sticky top-0 z-20 border-b bg-[var(--bg)]/85 backdrop-blur-md print:hidden">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-1.5 px-2 sm:gap-5 sm:px-6">
        <button
          onClick={onHome}
          className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-ink"
        >
          <span
            className="flex size-6 items-center justify-center rounded-[4px] text-[var(--accent-ink)]"
            style={{ background: "var(--accent)" }}
          >
            <Activity className="size-4" strokeWidth={2.6} />
          </span>
          <span className="hidden lg:inline">ChainGauge</span>
        </button>

        {/* Six tabs do not fit 375px, so the strip itself scrolls rather than
            the page. `min-w-0` is what lets it shrink inside the flex row: a
            flex child defaults to min-width:auto and would push the header
            wider instead of scrolling. */}
        <nav className="nav-scroll flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setPage(t.id)}
              className={cn(
                "shrink-0 rounded px-1.5 py-1 text-[11px] font-medium uppercase transition-colors sm:px-2.5 sm:text-xs sm:tracking-wide",
                activeTab === t.id && !chainOpen ? "text-ink" : "text-faint hover:text-muted",
              )}
              style={
                activeTab === t.id && !chainOpen
                  ? { background: "color-mix(in oklab, var(--accent) 14%, transparent)" }
                  : undefined
              }
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <span className="hidden items-center gap-1.5 text-[11px] tracking-wide text-faint xl:flex">
            <span className="pulse size-1.5 rounded-full" style={{ background: "var(--clear)" }} aria-hidden />
            LIVE · {asAt}
          </span>
          <button
            onClick={openSearch}
            className="flex h-7 w-7 items-center justify-center gap-2 rounded border text-muted transition-colors hover:text-ink sm:w-auto sm:px-2"
            aria-label="Search chains"
            title="Search (press /)"
          >
            <Search className="size-3.5" />
            <kbd className="hidden rounded border px-1 text-[11px] text-faint sm:inline">/</kbd>
          </button>
          <button
            onClick={toggle}
            className="flex size-7 items-center justify-center rounded border text-muted transition-colors hover:text-ink"
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            title={theme === "dark" ? "Light" : "Dark"}
          >
            {theme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
