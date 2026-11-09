import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import type { Band, Basis, Category, Level, Relevance, Source } from "../content/types";
import {
  BAND_LABEL,
  bandChipStyle,
  CATEGORY_LABEL,
  chipStyle,
  dotStyle,
  RELEVANCE_BLURB,
  RISK_VAR,
  RELEVANCE_LABEL,
  relevanceStyle,
  RISK_LABEL,
  textStyle,
} from "../lib/uiTokens";
import { gradeMeta, type Grade } from "../lib/model";
import { CHAIN_ICON } from "../content/chainIcons";
import { cn } from "../lib/cn";

// Shared terminal-style primitives. Monospace chrome, hairline borders, the risk
// colours as the only chroma. Reused across every view so the app stays coherent.

export function RiskDot({
  level,
  basis,
  className,
}: {
  level: Level;
  /** `no-record` draws the dot hollow: the level is held because there is no
   *  track record, not because one was checked. */
  basis?: Basis;
  className?: string;
}) {
  return (
    <span
      data-level={level}
      className={cn("inline-block size-2 rounded-full", className)}
      style={
        basis === "no-record"
          ? { border: `1.5px dashed ${RISK_VAR[level]}` }
          : dotStyle(level)
      }
      aria-hidden
    />
  );
}

export function BandChip({ band, className }: { band: Band; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide whitespace-nowrap",
        className,
      )}
      style={bandChipStyle(band)}
    >
      {BAND_LABEL[band]}
    </span>
  );
}

/** The letter grade in a bordered box, coloured by its risk level. `withLabel`
 *  adds the descriptive word (Robust / Sound / …). */
export function GradeChip({
  grade,
  withLabel = false,
  size = "md",
}: {
  grade: Grade;
  withLabel?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const meta = gradeMeta(grade);
  const box =
    size === "lg" ? "size-9 text-lg" : size === "sm" ? "size-6 text-xs" : "size-7 text-sm";
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={cn("inline-flex items-center justify-center rounded border font-bold", box)}
        style={chipStyle(meta.level)}
      >
        {grade}
      </span>
      {withLabel && (
        <span className="text-xs uppercase tracking-wide" style={textStyle(meta.level)}>
          {meta.label}
        </span>
      )}
    </span>
  );
}

export function LevelChip({ level }: { level: Level }) {
  return (
    <span
      data-level={level}
      className="inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide"
      style={chipStyle(level)}
    >
      {RISK_LABEL[level]}
    </span>
  );
}

export function CategoryTag({ category }: { category: Category }) {
  return (
    <span className="rounded border px-1.5 py-0.5 text-[11px] font-medium tracking-wide text-faint">
      {CATEGORY_LABEL[category]}
    </span>
  );
}

/** How likely a firm is to meet this chain. Not a risk signal, see uiTokens. */
export function TierTag({ tier, className }: { tier: Relevance; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium tracking-wide whitespace-nowrap",
        className,
      )}
      style={relevanceStyle(tier)}
      title={RELEVANCE_BLURB[tier]}
    >
      {RELEVANCE_LABEL[tier].toUpperCase()}
    </span>
  );
}

const MONOGRAM_DIM = {
  lg: "h-11 min-w-11 px-2 text-sm",
  md: "h-8 min-w-8 px-1.5 text-xs",
  sm: "h-6 min-w-6 px-1 text-[11px]",
} as const;

const ICON_PX = { lg: 26, md: 19, sm: 14 } as const;

/**
 * The chain's own mark where one exists, its ticker otherwise.
 *
 * Forty-one of the fifty-one have a glyph; the rest, mostly the older and the
 * privacy chains, fall back to the monogram. Mixing marks and monograms in one
 * table only works because both sit in the same box at the same size, and
 * because the glyphs are monochrome: pulling in forty-one brand colours would
 * have wrecked a palette whose whole discipline is that colour means risk.
 *
 * `dangerouslySetInnerHTML` is safe here. The markup is generated at build time
 * from a fixed package by `tools/gen-icons.mjs`, and no part of it comes from a
 * chain entry, a URL or a submission.
 */
export function Monogram({
  ticker,
  chainId,
  size = "md",
}: {
  ticker: string;
  chainId?: string;
  size?: "sm" | "md" | "lg";
}) {
  const glyph = chainId ? CHAIN_ICON[chainId] : undefined;
  const label = ticker.replace(/[^A-Za-z0-9]/g, "").slice(0, 4) || "—";

  if (glyph) {
    return (
      <span
        className={cn(
          "panel-2 inline-flex shrink-0 items-center justify-center rounded border text-ink",
          MONOGRAM_DIM[size],
        )}
        aria-hidden
      >
        <svg
          viewBox="0 0 24 24"
          width={ICON_PX[size]}
          height={ICON_PX[size]}
          fill="none"
          dangerouslySetInnerHTML={{ __html: glyph }}
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "panel-2 mono inline-flex shrink-0 items-center justify-center rounded border font-semibold tracking-tight text-ink",
        MONOGRAM_DIM[size],
      )}
      aria-hidden
    >
      {label}
    </span>
  );
}

/** The host a link actually goes to, which is the only trustworthy publisher. */
export function sourceHost(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * One citation.
 *
 * The publisher chip is derived from the URL, never from the name. An MLRO
 * reviewing the site for a customer risk assessment found a citation whose name
 * said "Chainalysis" and whose link went to a third-party blog, and said that
 * pasting it straight into a paper would have misattributed the source. Showing
 * the real host beside every citation makes that impossible to do by accident.
 *
 * `strength` separates a sourced fact from this site's own judgement, because
 * the same reviewer had to read every line slowly to work out which was which:
 * they sat at identical visual weight.
 */
export function Citation({ source }: { source: Source }) {
  const host = source.url ? sourceHost(source.url) : "";
  const body = (
    <>
      <span className="truncate">{source.name}</span>
      {host && (
        <span className="mono shrink-0 rounded-[3px] px-1 text-[11px] text-faint" style={{ background: "var(--panel-2)" }}>
          {host}
        </span>
      )}
    </>
  );
  if (!source.url) {
    return <span className="inline-flex max-w-full items-center gap-1.5 text-[11px] text-faint">{body}</span>;
  }
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex max-w-full items-center gap-1.5 text-[11px] text-accent hover:underline"
    >
      {body}
      <ExternalLink className="size-3 shrink-0" />
    </a>
  );
}

/** Whether a rating rests on a cited source or on this site's judgement. */
export function EvidenceChip({ sourced }: { sourced: boolean }) {
  if (sourced) return null;
  return (
    <span
      className="rounded border border-dashed px-1.5 py-0.5 text-[11px] uppercase tracking-wide text-faint"
      title="No published source for this one. It is this site's own judgement, and it is weaker evidence than a cited fact."
    >
      Our judgement, no source
    </span>
  );
}

export function Panel({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
}) {
  return <Tag className={cn("panel rounded-md", className)}>{children}</Tag>;
}

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-[11px] font-semibold uppercase tracking-widest text-faint", className)}>
      {children}
    </h2>
  );
}
