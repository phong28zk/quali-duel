import { describe, expect, it } from 'vitest';
import { buildLapComparisonPayload } from '~/lib/telemetry/build-lap-comparison-payload';
import type { NormalizedTelemetrySample } from '~/lib/contracts';

const session = {
  sessionKey: 9472,
  sessionName: 'Qualifying',
  sessionType: 'Qualifying' as const,
  meetingKey: 1217,
  circuitShortName: 'Monza',
  countryName: 'Italy',
  year: 2023,
  dateStart: '2023-09-02T14:00:00+00:00',
};

const driverA = {
  driverNumber: 16,
  nameAcronym: 'LEC',
  fullName: 'Charles LECLERC',
  teamName: 'Ferrari',
  teamColour: 'F91536',
};

const driverB = {
  driverNumber: 55,
  nameAcronym: 'SAI',
  fullName: 'Carlos SAINZ',
  teamName: 'Ferrari',
  teamColour: 'F91536',
};

const lapA = {
  sessionKey: 9472,
  driverNumber: 16,
  lapNumber: 18,
  lapDurationSeconds: 80.0,
  sector1Seconds: 24.5,
  sector2Seconds: 28.0,
  sector3Seconds: 27.5,
  isPersonalBest: true,
  isOutlap: false,
  isInlap: false,
};

const lapB = {
  sessionKey: 9472,
  driverNumber: 55,
  lapNumber: 19,
  lapDurationSeconds: 81.0,
  sector1Seconds: 24.7,
  sector2Seconds: 28.3,
  sector3Seconds: 28.0,
  isPersonalBest: true,
  isOutlap: false,
  isInlap: false,
};

// Build a linear sample series where progress p maps to timeSeconds = p * duration.
function linearSamples(duration: number, n = 5): NormalizedTelemetrySample[] {
  const out: NormalizedTelemetrySample[] = [];
  for (let i = 0; i < n; i++) {
    const p = i / (n - 1);
    out.push({
      progress: p,
      timeSeconds: p * duration,
      speedKph: 200 + p * 100,
      throttlePct: 100,
      brakePct: 0,
      gear: 7,
      rpm: 11000,
      drs: 0,
    });
  }
  return out;
}

describe('buildLapComparisonPayload', () => {
  it('produces a payload that parses against LapComparisonPayloadSchema', () => {
    const payload = buildLapComparisonPayload({
      session,
      lapA: { driver: driverA, lap: lapA, samples: linearSamples(80) },
      lapB: { driver: driverB, lap: lapB, samples: linearSamples(81) },
    });
    expect(payload.session.sessionKey).toBe(9472);
    expect(payload.deltaSeries.length).toBeGreaterThan(50);
    expect(payload.deltaSeries[0]?.progress).toBe(0);
    expect(payload.deltaSeries[payload.deltaSeries.length - 1]?.progress).toBe(1);
  });

  it('totalDeltaSeconds equals lapA.duration - lapB.duration at progress=1', () => {
    const payload = buildLapComparisonPayload({
      session,
      lapA: { driver: driverA, lap: lapA, samples: linearSamples(80) },
      lapB: { driver: driverB, lap: lapB, samples: linearSamples(81) },
    });
    // lapA is 1.0s faster than lapB → delta at end = -1.0
    expect(payload.summary.totalDeltaSeconds).toBeCloseTo(-1.0, 3);
  });

  it('deltaSeries is monotonically non-decreasing in progress', () => {
    const payload = buildLapComparisonPayload({
      session,
      lapA: { driver: driverA, lap: lapA, samples: linearSamples(80) },
      lapB: { driver: driverB, lap: lapB, samples: linearSamples(81) },
    });
    for (let i = 1; i < payload.deltaSeries.length; i++) {
      expect(payload.deltaSeries[i]!.progress).toBeGreaterThanOrEqual(
        payload.deltaSeries[i - 1]!.progress,
      );
    }
  });

  it('rejects laps from different sessions', () => {
    expect(() =>
      buildLapComparisonPayload({
        session,
        lapA: { driver: driverA, lap: lapA, samples: linearSamples(80) },
        lapB: {
          driver: driverB,
          lap: { ...lapB, sessionKey: 0 },
          samples: linearSamples(81),
        },
      }),
    ).toThrow();
  });

  it('throws when a sample series is empty', () => {
    expect(() =>
      buildLapComparisonPayload({
        session,
        lapA: { driver: driverA, lap: lapA, samples: [] },
        lapB: { driver: driverB, lap: lapB, samples: linearSamples(81) },
      }),
    ).toThrow();
  });

  it('summary.maxGainAtProgress points to where lapA is most ahead (delta most negative)', () => {
    // Construct lapA samples that gain heavily mid-lap, then give it back at the end.
    const samplesA: NormalizedTelemetrySample[] = [
      { progress: 0, timeSeconds: 0, speedKph: 0, throttlePct: 100, brakePct: 0, gear: 1, rpm: 8000, drs: 0 },
      { progress: 0.5, timeSeconds: 35, speedKph: 280, throttlePct: 100, brakePct: 0, gear: 7, rpm: 11500, drs: 0 },
      { progress: 1, timeSeconds: 80, speedKph: 0, throttlePct: 0, brakePct: 100, gear: 1, rpm: 7000, drs: 0 },
    ];
    const samplesB: NormalizedTelemetrySample[] = [
      { progress: 0, timeSeconds: 0, speedKph: 0, throttlePct: 100, brakePct: 0, gear: 1, rpm: 8000, drs: 0 },
      { progress: 0.5, timeSeconds: 40.5, speedKph: 270, throttlePct: 100, brakePct: 0, gear: 7, rpm: 11500, drs: 0 },
      { progress: 1, timeSeconds: 81, speedKph: 0, throttlePct: 0, brakePct: 100, gear: 1, rpm: 7000, drs: 0 },
    ];
    const payload = buildLapComparisonPayload({
      session,
      lapA: { driver: driverA, lap: lapA, samples: samplesA },
      lapB: { driver: driverB, lap: lapB, samples: samplesB },
    });
    expect(payload.summary.maxGainAtProgress).toBeGreaterThan(0.4);
    expect(payload.summary.maxGainAtProgress).toBeLessThan(0.6);
  });
});
