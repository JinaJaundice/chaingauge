import type { Chain, Level } from "../content/types";
import { DIMENSION_BY_ID, LEVEL_BY_ID } from "../content/methodology";
import { rosetteWedges } from "../lib/rating";
import { RISK_VAR } from "../lib/uiTokens";

// The rosette: seven donut wedges, clockwise from the top in DIMENSIONS order,
// each filled by that dimension's level colour (a CSS variable, so it tracks the
// theme). The instrument that reads a chain's whole posture at a glance.

export function RiskRosette({
  chain,
  size = 34,
  interactive = false,
}: {
  chain: Chain;
  size?: number;
  interactive?: boolean;
}) {
  const wedges = rosetteWedges(100, 0.5, interactive ? 3 : 2.5);
  // Per-wedge tooltips only once a wedge is big enough to point at. Below that
  // they fire in sequence as the pointer crosses the graphic, which reads as
  // flicker, and they were the cause of the ratings table feeling broken.
  const perWedgeTitles = interactive && size >= 64;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`Risk rosette for ${chain.name}`}
      className="shrink-0"
    >
      {!perWedgeTitles && <title>{`${chain.name}: seven factors at a glance`}</title>}
      {wedges.map((w) => {
        const rating = chain.ratings[w.id];
        const level = rating.level;
        const dim = DIMENSION_BY_ID[w.id];
        // A level held because there is no track record is drawn hollow. A
        // solid wedge means measured; an outline means nobody can say yet.
        const unmeasured = rating.basis === "no-record";
        return (
          <path
            key={w.id}
            data-level={level}
            d={w.d}
            fill={unmeasured ? `color-mix(in oklab, ${RISK_VAR[level]} 22%, transparent)` : RISK_VAR[level]}
            stroke={unmeasured ? RISK_VAR[level] : "var(--panel)"}
            strokeWidth={1.5}
            strokeDasharray={unmeasured ? "2 2" : undefined}
          >
            {perWedgeTitles && (
              <title>{`${dim.label}: ${LEVEL_BY_ID[level].label}${unmeasured ? " (no track record yet)" : ""}`}</title>
            )}
          </path>
        );
      })}
    </svg>
  );
}

// A semicircular gauge for the 0–100 concern index — the literal "gauge". Low
// concern to the left, high to the right.
function gaugePoint(cx: number, cy: number, r: number, t: number): [number, number] {
  const theta = Math.PI * (1 - t); // t=0 -> left (pi), t=1 -> right (0)
  return [cx + r * Math.cos(theta), cy - r * Math.sin(theta)];
}

/**
 * The sweep flag is 1, and it has to be.
 *
 * Rising t runs anticlockwise in maths but clockwise on screen, because SVG's y
 * axis points down, and clockwise is what sweep-flag 1 means. With 0 the track
 * drew the BOTTOM semicircle instead, out of the viewBox, so all that survived
 * were two stubs where it clipped. The value arc got away with 0 for months
 * because a minor arc between two nearby points looks the same either way;
 * only the full half-circle exposed it. Both use 1 now.
 */
function gaugeArc(cx: number, cy: number, r: number, from: number, to: number): string {
  const [x1, y1] = gaugePoint(cx, cy, r, from);
  const [x2, y2] = gaugePoint(cx, cy, r, to);
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

export function ConcernGauge({ value, level }: { value: number; level: Level }) {
  const cx = 100;
  const cy = 92;
  const r = 76;
  const t = Math.min(Math.max(value, 0), 100) / 100;
  const [vx, vy] = gaugePoint(cx, cy, r, t);
  const colour = RISK_VAR[level];
  return (
    <svg width="100%" viewBox="0 0 200 118" role="img" aria-label={`Risk score ${value} out of 100, where 0 is best`}>
      {/* track */}
      <path
        d={gaugeArc(cx, cy, r, 0, 1)}
        fill="none"
        stroke="var(--line)"
        strokeWidth={8}
        strokeLinecap="round"
      />
      {/* value arc */}
      <path
        d={gaugeArc(cx, cy, r, 0, t)}
        fill="none"
        stroke={colour}
        strokeWidth={8}
        strokeLinecap="round"
      />
      {/* The value sits ON the arc rather than on a needle from the hub. A
          needle sweeps the whole upper half, so at any mid-range score it ran
          straight through the readout: at 50 it went vertically through the
          middle of the number. The arc already carries the value, so the dot
          marks where it ends and the bowl stays clear for the figure. */}
      <circle
        cx={vx.toFixed(2)}
        cy={vy.toFixed(2)}
        r={5}
        fill={colour}
        stroke="var(--panel)"
        strokeWidth={2}
      />
      {/* readout */}
      <text
        x={cx}
        y={cy - 20}
        textAnchor="middle"
        fill="var(--ink)"
        style={{ font: "600 30px 'JetBrains Mono', monospace" }}
      >
        {value}
      </text>
      <text
        x={cx}
        y={cy + 18}
        textAnchor="middle"
        fill="var(--faint)"
        style={{ font: "500 9px 'JetBrains Mono', monospace", letterSpacing: "0.12em" }}
      >
        RISK SCORE · 0 IS BEST
      </text>
    </svg>
  );
}

// A large, labelled rosette for the chain detail page.
export function RosetteWithLegend({ chain }: { chain: Chain }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <RiskRosette chain={chain} size={150} interactive />
      <ul className="grid w-full grid-cols-2 gap-x-5 gap-y-1.5">
        {Object.entries(chain.ratings).map(([id, rating]) => {
          const dim = DIMENSION_BY_ID[id as keyof typeof chain.ratings];
          return (
            <li key={id} className="flex items-center gap-2 text-[11px] text-muted">
              <span
                data-level={rating.level}
                className="inline-block size-2 rounded-[2px]"
                style={
                  rating.basis === "no-record"
                    ? { border: `1.5px dashed ${RISK_VAR[rating.level]}` }
                    : { background: RISK_VAR[rating.level] }
                }
                aria-hidden
              />
              <span>{dim.label}</span>
              {rating.basis === "no-record" && (
                <span className="text-faint" title="Held because there is no track record yet">
                  no record
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
