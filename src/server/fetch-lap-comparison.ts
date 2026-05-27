import { createServerFn } from '@tanstack/react-start';
import { createOpenF1Client } from '~/lib/openf1/openf1-client';
import {
  FetchLapComparisonInputSchema,
  fetchLapComparisonImpl,
  type FetchLapComparisonInput,
} from './fetch-lap-comparison-impl';

// Server function exposed to the client. Validates with Zod, then orchestrates
// session resolution + raw telemetry fetch + merge/normalize/compare pipeline.
export const fetchLapComparison = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown): FetchLapComparisonInput =>
    FetchLapComparisonInputSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const client = createOpenF1Client();
    return fetchLapComparisonImpl(client, data);
  });
