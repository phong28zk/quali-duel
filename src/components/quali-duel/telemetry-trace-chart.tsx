import { createLinearScale, buildSvgPolyline } from '~/lib/ui/svg-helpers';
import { qualiDuelPalette } from '~/theme/quali-duel-theme';
import type { NormalizedTelemetrySample } from '~/lib/contracts';

interface TelemetryTraceChartProps {
  samplesA: ReadonlyArray<NormalizedTelemetrySample>;
  samplesB: ReadonlyArray<NormalizedTelemetrySample>;
  accessor: (sample: NormalizedTelemetrySample) => number;
  label: string;
  unit?: string;
  width?: number;
  height?: number;
  // Optional explicit Y domain. When omitted, derived from data with a small
  // headroom so the line never hugs the chart edge.
  yDomain?: readonly [number, number];
  colorA?: string;
  colorB?: string;
}

const PADDING = { top: 18, right: 16, bottom: 18, left: 56 };

export function TelemetryTraceChart({
  samplesA,
  samplesB,
  accessor,
  label,
  unit,
  width = 920,
  height = 140,
  yDomain,
  colorA = qualiDuelPalette.telemetryBlue,
  colorB = qualiDuelPalette.brakingAmber,
}: TelemetryTraceChartProps) {
  const innerW = width - PADDING.left - PADDING.right;
  const innerH = height - PADDING.top - PADDING.bottom;

  const allValues = [...samplesA, ...samplesB].map(accessor);
  const dataMin = allValues.length ? Math.min(...allValues) : 0;
  const dataMax = allValues.length ? Math.max(...allValues) : 1;
  const span = Math.max(1, dataMax - dataMin);
  const fallbackDomain: [number, number] = [
    dataMin - span * 0.05,
    dataMax + span * 0.05,
  ];
  const domain = yDomain ?? fallbackDomain;

  const xScale = createLinearScale([0, 1], [PADDING.left, PADDING.left + innerW]);
  const yScale = createLinearScale(domain, [PADDING.top + innerH, PADDING.top]);

  const polyA = buildSvgPolyline(
    samplesA.map((s) => [xScale(s.progress), yScale(accessor(s))] as const),
  );
  const polyB = buildSvgPolyline(
    samplesB.map((s) => [xScale(s.progress), yScale(accessor(s))] as const),
  );

  return (
    <svg
      role="img"
      aria-label={`${label} trace`}
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
        fill="transparent"
        stroke={qualiDuelPalette.quietLine}
      />
      <polyline
        points={polyB}
        fill="none"
        stroke={colorB}
        strokeWidth={1.6}
        opacity={0.85}
      />
      <polyline
        points={polyA}
        fill="none"
        stroke={colorA}
        strokeWidth={2}
      />
      <text
        x={PADDING.left + 8}
        y={PADDING.top + 16}
        fill={qualiDuelPalette.textSmoke}
        fontSize={12}
        fontFamily="Inter, system-ui, sans-serif"
        opacity={0.85}
      >
        {label}
        {unit ? <tspan opacity={0.55}> · {unit}</tspan> : null}
      </text>
      <YTick value={domain[1]} y={yScale(domain[1])} />
      <YTick value={domain[0]} y={yScale(domain[0])} />
    </svg>
  );
}

function YTick({ value, y }: { value: number; y: number }) {
  return (
    <text
      x={PADDING.left - 8}
      y={y + 4}
      textAnchor="end"
      fill={qualiDuelPalette.textSmoke}
      opacity={0.65}
      fontSize={11}
      fontFamily="JetBrains Mono, monospace"
    >
      {Math.round(value)}
    </text>
  );
}
