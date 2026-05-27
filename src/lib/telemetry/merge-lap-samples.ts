import type {
  RawOpenF1CarData,
  RawOpenF1Location,
} from '~/lib/openf1/openf1-types';

export interface MergedSample {
  elapsedSeconds: number;
  speed: number;
  throttle: number;
  brake: number;
  gear: number;
  rpm: number;
  drs: number;
  x: number;
  y: number;
}

export interface MergeLapSamplesInput {
  carData: ReadonlyArray<RawOpenF1CarData>;
  location: ReadonlyArray<RawOpenF1Location>;
  lapStart: string;
  lapEnd: string;
}

// Merge car_data and location streams by nearest-neighbor timestamp matching.
// OpenF1 emits the two streams independently at ~3.7 Hz, so a per-sample
// nearest-date match is enough to produce a usable per-frame record.
export function mergeLapSamples({
  carData,
  location,
  lapStart,
  lapEnd,
}: MergeLapSamplesInput): MergedSample[] {
  const startMs = Date.parse(lapStart);
  const endMs = Date.parse(lapEnd);
  if (!(endMs > startMs)) {
    throw new Error('mergeLapSamples: lapEnd must be after lapStart');
  }
  if (carData.length === 0) return [];

  const locationByMs = [...location]
    .map((l) => ({ ms: Date.parse(l.date), x: l.x, y: l.y }))
    .filter((l) => Number.isFinite(l.ms))
    .sort((a, b) => a.ms - b.ms);

  const merged: MergedSample[] = [];
  for (const point of carData) {
    const t = Date.parse(point.date);
    if (!Number.isFinite(t)) continue;
    if (t < startMs || t > endMs) continue;
    const nearest = findNearestByMs(locationByMs, t);
    merged.push({
      elapsedSeconds: (t - startMs) / 1000,
      speed: point.speed,
      throttle: point.throttle,
      brake: point.brake,
      gear: point.n_gear,
      rpm: point.rpm,
      drs: point.drs,
      x: nearest?.x ?? 0,
      y: nearest?.y ?? 0,
    });
  }
  merged.sort((a, b) => a.elapsedSeconds - b.elapsedSeconds);
  return merged;
}

// Binary-search the sorted location array for the entry whose timestamp is
// closest to the target. Returns undefined if the input is empty.
function findNearestByMs(
  sorted: ReadonlyArray<{ ms: number; x: number; y: number }>,
  target: number,
): { ms: number; x: number; y: number } | undefined {
  if (sorted.length === 0) return undefined;
  let lo = 0;
  let hi = sorted.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const midItem = sorted[mid]!;
    if (midItem.ms < target) lo = mid + 1;
    else hi = mid;
  }
  const candidate = sorted[lo]!;
  if (lo > 0) {
    const prev = sorted[lo - 1]!;
    if (Math.abs(prev.ms - target) <= Math.abs(candidate.ms - target)) {
      return prev;
    }
  }
  return candidate;
}
