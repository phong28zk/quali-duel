import {
  LapComparisonPayloadSchema,
  type DriverOption,
  type LapComparisonPayload,
  type LapOption,
  type NormalizedTelemetrySample,
  type SessionOption,
} from '~/lib/contracts';

export interface LapSide {
  driver: DriverOption;
  lap: LapOption;
  samples: NormalizedTelemetrySample[];
}

export interface BuildLapComparisonPayloadInput {
  session: SessionOption;
  lapA: LapSide;
  lapB: LapSide;
  // Number of evenly spaced points used for the delta series. 100 is enough
  // to render a smooth curve without overweighting cheap UIs.
  deltaResolution?: number;
}

const DEFAULT_DELTA_RESOLUTION = 101;

export function buildLapComparisonPayload({
  session,
  lapA,
  lapB,
  deltaResolution = DEFAULT_DELTA_RESOLUTION,
}: BuildLapComparisonPayloadInput): LapComparisonPayload {
  if (lapA.samples.length === 0 || lapB.samples.length === 0) {
    throw new Error(
      'buildLapComparisonPayload: both laps must have at least one sample',
    );
  }
  const resolution = Math.max(2, Math.trunc(deltaResolution));
  const sortedA = sortByProgress(lapA.samples);
  const sortedB = sortByProgress(lapB.samples);

  const deltaSeries: Array<{ progress: number; deltaSeconds: number }> = [];
  for (let i = 0; i < resolution; i++) {
    const progress = i / (resolution - 1);
    const tA = interpolateTimeAtProgress(sortedA, progress);
    const tB = interpolateTimeAtProgress(sortedB, progress);
    deltaSeries.push({ progress, deltaSeconds: tA - tB });
  }

  const summary = summarizeDelta(deltaSeries);
  const payload: LapComparisonPayload = {
    session,
    lapA: { driver: lapA.driver, lap: lapA.lap, samples: sortedA },
    lapB: { driver: lapB.driver, lap: lapB.lap, samples: sortedB },
    deltaSeries,
    summary,
  };
  // Cross-field invariants (same session, monotonic delta progress) are
  // re-checked by the schema so consumers can trust the returned shape.
  return LapComparisonPayloadSchema.parse(payload);
}

function sortByProgress(
  samples: ReadonlyArray<NormalizedTelemetrySample>,
): NormalizedTelemetrySample[] {
  return [...samples].sort((a, b) => a.progress - b.progress);
}

// Piecewise-linear interpolation of timeSeconds at a given lap-progress value.
// Assumes samples are sorted by progress ascending.
function interpolateTimeAtProgress(
  sorted: ReadonlyArray<NormalizedTelemetrySample>,
  progress: number,
): number {
  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;
  if (progress <= first.progress) return first.timeSeconds;
  if (progress >= last.progress) return last.timeSeconds;
  for (let i = 1; i < sorted.length; i++) {
    const right = sorted[i]!;
    if (right.progress >= progress) {
      const left = sorted[i - 1]!;
      const span = right.progress - left.progress;
      if (span <= 0) return right.timeSeconds;
      const t = (progress - left.progress) / span;
      return left.timeSeconds + t * (right.timeSeconds - left.timeSeconds);
    }
  }
  return last.timeSeconds;
}

function summarizeDelta(
  deltaSeries: ReadonlyArray<{ progress: number; deltaSeconds: number }>,
): LapComparisonPayload['summary'] {
  let maxGainAtProgress = 0;
  let maxLossAtProgress = 0;
  let minDelta = Infinity;
  let maxDelta = -Infinity;
  for (const point of deltaSeries) {
    if (point.deltaSeconds < minDelta) {
      minDelta = point.deltaSeconds;
      maxGainAtProgress = point.progress;
    }
    if (point.deltaSeconds > maxDelta) {
      maxDelta = point.deltaSeconds;
      maxLossAtProgress = point.progress;
    }
  }
  const last = deltaSeries[deltaSeries.length - 1]!;
  return {
    totalDeltaSeconds: last.deltaSeconds,
    maxGainAtProgress,
    maxLossAtProgress,
  };
}
