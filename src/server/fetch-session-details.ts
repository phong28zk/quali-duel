import { createServerFn } from '@tanstack/react-start';
import { createOpenF1Client } from '~/lib/openf1/openf1-client';
import {
  FetchSessionDetailsInputSchema,
  fetchSessionDetailsImpl,
  type FetchSessionDetailsInput,
} from './fetch-session-details-impl';

// Server function returning drivers + valid laps for a chosen session.
// Used by the compare route loader to drive its selectors.
export const fetchSessionDetails = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown): FetchSessionDetailsInput =>
    FetchSessionDetailsInputSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const client = createOpenF1Client();
    return fetchSessionDetailsImpl(client, data);
  });
