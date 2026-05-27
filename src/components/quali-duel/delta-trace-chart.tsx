import { createLinearScale, buildSvgPolyline } from '~/lib/ui/svg-helpers';
import { formatDeltaSeconds } from '~/lib/ui/format';
import { qualiDuelPalette } from '~/theme/quali-duel-theme';
import type { LapComparisonPayload } from '~/lib/contracts';

interface DeltaTraceChartProps {
  deltaSeries: LapComparisonPayload['deltaSeries'];
  width?: number;
  height?: number;
}

const PADDING = { top: 24, right: 24, bottom: 28, left: 56 };

export function DeltaTraceChart({
  deltaSeries,
  width = 920,
  height = 260,
}: DeltaTraceChartProps) {
  const innerW = width - PADDING.left - PADDING.right;
  const innerH = height - PADDING.top - PADDING.bottom;

  const deltas = deltaSeries.map((d) => d.deltaSeconds);
  const minDelta = Math.min(...deltas, 0);
  const maxDelta = Math.max(...deltas, 0);
  const headroom = Math.max(0.1, (maxDelta - minDelta) * 0.1);
  const yDomain: [number, number] = [minDelta - headroom, maxDelta + headroom];

  const xScale = createLinearScale([0, 1], [PADDING.left, PADDING.left + innerW]);
  const yScale = createLinearScale(yDomain, [PADDING.top + innerH, PADDING.top]);
  const zeroY = yScale(0);

  // Polyline up to zero baseline for fill, plus the trace.
  const tracePoints = deltaSeries.map(
    (d) => [xScale(d.progress), yScale(d.deltaSeconds)] as const,
  );
  const traceAttr = buildSvgPolyline(tracePoints);

  // Build two fill polygons: gain (below zero, lapA ahead) and loss (above).
  const gainFill = buildAreaPolygon(
    deltaSeries,
    xScale,
    yScale,
    zeroY,
    (d) => Math.min(d, 0),
  );
  const lossFill = buildAreaPolygon(
    deltaSeries,
    xScale,
    yScale,
    zeroY,
    (d) => Math.max(d, 0),
  );

  return (
    <svg
      role="img"
      aria-label="Delta seconds between lapA and lapB across the lap"
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      style={{ display: 'block' }}
    >
      <rect
        x={PADDING.left}
        y={PADDING.top}
        width={innerW}
        height={innerH}
        fill={qualiDuelPalette.panelCharcoal}
        rx={12}
      />
      <polygon points={gainFill} fill={qualiDuelPalette.gainLime} opacity={0.18} />
      <polygon points={lossFill} fill={qualiDuelPalette.alertRed} opacity={0.18} />
      <line
        x1={PADDING.left}
        x2={PADDING.left + innerW}
        y1={zeroY}
        y2={zeroY}
        stroke={qualiDuelPalette.quietLine}
        strokeDasharray="4 6"
      />
      <polyline
        points={traceAttr}
        fill="none"
        stroke={qualiDuelPalette.telemetryBlue}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <YAxisLabels yScale={yScale} yDomain={yDomain} />
      <text
        x={PADDING.left}
        y={height - 8}
        fill={qualiDuelPalette.textSmoke}
        opacity={0.65}
        fontSize={12}
        fontFamily="Inter, system-ui, sans-serif"
      >
        Lap progress →
      </text>
    </svg>
  );
}

function buildAreaPolygon(
  series: ReadonlyArray<{ progress: number; deltaSeconds: number }>,
  xScale: (n: number) => number,
  yScale: (n: number) => number,
  zeroY: number,
  clip: (delta: number) => number,
): string {
  const points: Array<readonly [number, number]> = [];
  points.push([xScale(series[0]!.progress), zeroY]);
  for (const point of series) {
    points.push([xScale(point.progress), yScale(clip(point.deltaSeconds))]);
  }
  points.push([xScale(series[series.length - 1]!.progress), zeroY]);
  return buildSvgPolyline(points);
}

function YAxisLabels({
  yScale,
  yDomain,
}: {
  yScale: (n: number) => number;
  yDomain: readonly [number, number];
}) {
  const ticks = [yDomain[0], 0, yDomain[1]];
  return (
    <g
      fill={qualiDuelPalette.textSmoke}
      opacity={0.7}
      fontSize={12}
      fontFamily="JetBrains Mono, monospace"
    >
      {ticks.map((t) => (
        <text key={t} x={PADDING.left - 8} y={yScale(t) + 4} textAnchor="end">
          {formatDeltaSeconds(t)}
        </text>
      ))}
    </g>
  );
}
