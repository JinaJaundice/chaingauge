import { useMemo, useState } from "react";
import { AlertCircle, ArrowRight, Check, Copy, Send } from "lucide-react";
import { CHAINS } from "../content/chains";
import { DIMENSIONS } from "../content/methodology";
import { CHANGELOG_META } from "../content/changelog";
import type { DimensionId, Level } from "../content/types";
import {
  formatIssue,
  KIND_LABEL,
  MAX_BODY,
  validate,
  type Submission,
  type SubmissionKind,
} from "@shared/submission";
import { cn } from "../lib/cn";
import { Panel, SectionLabel } from "../components/primitives";
import type { RoutePage } from "../lib/router";

// ---------------------------------------------------------------
// Contribute. The site is only worth trusting if the ratings can be argued with,
// so this is a real intake rather than a mailto link.
//
// No account is needed anywhere. What a submitter gets in return is a stated
// turnaround, a published outcome, and an honest account of what happens to
// what they send.
// ---------------------------------------------------------------

const KINDS: SubmissionKind[] = ["rating", "chain", "site"];

const PROMPT: Record<SubmissionKind, string> = {
  rating:
    "Which factor is wrong, what should it be, and what is the evidence? The more specific, the faster it moves.",
  chain: "Which chain, and where would a regulated firm meet it? A usage figure helps.",
  site: "What did you try to do, and what happened instead? Browser and screen size if you have them.",
};

const LEVELS: { id: Level; label: string }[] = [
  { id: "clear", label: "Clear" },
  { id: "caution", label: "Caution" },
  { id: "elevated", label: "Elevated" },
];

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex flex-wrap items-baseline gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-faint">{label}</span>
        {hint && <span className="sans text-[11px] text-faint">{hint}</span>}
      </span>
      {children}
      {error && (
        <span className="sans mt-1 flex items-center gap-1 text-[11px]" style={{ color: "var(--elevated)" }}>
          <AlertCircle className="size-3" />
          {error}
        </span>
      )}
    </label>
  );
}

const inputClass =
  "w-full rounded border bg-[var(--panel-2)] px-2.5 py-1.5 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-[var(--accent)]";

type SendState = "idle" | "sending" | "sent" | "unavailable" | "error";

