// Build a linear scale function mapping domain → range, clamped to the range.
// Used by every chart so we don't take a d3 runtime dependency.
export type LinearScale = (value: number) => number;

export function createLinearScale(
  domain: readonly [number, number],
  range: readonly [number, number],
): LinearScale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0;
  return (value) => {
    if (span === 0) return (r0 + r1) / 2;
    const t = (value - d0) / span;
    const clamped = t < 0 ? 0 : t > 1 ? 1 : t;
    return r0 + clamped * (r1 - r0);
  };
}

// Render an array of [x, y] points as a polyline points attribute. Two-decimal
// rounding keeps SVG output deterministic and small.
export function buildSvgPolyline(
  points: ReadonlyArray<readonly [number, number]>,
): string {
  return points.map(([x, y]) => `${fmt(x)},${fmt(y)}`).join(' ');
}

interface TrackPathOptions {
  width: number;
  height: number;
  padding: number;
}

// Project xy location samples into a closed SVG path inside a viewport.
// Preserves aspect ratio and centers the result inside the padded box.
export function buildSvgTrackPath(
  samples: ReadonlyArray<{ x: number; y: number }>,
  { width, height, padding }: TrackPathOptions,
): string {
  if (samples.length === 0) {
    throw new Error('buildSvgTrackPath: empty samples');
  }
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const point of samples) {
    if (point.x < minX) minX = point.x;
    if (point.x > maxX) maxX = point.x;
    if (point.y < minY) minY = point.y;
    if (point.y > maxY) maxY = point.y;
  }
  const innerW = Math.max(1, width - padding * 2);
  const innerH = Math.max(1, height - padding * 2);
  const spanX = Math.max(1e-6, maxX - minX);
  const spanY = Math.max(1e-6, maxY - minY);
  const scale = Math.min(innerW / spanX, innerH / spanY);
  const offsetX = padding + (innerW - spanX * scale) / 2;
  const offsetY = padding + (innerH - spanY * scale) / 2;
  const points = samples.map(({ x, y }) => {
    const px = offsetX + (x - minX) * scale;
    // Flip y so positive maps "up" on screen, matching racing line intuition.
    const py = offsetY + (maxY - y) * scale;
    return [fmt(px), fmt(py)] as const;
  });
  const head = `M${points[0]![0]},${points[0]![1]}`;
  const tail = points
    .slice(1)
    .map(([x, y]) => `L${x},${y}`)
    .join(' ');
  return `${head} ${tail} Z`;
}

function fmt(n: number): string {
  return (Math.round(n * 100) / 100).toString();
}
