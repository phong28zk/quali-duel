import { describe, expect, it } from 'vitest';
import { LapOptionSchema } from '~/lib/contracts/lap-option';

describe('LapOptionSchema', () => {
  const valid = {
    sessionKey: 9472,
    driverNumber: 16,
    lapNumber: 18,
    lapDurationSeconds: 80.143,
    sector1Seconds: 24.501,
    sector2Seconds: 27.998,
    sector3Seconds: 27.644,
    isPersonalBest: true,
    isOutlap: false,
    isInlap: false,
  };

  it('accepts a normal valid lap', () => {
    expect(LapOptionSchema.parse(valid).lapNumber).toBe(18);
  });

  it('allows missing sector splits (incomplete lap)', () => {
    const { sector2Seconds: _s2, ...rest } = valid;
    void _s2;
    const parsed = LapOptionSchema.parse(rest);
    expect(parsed.sector2Seconds).toBeUndefined();
  });

  it('rejects negative durations', () => {
    expect(() =>
      LapOptionSchema.parse({ ...valid, lapDurationSeconds: -5 }),
    ).toThrow();
  });

  it('rejects lapNumber below 1', () => {
    expect(() => LapOptionSchema.parse({ ...valid, lapNumber: 0 })).toThrow();
  });
});
