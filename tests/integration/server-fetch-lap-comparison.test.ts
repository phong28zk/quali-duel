import { describe, expect, it } from 'vitest';
import { fetchLapComparisonImpl } from '~/server/fetch-lap-comparison-impl';
import type { OpenF1Client } from '~/lib/openf1/openf1-client';

const SESSION_KEY = 9472;
const SESSION = {
  session_key: SESSION_KEY,
  session_name: 'Qualifying',
  session_type: 'Qualifying',
  meeting_key: 1217,
  circuit_short_name: 'Monza',
  country_name: 'Italy',
  year: 2023,
  date_start: '2023-09-02T14:00:00+00:00',
};

const driverRaw = (number: number, acro: string, name: string) => ({
  driver_number: number,
  name_acronym: acro,
  full_name: name,
  team_name: 'Ferrari',
  team_colour: 'F91536',
  session_key: SESSION_KEY,
  meeting_key: 1217,
});

const lapRaw = (
  driver: number,
  lapNumber: number,
  durationS: number,
  startIso: string,
) => ({
  session_key: SESSION_KEY,
  meeting_key: 1217,
  driver_number: driver,
  lap_number: lapNumber,
  lap_duration: durationS,
  duration_sector_1: durationS / 3,
  duration_sector_2: durationS / 3,
  duration_sector_3: durationS / 3,
  date_start: startIso,
  is_pit_out_lap: false,
});

// Generate per-second car_data + location samples spanning a lap.
function buildSamples(
  driver: number,
  lapStartIso: string,
  durationS: number,
): {
  carData: Array<{
    session_key: number;
    driver_number: number;
    date: string;
    speed: number;
    throttle: number;
    brake: number;
    n_gear: number;
    rpm: number;
    drs: number;
  }>;
  location: Array<{
    session_key: number;
    driver_number: number;
    date: string;
    x: number;
    y: number;
    z: number;
  }>;
} {
  const start = Date.parse(lapStartIso);
  const carData = [];
  const location = [];
  const n = Math.max(5, Math.floor(durationS));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const at = new Date(start + t * durationS * 1000).toISOString();
    carData.push({
      session_key: SESSION_KEY,
      driver_number: driver,
      date: at,
      speed: 100 + t * 200,
      throttle: 100,
      brake: 0,
      n_gear: 7,
      rpm: 11000,
      drs: 0,
    });
    location.push({
      session_key: SESSION_KEY,
      driver_number: driver,
      date: at,
      x: t * 5000,
      y: 0,
      z: 0,
    });
  }
  return { carData, location };
}

function makeClient(): OpenF1Client {
  const lapA = lapRaw(16, 18, 80.0, '2023-09-02T14:30:00+00:00');
  const lapB = lapRaw(55, 19, 81.0, '2023-09-02T14:32:00+00:00');
  const samplesA = buildSamples(16, lapA.date_start, lapA.lap_duration!);
  const samplesB = buildSamples(55, lapB.date_start, lapB.lap_duration!);
  return {
    fetchSessions: async () => [SESSION],
    fetchDrivers: async () => [
      driverRaw(16, 'LEC', 'Charles LECLERC'),
      driverRaw(55, 'SAI', 'Carlos SAINZ'),
    ],
    fetchLaps: async ({ driverNumber }) => {
      if (driverNumber === 16) return [lapA];
      if (driverNumber === 55) return [lapB];
      return [lapA, lapB];
    },
    fetchCarData: async ({ driverNumber }) =>
      driverNumber === 16 ? samplesA.carData : samplesB.carData,
    fetchLocation: async ({ driverNumber }) =>
      driverNumber === 16 ? samplesA.location : samplesB.location,
  };
}

describe('fetchLapComparisonImpl', () => {
  it('builds a comparison payload for two laps in the same session', async () => {
    const client = makeClient();
    const payload = await fetchLapComparisonImpl(client, {
      sessionKey: SESSION_KEY,
      lapA: { driverNumber: 16, lapNumber: 18 },
      lapB: { driverNumber: 55, lapNumber: 19 },
    });
    expect(payload.session.sessionKey).toBe(SESSION_KEY);
    expect(payload.lapA.driver.nameAcronym).toBe('LEC');
    expect(payload.lapB.driver.nameAcronym).toBe('SAI');
    expect(payload.lapA.samples.length).toBeGreaterThan(5);
    expect(payload.lapB.samples.length).toBeGreaterThan(5);
    expect(payload.summary.totalDeltaSeconds).toBeCloseTo(-1.0, 1);
  });

  it('rejects when sessionKey is missing or non-integer', async () => {
    const client = makeClient();
    await expect(
      fetchLapComparisonImpl(client, {
        sessionKey: 0,
        lapA: { driverNumber: 16, lapNumber: 18 },
        lapB: { driverNumber: 55, lapNumber: 19 },
      }),
    ).rejects.toThrow();
  });

  it('rejects when the requested lap does not exist for the driver', async () => {
    const client = makeClient();
    await expect(
      fetchLapComparisonImpl(client, {
        sessionKey: SESSION_KEY,
        lapA: { driverNumber: 16, lapNumber: 99 },
        lapB: { driverNumber: 55, lapNumber: 19 },
      }),
    ).rejects.toThrow(/lap/i);
  });

  it('rejects when the session cannot be resolved', async () => {
    const client: OpenF1Client = {
      ...makeClient(),
      fetchSessions: async () => [],
    };
    await expect(
      fetchLapComparisonImpl(client, {
        sessionKey: SESSION_KEY,
        lapA: { driverNumber: 16, lapNumber: 18 },
        lapB: { driverNumber: 55, lapNumber: 19 },
      }),
    ).rejects.toThrow(/session/i);
  });
});
