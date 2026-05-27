import { describe, expect, it } from 'vitest';
import { fetchSessionDetailsImpl } from '~/server/fetch-session-details-impl';
import type { OpenF1Client } from '~/lib/openf1/openf1-client';

const SESSION_KEY = 9472;
const SESSION_RAW = {
  session_key: SESSION_KEY,
  session_name: 'Qualifying',
  session_type: 'Qualifying',
  meeting_key: 1217,
  circuit_short_name: 'Monza',
  country_name: 'Italy',
  year: 2023,
  date_start: '2023-09-02T14:00:00+00:00',
};

function buildClient(): OpenF1Client {
  return {
    fetchSessions: async () => [SESSION_RAW],
    fetchDrivers: async () => [
      {
        driver_number: 16,
        name_acronym: 'LEC',
        full_name: 'Charles LECLERC',
        team_name: 'Ferrari',
        team_colour: 'F91536',
        session_key: SESSION_KEY,
        meeting_key: 1217,
      },
      {
        driver_number: 55,
        name_acronym: 'SAI',
        full_name: 'Carlos SAINZ',
        team_name: 'Ferrari',
        team_colour: 'F91536',
        session_key: SESSION_KEY,
        meeting_key: 1217,
      },
    ],
    fetchLaps: async () => [
      // Valid lap
      {
        session_key: SESSION_KEY,
        meeting_key: 1217,
        driver_number: 16,
        lap_number: 18,
        lap_duration: 80.143,
        date_start: '2023-09-02T14:30:00+00:00',
        is_pit_out_lap: false,
      },
      // Invalidated: null date_start should be dropped
      {
        session_key: SESSION_KEY,
        meeting_key: 1217,
        driver_number: 16,
        lap_number: 1,
        lap_duration: null,
        date_start: null,
        is_pit_out_lap: true,
      },
      // Valid lap, second driver
      {
        session_key: SESSION_KEY,
        meeting_key: 1217,
        driver_number: 55,
        lap_number: 19,
        lap_duration: 80.512,
        date_start: '2023-09-02T14:32:00+00:00',
        is_pit_out_lap: false,
      },
    ],
    fetchCarData: async () => [],
    fetchLocation: async () => [],
  };
}

describe('fetchSessionDetailsImpl', () => {
  it('returns drivers + only valid laps, sorted by driver then lap number', async () => {
    const out = await fetchSessionDetailsImpl(buildClient(), {
      sessionKey: SESSION_KEY,
    });
    expect(out.session.circuitShortName).toBe('Monza');
    expect(out.drivers.map((d) => d.driverNumber)).toEqual([16, 55]);
    expect(out.laps.map((l) => ({ d: l.driverNumber, n: l.lapNumber }))).toEqual([
      { d: 16, n: 18 },
      { d: 55, n: 19 },
    ]);
  });

  it('throws when the session is not found', async () => {
    const empty: OpenF1Client = { ...buildClient(), fetchSessions: async () => [] };
    await expect(
      fetchSessionDetailsImpl(empty, { sessionKey: SESSION_KEY }),
    ).rejects.toThrow(/Session/);
  });

  it('marks personal-best correctly per driver', async () => {
    const out = await fetchSessionDetailsImpl(buildClient(), {
      sessionKey: SESSION_KEY,
    });
    const lec18 = out.laps.find((l) => l.driverNumber === 16 && l.lapNumber === 18);
    const sai19 = out.laps.find((l) => l.driverNumber === 55 && l.lapNumber === 19);
    expect(lec18?.isPersonalBest).toBe(true);
    expect(sai19?.isPersonalBest).toBe(true);
  });
});
