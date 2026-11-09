import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import type { Chain } from "../content/types";
import { scoreChain, type Profile } from "../lib/model";
import { cn } from "../lib/cn";
import { GradeChip, Monogram } from "./primitives";

// A lightweight quick-open: press "/" (or Ctrl/Cmd+K, or the nav button) to
// find a chain by name or ticker, arrow keys + Enter to open it.

export function QuickSearch({
  chains,
  profile,
  onSelect,
}: {
  chains: Chain[];
  profile: Profile;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Reset the query on every open, so it always starts fresh.
    const openNow = () => {
      setQ("");
      setActive(0);
      setOpen(true);
    };
    const onKey = (e: KeyboardEvent) => {
      const inField = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName ?? "");
      if (!open && !inField && (e.key === "/" || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k"))) {
        e.preventDefault();
        openNow();
      } else if (open && e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("cg:search", openNow);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("cg:search", openNow);
    };
  }, [open]);

  useEffect(() => {
    // Focus after the overlay mounts.
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = needle
      ? chains.filter(
          (c) => c.name.toLowerCase().includes(needle) || c.ticker.toLowerCase().includes(needle),
        )
      : chains;
    return [...list].sort((a, b) => a.name.localeCompare(b.name)).slice(0, 8);
  }, [chains, q]);

  if (!open) return null;

  const pick = (id: string) => {
    setOpen(false);
    onSelect(id);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center bg-black/45 px-4 pt-[14vh] backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Search chains"
    >
      <div className="panel w-full max-w-md overflow-hidden rounded-lg shadow-2xl">
        <div className="flex items-center gap-2 border-b px-3">
          <Search className="size-4 text-faint" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter" && results[active]) {
                pick(results[active].id);
              }
            }}
            placeholder="Search chains by name or ticker…"
            className="mono w-full bg-transparent py-3 text-sm text-ink outline-none placeholder:text-faint"
          />
          <kbd className="rounded border px-1 text-[11px] text-faint">esc</kbd>
        </div>
        <ul>
          {results.map((c, i) => (
            <li key={c.id} className={i > 0 ? "border-t" : undefined}>
              <button
                onClick={() => pick(c.id)}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2.5 text-left",
                  i === active && "bg-[var(--panel-2)]",
                )}
              >
                <Monogram ticker={c.ticker === "—" ? c.name : c.ticker} chainId={c.id} size="sm" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{c.name}</span>
                <span className="text-[11px] text-faint">{c.ticker}</span>
                <GradeChip grade={scoreChain(c, profile).grade} size="sm" />
              </button>
            </li>
          ))}
          {results.length === 0 && (
            <li className="px-3 py-4 text-center text-xs text-faint">No chain matches "{q}"</li>
          )}
        </ul>
      </div>
    </div>
  );
}
