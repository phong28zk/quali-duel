import { z } from 'zod';
import type { OpenF1Client } from '~/lib/openf1/openf1-client';
import { mapRawSessionToSessionOption } from '~/lib/openf1/openf1-mappers';
import type { SessionOption } from '~/lib/contracts';

export const FetchSessionsInputSchema = z.object({
  year: z.number().int().min(2018).max(2100),
  countryName: z.string().min(1).optional(),
});

export type FetchSessionsInput = z.infer<typeof FetchSessionsInputSchema>;

// Pure orchestration: fetch raw sessions, filter to Qualifying via the mapper,
// sort newest-first so the UI selector shows the most recent weekend on top.
export async function fetchSessionsImpl(
  client: OpenF1Client,
  rawInput: FetchSessionsInput,
): Promise<SessionOption[]> {
  const input = FetchSessionsInputSchema.parse(rawInput);
  const raw = await client.fetchSessions({
    year: input.year,
    sessionType: 'Qualifying',
    ...(input.countryName ? { countryName: input.countryName } : {}),
  });
  const sessions: SessionOption[] = [];
  for (const item of raw) {
    const mapped = mapRawSessionToSessionOption(item);
    if (mapped) sessions.push(mapped);
  }
  sessions.sort((a, b) => (a.dateStart < b.dateStart ? 1 : -1));
  return sessions;
}
