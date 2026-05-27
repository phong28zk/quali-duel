import { describe, expect, it } from 'vitest';
import { createOpenF1Client } from '~/lib/openf1/openf1-client';

function makeFetch(map: Record<string, unknown>): typeof fetch {
  return async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString();
    const body = map[url];
    if (body === undefined) {
      return new Response(`no fixture for ${url}`, { status: 404 });
    }
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };
}

describe('createOpenF1Client.fetchSessions', () => {
  it('builds the correct URL and parses sessions', async () => {
    const fetchImpl = makeFetch({
      'https://api.openf1.org/v1/sessions?session_type=Qualifying&year=2023': [
        {
          session_key: 9472,
          session_name: 'Qualifying',
          session_type: 'Qualifying',
          meeting_key: 1217,
          circuit_short_name: 'Monza',
          country_name: 'Italy',
          year: 2023,
          date_start: '2023-09-02T14:00:00+00:00',
        },
      ],
    });
    const client = createOpenF1Client({ fetchImpl });
    const sessions = await client.fetchSessions({
      year: 2023,
      sessionType: 'Qualifying',
    });
    expect(sessions).toHaveLength(1);
    expect(sessions[0]?.session_key).toBe(9472);
  });

  it('throws on non-2xx status', async () => {
    const fetchImpl: typeof fetch = async () =>
      new Response('boom', { status: 500 });
    const client = createOpenF1Client({ fetchImpl });
    await expect(
      client.fetchSessions({ year: 2023, sessionType: 'Qualifying' }),
    ).rejects.toThrow(/OpenF1/);
  });

  it('throws on schema mismatch', async () => {
    const fetchImpl = makeFetch({
      'https://api.openf1.org/v1/sessions?session_type=Qualifying&year=2023': [
        { session_key: 'not-a-number' },
      ],
    });
    const client = createOpenF1Client({ fetchImpl });
    await expect(
      client.fetchSessions({ year: 2023, sessionType: 'Qualifying' }),
    ).rejects.toThrow();
  });
});

describe('createOpenF1Client.fetchDrivers', () => {
  it('passes session_key in query', async () => {
    const fetchImpl = makeFetch({
      'https://api.openf1.org/v1/drivers?session_key=9472': [
        {
          driver_number: 16,
          name_acronym: 'LEC',
          full_name: 'Charles LECLERC',
          team_name: 'Ferrari',
          team_colour: 'F91536',
          session_key: 9472,
          meeting_key: 1217,
        },
      ],
    });
    const client = createOpenF1Client({ fetchImpl });
    const drivers = await client.fetchDrivers({ sessionKey: 9472 });
    expect(drivers[0]?.name_acronym).toBe('LEC');
  });
});

describe('createOpenF1Client.fetchLaps', () => {
  it('omits driver_number when undefined', async () => {
    const fetchImpl = makeFetch({
      'https://api.openf1.org/v1/laps?session_key=9472': [],
    });
    const client = createOpenF1Client({ fetchImpl });
    await expect(client.fetchLaps({ sessionKey: 9472 })).resolves.toEqual([]);
  });

  it('includes driver_number when given', async () => {
    const fetchImpl = makeFetch({
      'https://api.openf1.org/v1/laps?driver_number=16&session_key=9472': [],
    });
    const client = createOpenF1Client({ fetchImpl });
    await expect(
      client.fetchLaps({ sessionKey: 9472, driverNumber: 16 }),
    ).resolves.toEqual([]);
  });
});

describe('createOpenF1Client.fetchCarData', () => {
  it('encodes date>= and date<= range filters', async () => {
    const fetchImpl = makeFetch({
      'https://api.openf1.org/v1/car_data?date<=2023-09-02T14%3A31%3A20Z&date>=2023-09-02T14%3A30%3A00Z&driver_number=16&session_key=9472':
        [
          {
            session_key: 9472,
            driver_number: 16,
            date: '2023-09-02T14:30:01.234000+00:00',
            speed: 312,
            throttle: 100,
            brake: 0,
            n_gear: 7,
            rpm: 11800,
            drs: 12,
          },
        ],
    });
    const client = createOpenF1Client({ fetchImpl });
    const samples = await client.fetchCarData({
      sessionKey: 9472,
      driverNumber: 16,
      dateGte: '2023-09-02T14:30:00Z',
      dateLte: '2023-09-02T14:31:20Z',
    });
    expect(samples[0]?.speed).toBe(312);
  });
});
