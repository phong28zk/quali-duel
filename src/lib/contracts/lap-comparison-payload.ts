import { z } from 'zod';
import { SessionOptionSchema } from './session-option';
import { DriverOptionSchema } from './driver-option';
import { LapOptionSchema } from './lap-option';
import { NormalizedTelemetrySampleSchema } from './telemetry-sample';

const LapSidePayloadSchema = z.object({
  driver: DriverOptionSchema,
  lap: LapOptionSchema,
  samples: z.array(NormalizedTelemetrySampleSchema).min(1),
});

const DeltaPointSchema = z.object({
  progress: z.number().min(0).max(1),
  deltaSeconds: z.number(),
});

const SummarySchema = z.object({
  totalDeltaSeconds: z.number(),
  maxGainAtProgress: z.number().min(0).max(1),
  maxLossAtProgress: z.number().min(0).max(1),
});

export const LapComparisonPayloadSchema = z
  .object({
    session: SessionOptionSchema,
    lapA: LapSidePayloadSchema,
    lapB: LapSidePayloadSchema,
    deltaSeries: z.array(DeltaPointSchema).min(2),
    summary: SummarySchema,
  })
  .superRefine((value, ctx) => {
    if (value.lapA.lap.sessionKey !== value.session.sessionKey) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['lapA', 'lap', 'sessionKey'],
        message: 'lapA must belong to the chosen session',
      });
    }
    if (value.lapB.lap.sessionKey !== value.session.sessionKey) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['lapB', 'lap', 'sessionKey'],
        message: 'lapB must belong to the chosen session',
      });
    }
    for (let i = 1; i < value.deltaSeries.length; i++) {
      const prev = value.deltaSeries[i - 1]!;
      const cur = value.deltaSeries[i]!;
      if (cur.progress < prev.progress) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['deltaSeries', i, 'progress'],
          message: 'deltaSeries progress must be monotonically non-decreasing',
        });
        break;
      }
    }
  });

export type LapComparisonPayload = z.infer<typeof LapComparisonPayloadSchema>;
