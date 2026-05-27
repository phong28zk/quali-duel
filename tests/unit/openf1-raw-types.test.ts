import { describe, expect, it } from 'vitest';
import {
  RawOpenF1SessionSchema,
  RawOpenF1DriverSchema,
  RawOpenF1LapSchema,
  RawOpenF1CarDataSchema,
  RawOpenF1LocationSchema,
} from '~/lib/openf1/openf1-types';

describe('RawOpenF1SessionSchema', () => {
  it('parses a real OpenF1 qualifying session shape', () => {
    const sample = {
      session_key: 9472,
      session_name: 'Qualifying',
      session_type: 'Qualifying',
      meeting_key: 1217,
      circuit_short_name: 'Monza',
      country_name: 'Italy',
      year: 2023,
      date_start: '2023-09-02T14:00:00+00:00',
      date_end: '2023-09-02T15:00:00+00:00',
    };
    expect(RawOpenF1SessionSchema.parse(sample).session_key).toBe(9472);
  });

  it('rejects when session_type missing', () => {
    expect(() =>
      RawOpenF1SessionSchema.parse({
        session_key: 1,
        session_name: 'x',
        meeting_key: 1,
        circuit_short_name: 'x',
        country_name: 'x',
        year: 2023,
        date_start: '2023-09-02T14:00:00+00:00',
      }),
    ).toThrow();
  });
});

describe('RawOpenF1DriverSchema', () => {
  it('parses a real driver shape', () => {
    const sample = {
      driver_number: 16,
      name_acronym: 'LEC',
      full_name: 'Charles LECLERC',
      first_name: 'Charles',
      last_name: 'Leclerc',
      team_name: 'Ferrari',
      team_colour: 'F91536',
      session_key: 9472,
      meeting_key: 1217,
    };
    expect(RawOpenF1DriverSchema.parse(sample).name_acronym).toBe('LEC');
  });

  it('tolerates missing team_colour', () => {
    const sample = {
      driver_number: 16,
      name_acronym: 'LEC',
      full_name: 'Charles LECLERC',
      team_name: 'Ferrari',
      session_key: 9472,
      meeting_key: 1217,
    };
    expect(
      RawOpenF1DriverSchema.parse(sample).team_colour,
    ).toBeUndefined();
  });
});

describe('RawOpenF1LapSchema', () => {
  it('parses a finished lap', () => {
    const sample = {
      session_key: 9472,
      meeting_key: 1217,
      driver_number: 16,
      lap_number: 18,
      lap_duration: 80.143,
      duration_sector_1: 24.501,
      duration_sector_2: 27.998,
      duration_sector_3: 27.644,
      date_start: '2023-09-02T14:30:00+00:00',
      is_pit_out_lap: false,
    };
    expect(RawOpenF1LapSchema.parse(sample).lap_duration).toBeCloseTo(80.143);
  });

  it('parses a lap without a recorded duration (in lap, garage exit)', () => {
    const sample = {
      session_key: 9472,
      meeting_key: 1217,
      driver_number: 16,
      lap_number: 1,
      lap_duration: null,
      date_start: '2023-09-02T14:00:30+00:00',
      is_pit_out_lap: true,
    };
    const parsed = RawOpenF1LapSchema.parse(sample);
    expect(parsed.lap_duration).toBeNull();
    expect(parsed.is_pit_out_lap).toBe(true);
  });
});

describe('RawOpenF1CarDataSchema', () => {
  it('parses a car_data sample', () => {
    const sample = {
      session_key: 9472,
      driver_number: 16,
      date: '2023-09-02T14:30:01.234000+00:00',
      speed: 312,
      throttle: 100,
      brake: 0,
      n_gear: 7,
      rpm: 11800,
      drs: 12,
    };
    expect(RawOpenF1CarDataSchema.parse(sample).speed).toBe(312);
  });
});

describe('RawOpenF1LocationSchema', () => {
  it('parses a location sample', () => {
    const sample = {
      session_key: 9472,
      driver_number: 16,
      date: '2023-09-02T14:30:01.234000+00:00',
      x: 1234,
      y: -567,
      z: 12,
    };
    expect(RawOpenF1LocationSchema.parse(sample).x).toBe(1234);
  });
});
