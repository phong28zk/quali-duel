import { qualiDuelPalette } from '~/theme/quali-duel-theme';

interface WordmarkProps {
  height?: number;
}

// Inline SVG wordmark: chevron + monospace title. Sized via `height` so it
// scales crisply in the header bar.
export function Wordmark({ height = 28 }: WordmarkProps) {
  return (
    <svg
      aria-label="Quali Duel"
      role="img"
      viewBox="0 0 192 32"
      height={height}
      style={{ display: 'block' }}
    >
      <g fill="none" stroke={qualiDuelPalette.telemetryBlue} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 24 L16 6 L28 24" />
        <path d="M9 24 L23 24" />
      </g>
      <text
        x={38}
        y={22}
        fill={qualiDuelPalette.textSmoke}
        fontFamily="Inter, system-ui, sans-serif"
        fontSize={18}
        fontWeight={700}
        letterSpacing="-0.02em"
      >
        Quali
        <tspan fill={qualiDuelPalette.telemetryBlue}> Duel</tspan>
      </text>
    </svg>
  );
}
