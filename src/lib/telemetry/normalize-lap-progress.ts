import type { MergedSample } from './merge-lap-samples';
import type { NormalizedTelemetrySample } from '~/lib/contracts';

// Convert wall-clock merged samples into lap-progress samples in [0, 1].
// Brake is mapped to its binary OpenF1 semantics: non-zero means "on".
export function normalizeLapProgress(
  samples: ReadonlyArray<MergedSample>,
  lapDurationSeconds: number,
): NormalizedTelemetrySample[] {
  if (!(lapDurationSeconds > 0)) {
    throw new Error(
      'normalizeLapProgress: lapDurationSeconds must be positive',
    );
  }
  return samples.map((s) => ({
    progress: clamp(s.elapsedSeconds / lapDurationSeconds, 0, 1),
    timeSeconds: Math.max(0, s.elapsedSeconds),
    speedKph: Math.max(0, s.speed),
    throttlePct: clamp(s.throttle, 0, 100),
    brakePct: s.brake > 0 ? 100 : 0,
    gear: clampInt(s.gear, 0, 8),
    rpm: Math.max(0, s.rpm),
    drs: Math.max(0, Math.trunc(s.drs)),
  }));
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

function clampInt(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, Math.trunc(v)));
}