export function Contribute({ setPage }: { setPage: (p: RoutePage) => void }) {
  const [kind, setKind] = useState<SubmissionKind>("rating");
  const [form, setForm] = useState<Submission>({ kind: "rating", body: "" });
  const [touched, setTouched] = useState(false);
  const [state, setState] = useState<SendState>("idle");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const submission: Submission = { ...form, kind };
  const { ok, errors } = validate(submission);
  const show = touched ? errors : {};

  const sortedChains = useMemo(
    () => [...CHAINS].sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  function set<K extends keyof Submission>(key: K, value: Submission[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (state === "sent" || state === "error") setState("idle");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!ok) return;
    setState("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(submission),
      });
      if (res.status === 503) {
        setState("unavailable");
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setMessage(data.error ?? "Something went wrong.");
        setState("error");
        return;
      }
      setState("sent");
      setForm({ kind, body: "" });
      setTouched(false);
    } catch {
      setState("unavailable");
    }
  }

  /** If the endpoint is down or unconfigured, the submitter still leaves with
   *  their own words in a structured form rather than losing them. */
  const fallbackText = useMemo(
    () => formatIssue(submission, new Date().toISOString().slice(0, 10)).body,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state],
  );

  return (
    <div className="rise">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">Contribute</h1>
        <p className="sans mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          These ratings are judgements made from public sources by a small number of people, and
          some of them will be wrong. The assessment improves when readers say which, with
          evidence. A challenge that carries a source can be checked and acted on quickly, and
          every change ends up in the changelog with its reason, including the ones we decide not
          to make.
        </p>
      </div>

      {/* items-start, so the form panel ends where the form ends. A panel that
          stretches to match its neighbour leaves dead space under the button. */}
      <div className="grid items-start gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* ---- The form ------------------------------------------------------ */}
        <Panel as="section" className="p-4 sm:p-5">
          <div className="panel-2 mb-4 inline-flex rounded-md p-0.5">
            {KINDS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setKind(k);
                  setTouched(false);
                  setState("idle");
                }}
                className={cn(
                  "rounded px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide transition-colors sm:px-3",
                  kind === k ? "text-[var(--accent-ink)]" : "text-faint hover:text-ink",
                )}
                style={kind === k ? { background: "var(--accent)" } : undefined}
              >
                {KIND_LABEL[k]}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {kind === "rating" && (
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Chain" error={show.chainId}>
                  <select
                    className={inputClass}
                    value={form.chainId ?? ""}
                    onChange={(e) => set("chainId", e.target.value || undefined)}
                  >
                    <option value="">Choose…</option>
                    {sortedChains.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Factor" error={show.factor}>
                  <select
                    className={inputClass}
                    value={form.factor ?? ""}
                    onChange={(e) => set("factor", (e.target.value || undefined) as DimensionId)}
                  >
                    <option value="">Choose…</option>
                    {DIMENSIONS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Should be" hint="optional">
                  <select
                    className={inputClass}
                    value={form.proposedLevel ?? ""}
                    onChange={(e) => set("proposedLevel", (e.target.value || undefined) as Level)}
                  >
                    <option value="">No view</option>
                    {LEVELS.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            )}

            {kind === "chain" && (
              <Field label="Chain" hint="name it as people would search for it" error={show.chainName}>
                <input
                  className={inputClass}
                  value={form.chainName ?? ""}
                  onChange={(e) => set("chainName", e.target.value)}
                  placeholder="e.g. Sonic"
                />
              </Field>
            )}

            <Field
              label="The argument"
              hint={`${(form.body ?? "").length}/${MAX_BODY}`}
              error={show.body}
            >
              <textarea
                className={cn(inputClass, "sans min-h-32 leading-relaxed")}
                value={form.body}
                onChange={(e) => set("body", e.target.value)}
                placeholder={PROMPT[kind]}
                maxLength={MAX_BODY}
              />
            </Field>

            <Field
              label="Source"
              hint={kind === "rating" ? "required: link the evidence" : "optional"}
              error={show.sourceUrl}
            >
              <input
                className={inputClass}
                value={form.sourceUrl ?? ""}
                onChange={(e) => set("sourceUrl", e.target.value)}
                placeholder="https://"
                inputMode="url"
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Your role" hint="optional">
                <input
                  className={inputClass}
                  value={form.role ?? ""}
                  onChange={(e) => set("role", e.target.value)}
                  placeholder="e.g. MLRO at an EMI"
                />
              </Field>
              <Field label="Email" hint="optional, only to reply" error={show.contact}>
                <input
                  className={inputClass}
                  value={form.contact ?? ""}
                  onChange={(e) => set("contact", e.target.value)}
                  placeholder="you@example.com"
                  inputMode="email"
                />
              </Field>
            </div>

            {/* Honeypot. Hidden from people, irresistible to bots. */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="hidden"
              value={form.trap ?? ""}
              onChange={(e) => set("trap", e.target.value)}
            />

            <div className="flex flex-wrap items-center gap-3 border-t pt-4">
              <button
                type="submit"
                disabled={state === "sending"}
                className="inline-flex items-center gap-2 rounded px-3.5 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--accent-ink)] disabled:opacity-60"
                style={{ background: "var(--accent)" }}
              >
                <Send className="size-3.5" />
                {state === "sending" ? "Sending…" : "Submit"}
              </button>
              <span className="sans text-[11px] text-faint">
                Read by a person within {CHANGELOG_META.responseTarget}.
              </span>
            </div>

            {state === "sent" && (
              <p
                className="sans flex items-center gap-2 rounded border px-3 py-2 text-[13px]"
                style={{ color: "var(--clear)", borderColor: "color-mix(in oklab, var(--clear) 40%, transparent)" }}
              >
                <Check className="size-4 shrink-0" />
                Filed. If you left an email you will hear back either way, including if we decide not
                to change anything.
              </p>
            )}

            {state === "error" && (
              <p className="sans text-[13px]" style={{ color: "var(--elevated)" }}>
                {message}
              </p>
            )}

            {state === "unavailable" && (
              <div className="rounded border p-3">
                <p className="sans text-[13px] leading-relaxed text-muted">
                  The submission service is not reachable right now, and losing what you wrote would
                  be worse than saying so. Copy it and send it over however suits you.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(fallbackText).then(() => {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    });
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 rounded border px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-muted transition-colors hover:text-ink"
                >
                  {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                  {copied ? "Copied" : "Copy my submission"}
                </button>
              </div>
            )}
          </form>
        </Panel>

        {/* ---- What happens to it -------------------------------------------- */}
        <section className="space-y-4">
          <Panel className="p-4 sm:p-5">
            <SectionLabel className="mb-3">What happens to it</SectionLabel>
            <ol className="space-y-3">
              {[
                {
                  t: "It lands in a private queue",
                  d: "Private because a challenge sometimes names a firm, a customer or an incident before anyone has checked whether it is true.",
                },
                {
                  t: "A person reads it and checks the source",
                  d: "The claim is verified against the evidence you cited rather than taken at face value. If the source does not say what the submission claims, the submission goes no further.",
                },
                {
                  t: "If it holds, the rating moves",
                  d: "The factor level and its written rationale change together, so the published reason always matches the published grade.",
                },
                {
                  t: "The change is published here",
                  d: "With the date and the reason. You can see what a rating used to be and why it is no longer that.",
                },
              ].map((s, i) => (
                <li key={s.t} className="flex gap-3">
                  <span className="mono mt-0.5 text-[11px] tabular-nums tracking-widest text-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="text-[13px] font-semibold text-ink">{s.t}</div>
                    <p className="sans mt-0.5 text-[13px] leading-relaxed text-muted">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel className="p-4 sm:p-5">
            <SectionLabel className="mb-2">Nothing here changes a rating on its own</SectionLabel>
            <p className="sans text-[13px] leading-relaxed text-muted">
              Parts of this site are maintained with the help of coding agents, so it is worth being
              explicit about the obvious risk: a public inbox that feeds an agent is a way to try to
              put words in its mouth. Submitted text is stored and displayed as quoted evidence, is
              never executed as an instruction, and no submission reaches a published rating without
              a person checking the source first. If you find a way around that, the third option on
              the form is the right one to use.
            </p>
          </Panel>
        </section>
      </div>

      <button
        onClick={() => setPage("changelog")}
        className="mt-8 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-faint transition-colors hover:text-ink"
      >
        See every change that has been made
        <ArrowRight className="size-3" />
      </button>
    </div>
  );
}
