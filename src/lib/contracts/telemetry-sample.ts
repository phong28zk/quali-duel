import { z } from 'zod';

export const NormalizedTelemetrySampleSchema = z.object({
  progress: z.number().min(0).max(1),
  timeSeconds: z.number().min(0),
  speedKph: z.number().min(0),
  throttlePct: z.number().min(0).max(100),
  brakePct: z.number().min(0).max(100),
  gear: z.number().int().min(0).max(8),
  rpm: z.number().min(0),
  drs: z.number().int().min(0),
  // Track position carried through from the merged location stream so the UI
  // can draw the racing line without re-fetching telemetry.
  x: z.number().optional(),
  y: z.number().optional(),
});

export type NormalizedTelemetrySample = z.infer<
  typeof NormalizedTelemetrySampleSchema
>;
