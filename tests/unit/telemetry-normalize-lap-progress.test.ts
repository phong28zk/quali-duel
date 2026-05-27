import { describe, expect, it } from 'vitest';
import { normalizeLapProgress } from '~/lib/telemetry/normalize-lap-progress';
import type { MergedSample } from '~/lib/telemetry/merge-lap-samples';

const make = (elapsedSeconds: number, over: Partial<MergedSample> = {}): MergedSample => ({
  elapsedSeconds,
  speed: 200,
  throttle: 80,
  brake: 0,
  gear: 5,
  rpm: 10000,
  drs: 0,
  x: 0,
  y: 0,
  ...over,
});

describe('normalizeLapProgress', () => {
  it('maps elapsedSeconds to progress in [0, 1]', () => {
    const samples = [make(0), make(20), make(40), make(80)];
    const out = normalizeLapProgress(samples, 80);
    expect(out.map((s) => s.progress)).toEqual([0, 0.25, 0.5, 1]);
  });

  it('writes timeSeconds equal to elapsedSeconds', () => {
    const out = normalizeLapProgress([make(12.5)], 80);
    expect(out[0]?.timeSeconds).toBe(12.5);
  });

  it('clamps over-budget elapsed times to 1', () => {
    const out = normalizeLapProgress([make(85)], 80);
    expect(out[0]?.progress).toBe(1);
  });

  it('clamps negative elapsed times to 0', () => {
    const out = normalizeLapProgress([make(-0.5)], 80);
    expect(out[0]?.progress).toBe(0);
  });

  it('normalizes brake to either 0 or 100 (binary)', () => {
    const out = normalizeLapProgress(
      [make(1, { brake: 0 }), make(2, { brake: 50 }), make(3, { brake: 100 })],
      80,
    );
    expect(out.map((s) => s.brakePct)).toEqual([0, 100, 100]);
  });

  it('clamps throttle and brake into [0, 100]', () => {
    const out = normalizeLapProgress(
      [make(1, { throttle: 150 }), make(2, { throttle: -5, brake: -1 })],
      80,
    );
    expect(out[0]?.throttlePct).toBe(100);
    expect(out[1]?.throttlePct).toBe(0);
    expect(out[1]?.brakePct).toBe(0);
  });

  it('clamps gear to [0, 8] and speed to >= 0', () => {
    const out = normalizeLapProgress(
      [make(1, { gear: 9, speed: -10 })],
      80,
    );
    expect(out[0]?.gear).toBe(8);
    expect(out[0]?.speedKph).toBe(0);
  });

  it('throws on non-positive lapDurationSeconds', () => {
    expect(() => normalizeLapProgress([make(1)], 0)).toThrow();
    expect(() => normalizeLapProgress([make(1)], -5)).toThrow();
  });

  it('returns empty when input is empty', () => {
    expect(normalizeLapProgress([], 80)).toEqual([]);
  });
});
