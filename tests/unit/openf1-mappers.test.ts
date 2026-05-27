import { describe, expect, it } from 'vitest';
import {
  mapRawSessionToSessionOption,
  mapRawDriverToDriverOption,
  mapRawLapToLapOption,
} from '~/lib/openf1/openf1-mappers';

describe('mapRawSessionToSessionOption', () => {
  it('keeps only Qualifying sessions and renames fields to camelCase', () => {
    const result = mapRawSessionToSessionOption({
      session_key: 9472,
      session_name: 'Qualifying',
      session_type: 'Qualifying',
      meeting_key: 1217,
      circuit_short_name: 'Monza',
      country_name: 'Italy',
      year: 2023,
      date_start: '2023-09-02T14:00:00+00:00',
    });
    expect(result).toEqual({
      sessionKey: 9472,
      sessionName: 'Qualifying',
      sessionType: 'Qualifying',
      meetingKey: 1217,
      circuitShortName: 'Monza',
      countryName: 'Italy',
      year: 2023,
      dateStart: '2023-09-02T14:00:00+00:00',
    });
  });

  it('returns null for non-Qualifying sessions (filtered upstream)', () => {
    const result = mapRawSessionToSessionOption({
      session_key: 1,
      session_name: 'Race',
      session_type: 'Race',
      meeting_key: 1,
      circuit_short_name: 'Monza',
      country_name: 'Italy',
      year: 2023,
      date_start: '2023-09-02T14:00:00+00:00',
    });
    expect(result).toBeNull();
  });
});

describe('mapRawDriverToDriverOption', () => {
  it('uses given acronym when 3 uppercase letters', () => {
    const result = mapRawDriverToDriverOption({
      driver_number: 16,
      name_acronym: 'LEC',
      full_name: 'Charles LECLERC',
      team_name: 'Ferrari',
      team_colour: 'F91536',
      session_key: 9472,
      meeting_key: 1217,
    });
    expect(result).toEqual({
      driverNumber: 16,
      nameAcronym: 'LEC',
      fullName: 'Charles LECLERC',
      teamName: 'Ferrari',
      teamColour: 'F91536',
    });
  });

  it('normalizes mixed-case acronyms to uppercase', () => {
    const result = mapRawDriverToDriverOption({
      driver_number: 16,
      name_acronym: 'Lec',
      full_name: 'Charles LECLERC',
      team_name: 'Ferrari',
      session_key: 9472,
      meeting_key: 1217,
    });
    expect(result?.nameAcronym).toBe('LEC');
  });

  it('omits team_colour when raw has none', () => {
    const result = mapRawDriverToDriverOption({
      driver_number: 16,
      name_acronym: 'LEC',
      full_name: 'Charles LECLERC',
      team_name: 'Ferrari',
      session_key: 9472,
      meeting_key: 1217,
    });
    expect(result?.teamColour).toBeUndefined();
  });
});

describe('mapRawLapToLapOption', () => {
  const baseRaw = {
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

  it('maps a completed lap', () => {
    const result = mapRawLapToLapOption(baseRaw, { fastestForDriver: 80.143 });
    expect(result).toEqual({
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
    });
  });

  it('returns null when lap_duration is null (in-lap / no time)', () => {
    expect(
      mapRawLapToLapOption(
        { ...baseRaw, lap_duration: null },
        { fastestForDriver: 80 },
      ),
    ).toBeNull();
  });

  it('marks isOutlap when is_pit_out_lap is true', () => {
    const result = mapRawLapToLapOption(
      { ...baseRaw, is_pit_out_lap: true },
      { fastestForDriver: 80.143 },
    );
    expect(result?.isOutlap).toBe(true);
  });

  it('isPersonalBest false when slower than fastestForDriver', () => {
    const result = mapRawLapToLapOption(
      { ...baseRaw, lap_duration: 81.5 },
      { fastestForDriver: 80.143 },
    );
    expect(result?.isPersonalBest).toBe(false);
  });
});
