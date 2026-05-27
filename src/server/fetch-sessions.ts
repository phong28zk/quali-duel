import { createServerFn } from '@tanstack/react-start';
import { createOpenF1Client } from '~/lib/openf1/openf1-client';
import {
  FetchSessionsInputSchema,
  fetchSessionsImpl,
  type FetchSessionsInput,
} from './fetch-sessions-impl';

// Server function exposed to the client. Validates input with Zod, then
// delegates to the testable impl. The OpenF1 client is constructed per call
// so we honour Cloudflare Workers' isolate model (no module-scope fetch).
export const fetchSessions = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown): FetchSessionsInput =>
    FetchSessionsInputSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const client = createOpenF1Client();
    return fetchSessionsImpl(client, data);
  });
