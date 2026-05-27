import type {
  RawOpenF1Driver,
  RawOpenF1Lap,
  RawOpenF1Session,
} from './openf1-types';
import type {
  DriverOption,
  LapOption,
  SessionOption,
} from '~/lib/contracts';

// Translate raw OpenF1 records into app-domain contracts.
// Filtering by session type and lap completeness happens here so the rest of
// the pipeline sees only well-formed records.

export function mapRawSessionToSessionOption(
  raw: RawOpenF1Session,
): SessionOption | null {
  if (raw.session_type !== 'Qualifying') return null;
  return {
    sessionKey: raw.session_key,
    sessionName: raw.session_name,
    sessionType: 'Qualifying',
    meetingKey: raw.meeting_key,
    circuitShortName: raw.circuit_short_name,
    countryName: raw.country_name,
    year: raw.year,
    dateStart: raw.date_start,
  };
}

export function mapRawDriverToDriverOption(
  raw: RawOpenF1Driver,
): DriverOption | null {
  const acronym = raw.name_acronym.toUpperCase();
  if (!/^[A-Z]{3}$/.test(acronym)) return null;
  return {
    driverNumber: raw.driver_number,
    nameAcronym: acronym,
    fullName: raw.full_name,
    teamName: raw.team_name,
    ...(raw.team_colour ? { teamColour: raw.team_colour } : {}),
  };
}

export interface LapMapContext {
  // Fastest lap_duration recorded for the driver in this session — used to
  // flag personal best without re-scanning the lap list per item.
  fastestForDriver: number;
}

export function mapRawLapToLapOption(
  raw: RawOpenF1Lap,
  ctx: LapMapContext,
): LapOption | null {
  if (raw.lap_duration === null || raw.lap_duration <= 0) return null;
  const isOutlap = raw.is_pit_out_lap === true;
  return {
    sessionKey: raw.session_key,
    driverNumber: raw.driver_number,
    lapNumber: raw.lap_number,
    lapDurationSeconds: raw.lap_duration,
    ...(raw.duration_sector_1 != null && raw.duration_sector_1 > 0
      ? { sector1Seconds: raw.duration_sector_1 }
      : {}),
    ...(raw.duration_sector_2 != null && raw.duration_sector_2 > 0
      ? { sector2Seconds: raw.duration_sector_2 }
      : {}),
    ...(raw.duration_sector_3 != null && raw.duration_sector_3 > 0
      ? { sector3Seconds: raw.duration_sector_3 }
      : {}),
    isPersonalBest: Math.abs(raw.lap_duration - ctx.fastestForDriver) < 1e-6,
    isOutlap,
    isInlap: false,
  };
}
