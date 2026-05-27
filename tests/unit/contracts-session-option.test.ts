import { describe, expect, it } from 'vitest';
import { SessionOptionSchema } from '~/lib/contracts/session-option';

describe('SessionOptionSchema', () => {
  const valid = {
    sessionKey: 9472,
    sessionName: 'Qualifying',
    sessionType: 'Qualifying',
    meetingKey: 1217,
    circuitShortName: 'Monza',
    countryName: 'Italy',
    year: 2023,
    dateStart: '2023-09-02T14:00:00+00:00',
  };

  it('accepts a well-formed qualifying session', () => {
    const parsed = SessionOptionSchema.parse(valid);
    expect(parsed.sessionKey).toBe(9472);
    expect(parsed.circuitShortName).toBe('Monza');
  });

  it('rejects non-qualifying session types', () => {
    expect(() =>
      SessionOptionSchema.parse({ ...valid, sessionType: 'Race' }),
    ).toThrow();
  });

  it('rejects invalid ISO dateStart', () => {
    expect(() =>
      SessionOptionSchema.parse({ ...valid, dateStart: 'not-a-date' }),
    ).toThrow();
  });

  it('rejects non-integer sessionKey', () => {
    expect(() =>
      SessionOptionSchema.parse({ ...valid, sessionKey: 9472.5 }),
    ).toThrow();
  });
});
