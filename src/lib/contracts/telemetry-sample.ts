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
});

export type NormalizedTelemetrySample = z.infer<
  typeof NormalizedTelemetrySampleSchema
>;
