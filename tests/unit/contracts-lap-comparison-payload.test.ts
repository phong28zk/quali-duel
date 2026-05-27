import { describe, expect, it } from 'vitest';
import { LapComparisonPayloadSchema } from '~/lib/contracts/lap-comparison-payload';

const driver = {
  driverNumber: 16,
  nameAcronym: 'LEC',
  fullName: 'Charles Leclerc',
  teamName: 'Ferrari',
  teamColour: 'F91536',
};

const lap = {
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

const sample = (p: number, speed: number) => ({
  progress: p,
  timeSeconds: p * 80,
  speedKph: speed,
  throttlePct: 100,
  brakePct: 0,
  gear: 7,
  rpm: 11500,
  drs: 0,
});

describe('LapComparisonPayloadSchema', () => {
  const valid = {
    session: {
      sessionKey: 9472,
      sessionName: 'Qualifying',
      sessionType: 'Qualifying',
      meetingKey: 1217,
      circuitShortName: 'Monza',
      countryName: 'Italy',
      year: 2023,
      dateStart: '2023-09-02T14:00:00+00:00',
    },
    lapA: { driver, lap, samples: [sample(0, 100), sample(0.5, 280), sample(1, 320)] },
    lapB: {
      driver: { ...driver, driverNumber: 55, nameAcronym: 'SAI', fullName: 'Carlos Sainz' },
      lap: { ...lap, driverNumber: 55, lapNumber: 19, lapDurationSeconds: 80.512 },
      samples: [sample(0, 100), sample(0.5, 275), sample(1, 318)],
    },
    deltaSeries: [
      { progress: 0, deltaSeconds: 0 },
      { progress: 0.5, deltaSeconds: -0.12 },
      { progress: 1, deltaSeconds: 0.369 },
    ],
    summary: {
      totalDeltaSeconds: 0.369,
      maxGainAtProgress: 0.5,
      maxLossAtProgress: 1,
    },
  };

  it('accepts a complete two-lap comparison payload', () => {
    const parsed = LapComparisonPayloadSchema.parse(valid);
    expect(parsed.lapA.driver.nameAcronym).toBe('LEC');
    expect(parsed.deltaSeries).toHaveLength(3);
  });

  it('rejects when lapA and lapB belong to different sessions', () => {
    const broken = {
      ...valid,
      lapB: {
        ...valid.lapB,
        lap: { ...valid.lapB.lap, sessionKey: 9999 },
      },
    };
    expect(() => LapComparisonPayloadSchema.parse(broken)).toThrow();
  });

  it('rejects empty sample series', () => {
    const broken = { ...valid, lapA: { ...valid.lapA, samples: [] } };
    expect(() => LapComparisonPayloadSchema.parse(broken)).toThrow();
  });

  it('rejects unsorted delta series progress values', () => {
    const broken = {
      ...valid,
      deltaSeries: [
        { progress: 0, deltaSeconds: 0 },
        { progress: 1, deltaSeconds: 0.369 },
        { progress: 0.5, deltaSeconds: -0.12 },
      ],
    };
    expect(() => LapComparisonPayloadSchema.parse(broken)).toThrow();
  });
});
