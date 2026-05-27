import { buildSvgTrackPath } from '~/lib/ui/svg-helpers';
import { qualiDuelPalette } from '~/theme/quali-duel-theme';

interface XYSample {
  x: number;
  y: number;
}

interface TrackProgressMapProps {
  // Location samples used to draw the track outline (typically from lapA).
  pathSamples: ReadonlyArray<XYSample>;
  width?: number;
  height?: number;
}

const PADDING = 18;

// Simple track outline. Future iterations can drop gain/loss markers on top
// once we map progress -> xy via the merged samples.
export function TrackProgressMap({
  pathSamples,
  width = 320,
  height = 260,
}: TrackProgressMapProps) {
  if (pathSamples.length === 0) {
    return (
      <svg
        role="img"
        aria-label="Track outline (no data yet)"
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
      >
        <rect width={width} height={height} fill={qualiDuelPalette.panelCharcoal} />
      </svg>
    );
  }
  const path = buildSvgTrackPath(pathSamples, {
    width,
    height,
    padding: PADDING,
  });
  return (
    <svg
      role="img"
      aria-label="Lap path outline"
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      style={{ display: 'block' }}
    >
      <rect width={width} height={height} fill={qualiDuelPalette.panelCharcoal} rx={12} />
      <path
        d={path}
        fill="none"
        stroke={qualiDuelPalette.telemetryBlue}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.85}
      />
    </svg>
  );
}
