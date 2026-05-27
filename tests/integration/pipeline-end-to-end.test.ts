import { describe, expect, it } from 'vitest';
import { fetchLapComparisonImpl } from '~/server/fetch-lap-comparison-impl';
import { LapComparisonPayloadSchema } from '~/lib/contracts';
import type { OpenF1Client } from '~/lib/openf1/openf1-client';
import {
  SESSION_KEY,
  session,
  driverLeclerc,
  driverSainz,
  lapLeclerc18,
  lapSainz19,
  carDataLeclerc,
  carDataSainz,
  locationLeclerc,
  locationSainz,
} from '../fixtures/openf1/monza-2023-qualifying';

function fixtureClient(): OpenF1Client {
  return {
    fetchSessions: async () => [session],
    fetchDrivers: async () => [driverLeclerc, driverSainz],
    fetchLaps: async () => [lapLeclerc18, lapSainz19],
    fetchCarData: async ({ driverNumber }) =>
      driverNumber === 16 ? carDataLeclerc : carDataSainz,
    fetchLocation: async ({ driverNumber }) =>
      driverNumber === 16 ? locationLeclerc : locationSainz,
  };
}

describe('pipeline end-to-end against realistic Monza fixture', () => {
  it('produces a schema-valid payload for two laps of the same session', async () => {
    const payload = await fetchLapComparisonImpl(fixtureClient(), {
      sessionKey: SESSION_KEY,
      lapA: { driverNumber: 16, lapNumber: 18 },
      lapB: { driverNumber: 55, lapNumber: 19 },
    });
    // Round-trip through the schema as the canonical validator.
    expect(() => LapComparisonPayloadSchema.parse(payload)).not.toThrow();
  });

  it('reflects the lap duration difference at progress=1 (LEC ahead of SAI)', async () => {
    const payload = await fetchLapComparisonImpl(fixtureClient(), {
      sessionKey: SESSION_KEY,
      lapA: { driverNumber: 16, lapNumber: 18 },
      lapB: { driverNumber: 55, lapNumber: 19 },
    });
    // Synthetic samples are emitted at ~3.7 Hz, so the last sample falls a few
    // hundred ms short of lap end. The delta sign and approximate magnitude
    // are what matters here, not exact match to lap_duration.
    expect(payload.summary.totalDeltaSeconds).toBeLessThan(0);
    expect(payload.summary.totalDeltaSeconds).toBeGreaterThan(-1);
  });

  it('emits samples for each lap with track xy preserved', async () => {
    const payload = await fetchLapComparisonImpl(fixtureClient(), {
      sessionKey: SESSION_KEY,
      lapA: { driverNumber: 16, lapNumber: 18 },
      lapB: { driverNumber: 55, lapNumber: 19 },
    });
    expect(payload.lapA.samples.length).toBeGreaterThan(50);
    expect(payload.lapB.samples.length).toBeGreaterThan(50);
    const withPosition = payload.lapA.samples.filter(
      (s) => s.x !== undefined && s.y !== undefined,
    );
    expect(withPosition.length).toBeGreaterThan(50);
  });

  it('marks at least one personal-best lap when only one valid lap exists per driver', async () => {
    const payload = await fetchLapComparisonImpl(fixtureClient(), {
      sessionKey: SESSION_KEY,
      lapA: { driverNumber: 16, lapNumber: 18 },
      lapB: { driverNumber: 55, lapNumber: 19 },
    });
    expect(payload.lapA.lap.isPersonalBest).toBe(true);
    expect(payload.lapB.lap.isPersonalBest).toBe(true);
  });

  it('produces brake samples that are binary (0 or 100)', async () => {
    const payload = await fetchLapComparisonImpl(fixtureClient(), {
      sessionKey: SESSION_KEY,
      lapA: { driverNumber: 16, lapNumber: 18 },
      lapB: { driverNumber: 55, lapNumber: 19 },
    });
    for (const sample of payload.lapA.samples) {
      expect([0, 100]).toContain(sample.brakePct);
    }
  });
});
