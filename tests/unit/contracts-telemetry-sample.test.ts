import { describe, expect, it } from 'vitest';
import { NormalizedTelemetrySampleSchema } from '~/lib/contracts/telemetry-sample';

describe('NormalizedTelemetrySampleSchema', () => {
  const valid = {
    progress: 0.5,
    timeSeconds: 40.07,
    speedKph: 312,
    throttlePct: 100,
    brakePct: 0,
    gear: 7,
    rpm: 11800,
    drs: 12,
  };

  it('accepts a normalized sample at mid-lap', () => {
    const parsed = NormalizedTelemetrySampleSchema.parse(valid);
    expect(parsed.progress).toBe(0.5);
    expect(parsed.speedKph).toBe(312);
  });

  it('rejects progress outside [0, 1]', () => {
    expect(() =>
      NormalizedTelemetrySampleSchema.parse({ ...valid, progress: 1.2 }),
    ).toThrow();
    expect(() =>
      NormalizedTelemetrySampleSchema.parse({ ...valid, progress: -0.1 }),
    ).toThrow();
  });

  it('rejects throttle/brake outside [0, 100]', () => {
    expect(() =>
      NormalizedTelemetrySampleSchema.parse({ ...valid, throttlePct: 101 }),
    ).toThrow();
    expect(() =>
      NormalizedTelemetrySampleSchema.parse({ ...valid, brakePct: -1 }),
    ).toThrow();
  });

  it('rejects negative speed', () => {
    expect(() =>
      NormalizedTelemetrySampleSchema.parse({ ...valid, speedKph: -1 }),
    ).toThrow();
  });
});
