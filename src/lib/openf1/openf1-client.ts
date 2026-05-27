import { z } from 'zod';
import {
  RawOpenF1CarDataSchema,
  RawOpenF1DriverSchema,
  RawOpenF1LapSchema,
  RawOpenF1LocationSchema,
  RawOpenF1SessionSchema,
  type RawOpenF1CarData,
  type RawOpenF1Driver,
  type RawOpenF1Lap,
  type RawOpenF1Location,
  type RawOpenF1Session,
} from './openf1-types';

const DEFAULT_BASE_URL = 'https://api.openf1.org/v1';

export interface OpenF1ClientOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

export interface FetchSessionsParams {
  year?: number;
  sessionType?: 'Qualifying' | string;
  countryName?: string;
  sessionKey?: number;
}

export interface FetchDriversParams {
  sessionKey: number;
}

export interface FetchLapsParams {
  sessionKey: number;
  driverNumber?: number;
}

export interface FetchTelemetryParams {
  sessionKey: number;
  driverNumber: number;
  dateGte?: string;
  dateLte?: string;
}

export interface OpenF1Client {
  fetchSessions(p: FetchSessionsParams): Promise<RawOpenF1Session[]>;
  fetchDrivers(p: FetchDriversParams): Promise<RawOpenF1Driver[]>;
  fetchLaps(p: FetchLapsParams): Promise<RawOpenF1Lap[]>;
  fetchCarData(p: FetchTelemetryParams): Promise<RawOpenF1CarData[]>;
  fetchLocation(p: FetchTelemetryParams): Promise<RawOpenF1Location[]>;
}

export function createOpenF1Client(
  options: OpenF1ClientOptions = {},
): OpenF1Client {
  const baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '');
  const fetchImpl = options.fetchImpl ?? fetch;

  async function get<T>(
    path: string,
    query: Record<string, string | number | undefined>,
    schema: z.ZodType<T>,
  ): Promise<T[]> {
    const url = buildUrl(baseUrl, path, query);
    const response = await fetchImpl(url);
    if (!response.ok) {
      throw new Error(
        `OpenF1 ${path} failed: HTTP ${response.status} ${response.statusText}`,
      );
    }
    const json = (await response.json()) as unknown;
    if (!Array.isArray(json)) {
      throw new Error(`OpenF1 ${path}: expected array response`);
    }
    return json.map((item) => schema.parse(item));
  }

  return {
    fetchSessions: ({ year, sessionType, countryName, sessionKey }) =>
      get(
        '/sessions',
        {
          session_type: sessionType,
          year,
          country_name: countryName,
          session_key: sessionKey,
        },
        RawOpenF1SessionSchema,
      ),
    fetchDrivers: ({ sessionKey }) =>
      get('/drivers', { session_key: sessionKey }, RawOpenF1DriverSchema),
    fetchLaps: ({ sessionKey, driverNumber }) =>
      get(
        '/laps',
        { session_key: sessionKey, driver_number: driverNumber },
        RawOpenF1LapSchema,
      ),
    fetchCarData: ({ sessionKey, driverNumber, dateGte, dateLte }) =>
      get(
        '/car_data',
        {
          session_key: sessionKey,
          driver_number: driverNumber,
          'date>=': dateGte,
          'date<=': dateLte,
        },
        RawOpenF1CarDataSchema,
      ),
    fetchLocation: ({ sessionKey, driverNumber, dateGte, dateLte }) =>
      get(
        '/location',
        {
          session_key: sessionKey,
          driver_number: driverNumber,
          'date>=': dateGte,
          'date<=': dateLte,
        },
        RawOpenF1LocationSchema,
      ),
  };
}

// Build a deterministic query string. Drops undefined values, sorts keys so
// that tests can assert exact URLs. OpenF1 uses operator-bearing keys like
// `date>=value` (no `=` separator after the operator); those are emitted
// verbatim, while regular keys use the normal `key=value` form.
const OPERATOR_KEY = /^(.+?)(>=|<=|>|<)$/;

function buildUrl(
  base: string,
  path: string,
  query: Record<string, string | number | undefined>,
): string {
  const entries = Object.entries(query)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  if (entries.length === 0) return `${base}${path}`;
  const qs = entries
    .map(([key, value]) => {
      const encodedValue = encodeURIComponent(String(value));
      const match = OPERATOR_KEY.exec(key);
      if (match) {
        return `${match[1]}${match[2]}${encodedValue}`;
      }
      return `${encodeURIComponent(key)}=${encodedValue}`;
    })
    .join('&');
  return `${base}${path}?${qs}`;
}
