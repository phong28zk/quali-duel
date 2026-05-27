import { z } from 'zod';

export const LapOptionSchema = z.object({
  sessionKey: z.number().int().positive(),
  driverNumber: z.number().int().positive(),
  lapNumber: z.number().int().min(1),
  lapDurationSeconds: z.number().positive(),
  sector1Seconds: z.number().positive().optional(),
  sector2Seconds: z.number().positive().optional(),
  sector3Seconds: z.number().positive().optional(),
  isPersonalBest: z.boolean(),
  isOutlap: z.boolean(),
  isInlap: z.boolean(),
});

export type LapOption = z.infer<typeof LapOptionSchema>;
