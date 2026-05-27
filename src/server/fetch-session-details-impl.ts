import { z } from 'zod';
import type { OpenF1Client } from '~/lib/openf1/openf1-client';
import {
  mapRawDriverToDriverOption,
  mapRawLapToLapOption,
  mapRawSessionToSessionOption,
} from '~/lib/openf1/openf1-mappers';
import type {
  DriverOption,
  LapOption,
  SessionOption,
} from '~/lib/contracts';

export const FetchSessionDetailsInputSchema = z.object({
  sessionKey: z.number().int().positive(),
});

export type FetchSessionDetailsInput = z.infer<
  typeof FetchSessionDetailsInputSchema
>;

export interface SessionDetailsPayload {
  session: SessionOption;
  drivers: DriverOption[];
  laps: LapOption[];
}

// Resolve drivers + valid laps for a session so the compare UI can populate
// its selectors without an extra round-trip per driver.
export async function fetchSessionDetailsImpl(
  client: OpenF1Client,
  rawInput: FetchSessionDetailsInput,
): Promise<SessionDetailsPayload> {
  const input = FetchSessionDetailsInputSchema.parse(rawInput);
  const [rawSessions, rawDrivers, rawLaps] = await Promise.all([
    client.fetchSessions({ sessionKey: input.sessionKey }),
    client.fetchDrivers({ sessionKey: input.sessionKey }),
    client.fetchLaps({ sessionKey: input.sessionKey }),
  ]);

  const session = rawSessions
    .map(mapRawSessionToSessionOption)
    .find(
      (s): s is SessionOption =>
        s !== null && s.sessionKey === input.sessionKey,
    );
  if (!session) {
    throw new Error(`Session ${input.sessionKey} not found`);
  }

  const drivers: DriverOption[] = [];
  for (const raw of rawDrivers) {
    const mapped = mapRawDriverToDriverOption(raw);
    if (mapped) drivers.push(mapped);
  }
  drivers.sort((a, b) => a.driverNumber - b.driverNumber);

  // Precompute fastest lap per driver so isPersonalBest is set correctly.
  const fastestByDriver = new Map<number, number>();
  for (const raw of rawLaps) {
    if (raw.lap_duration !== null && raw.lap_duration > 0) {
      const current = fastestByDriver.get(raw.driver_number) ?? Infinity;
      if (raw.lap_duration < current) {
        fastestByDriver.set(raw.driver_number, raw.lap_duration);
      }
    }
  }
  const laps: LapOption[] = [];
  for (const raw of rawLaps) {
    const mapped = mapRawLapToLapOption(raw, {
      fastestForDriver:
        fastestByDriver.get(raw.driver_number) ?? Infinity,
    });
    if (mapped) laps.push(mapped);
  }
  // Sort by driver then lap number — selectors group by driver visually.
  laps.sort((a, b) => {
    if (a.driverNumber !== b.driverNumber) {
      return a.driverNumber - b.driverNumber;
    }
    return a.lapNumber - b.lapNumber;
  });

  return { session, drivers, laps };
}
