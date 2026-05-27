import { z } from 'zod';
import type { OpenF1Client } from '~/lib/openf1/openf1-client';
import {
  mapRawDriverToDriverOption,
  mapRawLapToLapOption,
  mapRawSessionToSessionOption,
} from '~/lib/openf1/openf1-mappers';
import { mergeLapSamples } from '~/lib/telemetry/merge-lap-samples';
import { normalizeLapProgress } from '~/lib/telemetry/normalize-lap-progress';
import { buildLapComparisonPayload } from '~/lib/telemetry/build-lap-comparison-payload';
import type {
  DriverOption,
  LapComparisonPayload,
  LapOption,
  SessionOption,
} from '~/lib/contracts';
import type {
  RawOpenF1Driver,
  RawOpenF1Lap,
} from '~/lib/openf1/openf1-types';

const LapPickSchema = z.object({
  driverNumber: z.number().int().positive(),
  lapNumber: z.number().int().min(1),
});

export const FetchLapComparisonInputSchema = z.object({
  sessionKey: z.number().int().positive(),
  lapA: LapPickSchema,
  lapB: LapPickSchema,
});

export type FetchLapComparisonInput = z.infer<
  typeof FetchLapComparisonInputSchema
>;

interface ResolvedLap {
  lap: LapOption;
  dateStart: string;
}

// Orchestrate: validate input, resolve session + drivers + laps, fetch raw
// telemetry per lap window, merge + normalize, then hand off to the payload
// builder. Pure function so it can be unit tested with an in-memory client.
export async function fetchLapComparisonImpl(
  client: OpenF1Client,
  rawInput: FetchLapComparisonInput,
): Promise<LapComparisonPayload> {
  const input = FetchLapComparisonInputSchema.parse(rawInput);
  const session = await resolveSession(client, input.sessionKey);
  const [rawDriversList, rawLapsList] = await Promise.all([
    client.fetchDrivers({ sessionKey: input.sessionKey }),
    client.fetchLaps({ sessionKey: input.sessionKey }),
  ]);

  const driverA = pickDriver(rawDriversList, input.lapA.driverNumber);
  const driverB = pickDriver(rawDriversList, input.lapB.driverNumber);
  const resolvedA = pickLap(rawLapsList, input.lapA);
  const resolvedB = pickLap(rawLapsList, input.lapB);

  const [samplesA, samplesB] = await Promise.all([
    loadNormalizedSamples(client, input.sessionKey, resolvedA),
    loadNormalizedSamples(client, input.sessionKey, resolvedB),
  ]);

  return buildLapComparisonPayload({
    session,
    lapA: { driver: driverA, lap: resolvedA.lap, samples: samplesA },
    lapB: { driver: driverB, lap: resolvedB.lap, samples: samplesB },
  });
}

async function resolveSession(
  client: OpenF1Client,
  sessionKey: number,
): Promise<SessionOption> {
  const sessions = await client.fetchSessions({ sessionKey });
  for (const raw of sessions) {
    const mapped = mapRawSessionToSessionOption(raw);
    if (mapped && mapped.sessionKey === sessionKey) return mapped;
  }
  throw new Error(
    `Session ${sessionKey} not found or is not a Qualifying session`,
  );
}

function pickDriver(
  drivers: ReadonlyArray<RawOpenF1Driver>,
  driverNumber: number,
): DriverOption {
  const raw = drivers.find((d) => d.driver_number === driverNumber);
  if (!raw) throw new Error(`Driver ${driverNumber} not in session`);
  const mapped = mapRawDriverToDriverOption(raw);
  if (!mapped) throw new Error(`Driver ${driverNumber} could not be mapped`);
  return mapped;
}

function pickLap(
  laps: ReadonlyArray<RawOpenF1Lap>,
  pick: { driverNumber: number; lapNumber: number },
): ResolvedLap {
  const fastest = fastestLapForDriver(laps, pick.driverNumber);
  const raw = laps.find(
    (l) => l.driver_number === pick.driverNumber && l.lap_number === pick.lapNumber,
  );
  if (!raw) {
    throw new Error(
      `Lap ${pick.lapNumber} for driver ${pick.driverNumber} not available`,
    );
  }
  const mapped = mapRawLapToLapOption(raw, { fastestForDriver: fastest });
  if (!mapped || raw.date_start === null) {
    throw new Error(
      `Lap ${pick.lapNumber} for driver ${pick.driverNumber} has no recorded time`,
    );
  }
  return { lap: mapped, dateStart: raw.date_start };
}

function fastestLapForDriver(
  laps: ReadonlyArray<RawOpenF1Lap>,
  driverNumber: number,
): number {
  let best = Infinity;
  for (const lap of laps) {
    if (
      lap.driver_number === driverNumber &&
      lap.lap_duration !== null &&
      lap.lap_duration > 0 &&
      lap.lap_duration < best
    ) {
      best = lap.lap_duration;
    }
  }
  return best;
}

async function loadNormalizedSamples(
  client: OpenF1Client,
  sessionKey: number,
  resolved: ResolvedLap,
) {
  const { lap, dateStart } = resolved;
  const endMs = Date.parse(dateStart) + lap.lapDurationSeconds * 1000;
  const lapEnd = new Date(endMs).toISOString();
  const [carData, location] = await Promise.all([
    client.fetchCarData({
      sessionKey,
      driverNumber: lap.driverNumber,
      dateGte: dateStart,
      dateLte: lapEnd,
    }),
    client.fetchLocation({
      sessionKey,
      driverNumber: lap.driverNumber,
      dateGte: dateStart,
      dateLte: lapEnd,
    }),
  ]);
  const merged = mergeLapSamples({
    carData,
    location,
    lapStart: dateStart,
    lapEnd,
  });
  return normalizeLapProgress(merged, lap.lapDurationSeconds);
}
