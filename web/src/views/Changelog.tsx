import { ArrowRight } from "lucide-react";
import { ACTION_LABEL, CHANGELOG, UNDER_REVIEW } from "../content/changelog";
import type { ActionKind } from "../content/changelog";
import { CHAINS } from "../content/chains";
import type { RoutePage } from "../lib/router";
import { Panel, SectionLabel } from "../components/primitives";
import { cn } from "../lib/cn";
import { useState } from "react";

// ---------------------------------------------------------------
// The public record, on its own surface.
//
// It lived at the bottom of Contribute, which put the proof that submissions
// get acted on underneath the form asking for them. A rating you cannot see the
// history of is hard to rely on, so the history is a destination.
// ---------------------------------------------------------------

const FILTERS: { id: ActionKind | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "rating", label: "Rating actions" },
  { id: "coverage", label: "Coverage" },
  { id: "method", label: "Method" },
  { id: "correction", label: "Corrections" },
  { id: "site", label: "Site" },
];

const NAME_BY_ID = new Map(CHAINS.map((c) => [c.id, c.name]));

export function Changelog({
  setPage,
  onSelect,
}: {
  setPage: (p: RoutePage) => void;
  onSelect: (id: string) => void;
}) {
  const [filter, setFilter] = useState<ActionKind | "all">("all");
  const entries = filter === "all" ? CHANGELOG : CHANGELOG.filter((c) => c.kind === filter);
  const fromSubmissions = CHANGELOG.filter((c) => c.prompted).length;

  return (
    <div className="rise">
      <div className="mb-5">
        <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">Changelog</h1>
        <p className="sans mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          Every rating action, coverage decision, method change and correction, with its date and
          its reason. Ratings move as the evidence moves, so the history is part of what makes them
          worth relying on.
        </p>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {[
          ["Recorded changes", String(CHANGELOG.length)],
          ["Prompted by a submission", String(fromSubmissions)],
          ["Open and being worked on", String(UNDER_REVIEW.length)],
        ].map(([label, value]) => (
          <Panel key={label} className="px-4 py-3">
            <div className="mono text-xl font-bold tabular-nums text-ink">{value}</div>
            <div className="mt-0.5 text-[11px] uppercase tracking-wide text-faint">{label}</div>
          </Panel>
        ))}
      </div>

      {UNDER_REVIEW.length > 0 && (
        <section className="mb-6">
          <SectionLabel className="mb-2">Open, and being worked on</SectionLabel>
          <Panel className="divide-y overflow-hidden">
            {UNDER_REVIEW.map((r) => (
              <div key={r.title} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3">
                <span className="mono text-[11px] tabular-nums tracking-wide text-faint">{r.opened}</span>
                <span className="sans flex-1 text-sm text-ink">{r.title}</span>
                <span className="rounded border px-1.5 py-0.5 text-[11px] uppercase tracking-wide text-faint">
                  {r.status}
                </span>
              </div>
            ))}
          </Panel>
        </section>
      )}

      <div className="mb-3 panel inline-flex flex-wrap rounded-md p-0.5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide transition-colors sm:px-3",
              filter === f.id ? "text-[var(--accent-ink)]" : "text-faint hover:text-ink",
            )}
            style={filter === f.id ? { background: "var(--accent)" } : undefined}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Panel className="divide-y overflow-hidden">
        {entries.length === 0 && (
          <p className="sans px-4 py-8 text-center text-sm text-faint">
            Nothing of that kind recorded yet.
          </p>
        )}
        {entries.map((c, i) => (
          <article key={`${c.date}-${i}`} className="px-4 py-4">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <span className="mono text-[11px] tabular-nums tracking-wide text-faint">{c.date}</span>
              <span className="rounded border px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-faint">
                {ACTION_LABEL[c.kind]}
              </span>
              {c.prompted && (
                <span
                  className="rounded border px-1.5 py-0.5 text-[11px] uppercase tracking-wide"
                  style={{ color: "var(--accent)", borderColor: "var(--accent)" }}
                >
                  From a submission
                </span>
              )}
            </div>
            <h2 className="text-sm font-semibold text-ink">{c.title}</h2>
            <p className="sans mt-1 max-w-3xl text-[13px] leading-relaxed text-muted">{c.detail}</p>
            {c.chains && c.chains.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {c.chains.map((id) => (
                  <button
                    key={id}
                    onClick={() => onSelect(id)}
                    className="rounded border px-1.5 py-0.5 text-[11px] tracking-wide text-faint transition-colors hover:text-ink"
                  >
                    {NAME_BY_ID.get(id) ?? id}
                  </button>
                ))}
              </div>
            )}
          </article>
        ))}
      </Panel>

      <button
        onClick={() => setPage("contribute")}
        className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-faint transition-colors hover:text-ink"
      >
        Tell us if something here is wrong
        <ArrowRight className="size-3" />
      </button>
    </div>
  );
}
