import { describe, expect, it } from 'vitest';
import { fetchSessionsImpl } from '~/server/fetch-sessions-impl';
import type { OpenF1Client } from '~/lib/openf1/openf1-client';

function stubClient(
  overrides: Partial<OpenF1Client>,
): OpenF1Client {
  return {
    fetchSessions: async () => [],
    fetchDrivers: async () => [],
    fetchLaps: async () => [],
    fetchCarData: async () => [],
    fetchLocation: async () => [],
    ...overrides,
  };
}

describe('fetchSessionsImpl', () => {
  it('returns only Qualifying sessions, sorted by dateStart descending', async () => {
    const client = stubClient({
      fetchSessions: async () => [
        {
          session_key: 1,
          session_name: 'Qualifying',
          session_type: 'Qualifying',
          meeting_key: 10,
          circuit_short_name: 'Monza',
          country_name: 'Italy',
          year: 2023,
          date_start: '2023-09-02T14:00:00+00:00',
        },
        {
          session_key: 2,
          session_name: 'Race',
          session_type: 'Race',
          meeting_key: 10,
          circuit_short_name: 'Monza',
          country_name: 'Italy',
          year: 2023,
          date_start: '2023-09-03T13:00:00+00:00',
        },
        {
          session_key: 3,
          session_name: 'Qualifying',
          session_type: 'Qualifying',
          meeting_key: 11,
          circuit_short_name: 'Singapore',
          country_name: 'Singapore',
          year: 2023,
          date_start: '2023-09-16T14:00:00+00:00',
        },
      ],
    });
    const sessions = await fetchSessionsImpl(client, { year: 2023 });
    expect(sessions.map((s) => s.sessionKey)).toEqual([3, 1]);
    expect(sessions.every((s) => s.sessionType === 'Qualifying')).toBe(true);
  });

  it('rejects an invalid year via Zod validation', async () => {
    const client = stubClient({});
    await expect(
      fetchSessionsImpl(client, { year: 999 as unknown as number }),
    ).rejects.toThrow();
  });
});
